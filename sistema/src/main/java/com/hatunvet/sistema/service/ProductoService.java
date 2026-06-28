package com.hatunvet.sistema.service;

import com.hatunvet.sistema.model.Producto;
import com.hatunvet.sistema.repository.ProductoRepository;
import com.hatunvet.sistema.repository.ProveedorRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
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
    public List<Producto> listarServiciosActivos() {
        return productoRepository.findByEsServicioTrueAndEstadoTrue();
    }

    @Transactional(readOnly = true)
    public Optional<Producto> obtenerPorId(String id) {
        return productoRepository.findById(id);
    }

    @Transactional
    public Producto guardar(Producto producto, MultipartFile imagenFile) {
        // Limpiamos espacios y forzamos código a mayúsculas
        producto.setCodigo(producto.getCodigo().trim().toUpperCase());
        producto.setNombre(producto.getNombre().trim());

        // VALIDACIÓN 4: Evitar precios negativos y stock inválido
        if (producto.getPrecio() == null || producto.getPrecio().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El precio debe ser mayor a 0.");
        }
        if (producto.getStock() < 0) {
            throw new IllegalArgumentException("El stock inicial no puede ser negativo.");
        }

        if (producto.isFraccionable()) {
            if (producto.getUnidadMedida() == null || producto.getUnidadMedida().trim().isEmpty()) {
                throw new IllegalArgumentException("La unidad de medida es obligatoria para productos fraccionables.");
            }
            if (producto.getCapacidadTotal() == null || producto.getCapacidadTotal().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("La capacidad total debe ser mayor a 0.");
            }
            if (producto.getPrecioFraccionado() == null || producto.getPrecioFraccionado().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("El precio fraccionado debe ser mayor a 0.");
            }
            if (producto.getStockFraccionado() == null) {
                producto.setStockFraccionado(BigDecimal.ZERO);
            }
        } else {
            producto.setUnidadMedida(null);
            producto.setCapacidadTotal(null);
            producto.setPrecioFraccionado(null);
            producto.setStockFraccionado(BigDecimal.ZERO);
        }

        // VALIDACIÓN 2: Evitar códigos duplicados
        Optional<Producto> existente = productoRepository.findByCodigoIgnoreCase(producto.getCodigo());
        if (existente.isPresent() && !existente.get().getId().equals(producto.getId())) {
            throw new IllegalArgumentException("El código '" + producto.getCodigo() + "' ya existe en el sistema.");
        }

        if (imagenFile != null && !imagenFile.isEmpty()) {
            String nombreImagen = fileStorageService.guardarArchivo(imagenFile);
            producto.setImagen(nombreImagen);
        } else if (producto.getId() != null) {
            productoRepository.findById(producto.getId()).ifPresent(p -> {
                if (producto.getImagen() == null) producto.setImagen(p.getImagen());
                if (producto.getProveedor() == null) producto.setProveedor(p.getProveedor());
            });
        }

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
        try {
            Optional<Producto> productoOpt = productoRepository.findById(id);
            if (productoOpt.isPresent()) {
                Producto producto = productoOpt.get();
                if (producto.getImagen() != null) {
                    fileStorageService.eliminarArchivo(producto.getImagen());
                }
                productoRepository.deleteById(id);
                return true;
            }
            return false;
        } catch (DataIntegrityViolationException e) {
            // VALIDACIÓN 3: Proteger historial de ventas e inventario
            throw new RuntimeException("No se puede eliminar el producto porque ya tiene ventas o historial de inventario asociado.");
        }
    }
}