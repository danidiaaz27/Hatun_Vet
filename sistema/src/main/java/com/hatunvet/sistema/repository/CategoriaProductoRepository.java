package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.CategoriaProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoriaProductoRepository extends JpaRepository<CategoriaProducto, String> {
    // Para mostrarlas en orden alfabético
    List<CategoriaProducto> findAllByOrderByNombreAsc();
}