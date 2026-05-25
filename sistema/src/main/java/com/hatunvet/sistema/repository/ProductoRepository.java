package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, String> {

    Optional<Producto> findByCodigo(String codigo);

    // VALIDACIÓN 2: Para buscar duplicados ignorando mayúsculas/minúsculas
    Optional<Producto> findByCodigoIgnoreCase(String codigo);

    List<Producto> findAllByOrderByNombreAsc();

    List<Producto> findByEstadoTrue();

    List<Producto> findByStockLessThanEqualAndEstadoTrueOrderByStockAsc(int stockCritico);
}