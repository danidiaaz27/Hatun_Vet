package com.hatunvet.sistema.service;

import com.hatunvet.sistema.model.Producto;
import com.hatunvet.sistema.repository.ProductoRepository;
import com.hatunvet.sistema.repository.ProveedorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final ProveedorRepository proveedorRepository;
    private final FileStorageService fileStorageService;

    public ProductoService(ProductoRepository productoRepository, ProveedorRepository proveedorRepository, FileStorageService fileStorageService) {
        this.productoRepository = productoRepository;
        this.proveedorRepository = proveedorRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public List<Producto> listarTodos() {
        return productoRepository.findAllByOrderByNombreAsc();
    }

    @Transactional(readOnly = true)
    public Optional<Producto> obtenerPorId(String id) {
        return productoRepository.findById(id);
    }

    @Transactional
    public Producto guardar(Producto producto, MultipartFile imagenFile) {
        if (imagenFile != null && !imagenFile.isEmpty()) {
            String nombreImagen = fileStorageService.guardarArchivo(imagenFile);
            producto.setImagen(nombreImagen);
        } else if (producto.getId() != null) {
            productoRepository.findById(producto.getId()).ifPresent(p -> {
                if (producto.getImagen() == null) producto.setImagen(p.getImagen());
                if (producto.getProveedor() == null) producto.setProveedor(p.getProveedor());
            });
        }
        
        // Si el proveedor viene con ID pero sin otros datos, buscar el proveedor completo
        if (producto.getProveedor() != null && producto.getProveedor().getId() != null) {
            proveedorRepository.findById(producto.getProveedor().getId()).ifPresent(producto::setProveedor);
        }
        
        return productoRepository.save(producto);
    }

    @Transactional
    public boolean cambiarEstado(String id) {
        return productoRepository.findById(id).map(p -> {
            p.setEstado(!p.isEstado());
            productoRepository.save(p);
            return true;
        }).orElse(false);
    }

    @Transactional
    public boolean eliminar(String id) {
        Optional<Producto> productoOpt = productoRepository.findById(id);
        if (productoOpt.isPresent()) {
            Producto producto = productoOpt.get();
            fileStorageService.eliminarArchivo(producto.getImagen());
            productoRepository.deleteById(id);
            return true;
        }
        return false;
    }
}