package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.CategoriaProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaProductoRepository extends JpaRepository<CategoriaProducto, String> {

    // Para mostrarlas en orden alfabético
    List<CategoriaProducto> findAllByOrderByNombreAsc();

    // VALIDACIÓN 1: Buscar si ya existe una categoría con ese nombre (ignorando mayúsculas)
    Optional<CategoriaProducto> findByNombreIgnoreCase(String nombre);
}