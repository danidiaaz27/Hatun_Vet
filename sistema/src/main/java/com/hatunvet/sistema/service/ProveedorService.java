package com.hatunvet.sistema.service;

import com.hatunvet.sistema.model.Proveedor;
import com.hatunvet.sistema.repository.ProveedorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;

    public ProveedorService(ProveedorRepository proveedorRepository) {
        this.proveedorRepository = proveedorRepository;
    }

    @Transactional(readOnly = true)
    public List<Proveedor> listarTodos() {
        return proveedorRepository.findAllByOrderByNombreAsc();
    }

    @Transactional(readOnly = true)
    public Optional<Proveedor> obtenerPorId(Integer id) {
        return proveedorRepository.findById(id);
    }

    @Transactional
    public Proveedor guardar(Proveedor proveedor) {
        // Validaciones básicas
        if (proveedor.getNombre() == null || proveedor.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del proveedor es requerido");
        }
        if (proveedor.getRuc() == null || proveedor.getRuc().trim().isEmpty()) {
            throw new IllegalArgumentException("El RUC es requerido");
        }
        if (proveedor.getRuc().length() != 11) {
            throw new IllegalArgumentException("El RUC debe tener 11 dígitos");
        }
        
        // Validar RUC único
        Optional<Proveedor> existente = proveedorRepository.findByRuc(proveedor.getRuc());
        if (existente.isPresent() && (proveedor.getId() == null || !existente.get().getId().equals(proveedor.getId()))) {
            throw new IllegalArgumentException("Ya existe un proveedor con ese RUC");
        }
        
        return proveedorRepository.save(proveedor);
    }

    @Transactional
    public boolean cambiarEstado(Integer id) {
        return proveedorRepository.findById(id).map(proveedor -> {
            proveedor.setEstado(!proveedor.isEstado());
            proveedorRepository.save(proveedor);
            return true;
        }).orElse(false);
    }

    @Transactional
    public boolean eliminar(Integer id) {
        if (proveedorRepository.existsById(id)) {
            proveedorRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
