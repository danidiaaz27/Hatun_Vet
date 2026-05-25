package com.hatunvet.sistema.service;

import com.hatunvet.sistema.model.CategoriaProducto;
import com.hatunvet.sistema.repository.CategoriaProductoRepository;
import org.springframework.dao.DataIntegrityViolationException;
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
        // Limpiamos espacios en blanco accidentales
        String nombreLimpio = categoria.getNombre().trim();

        if (nombreLimpio.isEmpty()) {
            throw new IllegalArgumentException("El nombre de la categoría no puede estar vacío.");
        }

        // VALIDACIÓN 1: Verificar duplicados
        Optional<CategoriaProducto> existente = categoriaRepository.findByNombreIgnoreCase(nombreLimpio);
        if (existente.isPresent() && !existente.get().getId().equals(categoria.getId())) {
            throw new IllegalArgumentException("Ya existe una categoría con el nombre: " + nombreLimpio);
        }

        categoria.setNombre(nombreLimpio);

        if (categoria.getId() == null || categoria.getId().isEmpty()) {
            categoria.setEstado(true); // Activo por defecto al crear
        }
        return categoriaRepository.save(categoria);
    }

    @Transactional
    public boolean eliminarCategoria(String id) {
        try {
            if (categoriaRepository.existsById(id)) {
                categoriaRepository.deleteById(id);
                return true;
            }
            return false;
        } catch (DataIntegrityViolationException e) {
            // VALIDACIÓN 2: Proteger contra la eliminación de categorías en uso
            throw new RuntimeException("No se puede eliminar la categoría porque existen productos vinculados a ella.");
        }
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