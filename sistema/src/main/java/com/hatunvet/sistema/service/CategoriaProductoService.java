package com.hatunvet.sistema.service;

import com.hatunvet.sistema.model.CategoriaProducto;
import com.hatunvet.sistema.repository.CategoriaProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaProductoService {

    private final CategoriaProductoRepository categoriaRepository;

    public CategoriaProductoService(CategoriaProductoRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoriaProducto> listarCategorias() {
        return categoriaRepository.findAllByOrderByNombreAsc();
    }

    @Transactional(readOnly = true)
    public Optional<CategoriaProducto> obtenerCategoriaPorId(String id) {
        return categoriaRepository.findById(id);
    }

    @Transactional
    public CategoriaProducto guardarCategoria(CategoriaProducto categoria) {
        if (categoria.getId() == null || categoria.getId().isEmpty()) {
            categoria.setEstado(true); // Activo por defecto al crear
        }
        return categoriaRepository.save(categoria);
    }

    @Transactional
    public boolean eliminarCategoria(String id) {
        if (categoriaRepository.existsById(id)) {
            categoriaRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Transactional
    public boolean cambiarEstado(String id) {
        return categoriaRepository.findById(id).map(categoria -> {
            categoria.setEstado(!categoria.isEstado());
            categoriaRepository.save(categoria);
            return true;
        }).orElse(false);
    }
}