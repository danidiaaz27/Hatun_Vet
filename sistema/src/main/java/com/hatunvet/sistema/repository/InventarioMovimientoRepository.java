package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.InventarioMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventarioMovimientoRepository extends JpaRepository<InventarioMovimiento, Long> {

    // Este método alimentará la pestaña "Kardex (Movimientos)" de tu captura
    List<InventarioMovimiento> findByProductoIdOrderByFechaRegistroDesc(String productoId);
}