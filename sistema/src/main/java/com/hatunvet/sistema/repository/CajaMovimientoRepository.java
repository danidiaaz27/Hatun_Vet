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

    // CORREGIDO: antes esta consulta buscaba en TODAS las sesiones (abiertas y
    // cerradas, de cualquier fecha), lo que mezclaba movimientos de sesiones ya
    // cerradas con el balance de la sesión actual. Ahora el Monitor de Caja
    // solo filtra dentro de la sesión activa, igual que /api/estado.
    @Query("SELECT m FROM CajaMovimiento m WHERE " +
           "m.sesion.id = :sesionId AND " +
           "(:fechaDesde IS NULL OR m.fechaMovimiento >= :fechaDesde) AND " +
           "(:fechaHasta IS NULL OR m.fechaMovimiento <= :fechaHasta) AND " +
           "(:tipo IS NULL OR :tipo = '' OR m.tipo = :tipo) AND " +
           "(:medioPago IS NULL OR :medioPago = '' OR m.medioPago = :medioPago) " +
           "ORDER BY m.fechaMovimiento DESC")
    List<CajaMovimiento> filtrarMovimientosMonitor(
           @Param("sesionId") String sesionId,
           @Param("fechaDesde") LocalDateTime fechaDesde,
           @Param("fechaHasta") LocalDateTime fechaHasta,
           @Param("tipo") String tipo,
           @Param("medioPago") String medioPago);
}