package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.CajaMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CajaMovimientoRepository extends JpaRepository<CajaMovimiento, Integer> {
    
    List<CajaMovimiento> findBySesionIdOrderByFechaMovimientoDesc(String sesionId);

    // NUEVO: Consulta dinámica para el Monitor de Caja (Filtros)
    @Query("SELECT m FROM CajaMovimiento m WHERE " +
           "(:fechaDesde IS NULL OR m.fechaMovimiento >= :fechaDesde) AND " +
           "(:fechaHasta IS NULL OR m.fechaMovimiento <= :fechaHasta) AND " +
           "(:tipo IS NULL OR :tipo = '' OR m.tipo = :tipo) AND " +
           "(:medioPago IS NULL OR :medioPago = '' OR m.medioPago = :medioPago) " +
           "ORDER BY m.fechaMovimiento DESC")
    List<CajaMovimiento> filtrarMovimientosMonitor(
           @Param("fechaDesde") LocalDateTime fechaDesde,
           @Param("fechaHasta") LocalDateTime fechaHasta,
           @Param("tipo") String tipo,
           @Param("medioPago") String medioPago);
}