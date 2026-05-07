package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional; // <-- Importación necesaria para el Optional

@Repository
public interface ProductoRepository extends JpaRepository<Producto, String> {

    // Ahora sí, envuelto en Optional para que el VentaService sea feliz
    Optional<Producto> findByCodigo(String codigo);

    List<Producto> findAllByOrderByNombreAsc();

    List<Producto> findByEstadoTrue();

    List<Producto> findByStockLessThanEqualAndEstadoTrueOrderByStockAsc(int stockCritico);
}