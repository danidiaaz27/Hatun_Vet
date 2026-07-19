package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, String> {

    List<Venta> findAllByOrderByFechaEmisionDesc();

    // NUEVO: correlativo independiente por serie (F001, B001, NV01), en vez de un
    // contador global que mezclaba Boletas, Facturas y Notas de Venta.
    long countBySerie(String serie);

    // Sincronizado para devolver BigDecimal (Punto 4)
    @Query("SELECT COALESCE(SUM(v.total), 0) FROM Venta v WHERE DATE(v.fechaEmision) = CURRENT_DATE AND v.estado != 'ANULADO'")
    BigDecimal sumVentasHoy();

    @Query("SELECT COALESCE(SUM(v.total), 0) FROM Venta v WHERE MONTH(v.fechaEmision) = MONTH(CURRENT_DATE) AND YEAR(v.fechaEmision) = YEAR(CURRENT_DATE) AND v.estado != 'ANULADO'")
    BigDecimal sumVentasMes();

    // El COUNT en JPQL siempre devuelve un Long
    @Query("SELECT COUNT(v) FROM Venta v WHERE MONTH(v.fechaEmision) = MONTH(CURRENT_DATE) AND YEAR(v.fechaEmision) = YEAR(CURRENT_DATE) AND v.estado != 'ANULADO'")
    Long countVentasMes();

    @Query("SELECT v FROM Venta v WHERE v.clienteDocumento = :numDoc ORDER BY v.fechaEmision DESC")
    List<Venta> findByNumDocOrderByFechaEmisionDesc(@Param("numDoc") String numDoc);
}