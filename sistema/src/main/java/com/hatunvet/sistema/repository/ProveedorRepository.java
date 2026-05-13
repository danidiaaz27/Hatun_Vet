package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Integer> {

    List<Proveedor> findAllByOrderByNombreAsc();

    Optional<Proveedor> findByRuc(String ruc);
}
