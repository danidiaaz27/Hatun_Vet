package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.Venta;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, String> {

    List<Venta> findAllByOrderByFechaEmisionDesc();

    long countBySerie(String serie);

    @Query("SELECT COALESCE(SUM(v.total), 0) FROM Venta v WHERE DATE(v.fechaEmision) = CURRENT_DATE AND v.estado != 'ANULADO'")
    BigDecimal sumVentasHoy();

    @Query("SELECT COALESCE(SUM(v.total), 0) FROM Venta v WHERE MONTH(v.fechaEmision) = MONTH(CURRENT_DATE) AND YEAR(v.fechaEmision) = YEAR(CURRENT_DATE) AND v.estado != 'ANULADO'")
    BigDecimal sumVentasMes();

    @Query("SELECT COUNT(v) FROM Venta v WHERE MONTH(v.fechaEmision) = MONTH(CURRENT_DATE) AND YEAR(v.fechaEmision) = YEAR(CURRENT_DATE) AND v.estado != 'ANULADO'")
    Long countVentasMes();

    @Query("SELECT v FROM Venta v WHERE v.clienteDocumento = :numDoc ORDER BY v.fechaEmision DESC")
    List<Venta> findByNumDocOrderByFechaEmisionDesc(@Param("numDoc") String numDoc);

    // Usado SOLO para exportar (Excel/PDF): trae TODO lo filtrado, sin paginar.
    @Query("SELECT v FROM Venta v WHERE " +
           "(:fechaDesde IS NULL OR v.fechaEmision >= :fechaDesde) AND " +
           "(:fechaHasta IS NULL OR v.fechaEmision <= :fechaHasta) AND " +
           "(:tipoComprobante IS NULL OR :tipoComprobante = '' OR v.tipoComprobante = :tipoComprobante) AND " +
           "(:estado IS NULL OR :estado = '' OR v.estado = :estado) " +
           "ORDER BY v.fechaEmision DESC")
    List<Venta> filtrarReporteVentas(@Param("fechaDesde") LocalDateTime fechaDesde,
                                      @Param("fechaHasta") LocalDateTime fechaHasta,
                                      @Param("tipoComprobante") String tipoComprobante,
                                      @Param("estado") String estado);

    // NUEVO: versión paginada (máx. "size" registros por página) para la tabla visible.
    @Query("SELECT v FROM Venta v WHERE " +
           "(:fechaDesde IS NULL OR v.fechaEmision >= :fechaDesde) AND " +
           "(:fechaHasta IS NULL OR v.fechaEmision <= :fechaHasta) AND " +
           "(:tipoComprobante IS NULL OR :tipoComprobante = '' OR v.tipoComprobante = :tipoComprobante) AND " +
           "(:estado IS NULL OR :estado = '' OR v.estado = :estado) " +
           "ORDER BY v.fechaEmision DESC")
    List<Venta> filtrarReporteVentasPaginado(@Param("fechaDesde") LocalDateTime fechaDesde,
                                              @Param("fechaHasta") LocalDateTime fechaHasta,
                                              @Param("tipoComprobante") String tipoComprobante,
                                              @Param("estado") String estado,
                                              Pageable pageable);

    @Query("SELECT COUNT(v) FROM Venta v WHERE " +
           "(:fechaDesde IS NULL OR v.fechaEmision >= :fechaDesde) AND " +
           "(:fechaHasta IS NULL OR v.fechaEmision <= :fechaHasta) AND " +
           "(:tipoComprobante IS NULL OR :tipoComprobante = '' OR v.tipoComprobante = :tipoComprobante) AND " +
           "(:estado IS NULL OR :estado = '' OR v.estado = :estado)")
    long contarReporteVentas(@Param("fechaDesde") LocalDateTime fechaDesde,
                              @Param("fechaHasta") LocalDateTime fechaHasta,
                              @Param("tipoComprobante") String tipoComprobante,
                              @Param("estado") String estado);

    @Query("SELECT COALESCE(SUM(v.total), 0) FROM Venta v WHERE " +
           "(:fechaDesde IS NULL OR v.fechaEmision >= :fechaDesde) AND " +
           "(:fechaHasta IS NULL OR v.fechaEmision <= :fechaHasta) AND " +
           "(:tipoComprobante IS NULL OR :tipoComprobante = '' OR v.tipoComprobante = :tipoComprobante) AND " +
           "(:estado IS NULL OR :estado = '' OR v.estado = :estado)")
    BigDecimal sumTotalReporteVentas(@Param("fechaDesde") LocalDateTime fechaDesde,
                                      @Param("fechaHasta") LocalDateTime fechaHasta,
                                      @Param("tipoComprobante") String tipoComprobante,
                                      @Param("estado") String estado);

    @Query("SELECT COALESCE(SUM(v.igv), 0) FROM Venta v WHERE " +
           "(:fechaDesde IS NULL OR v.fechaEmision >= :fechaDesde) AND " +
           "(:fechaHasta IS NULL OR v.fechaEmision <= :fechaHasta) AND " +
           "(:tipoComprobante IS NULL OR :tipoComprobante = '' OR v.tipoComprobante = :tipoComprobante) AND " +
           "(:estado IS NULL OR :estado = '' OR v.estado = :estado)")
    BigDecimal sumIgvReporteVentas(@Param("fechaDesde") LocalDateTime fechaDesde,
                                    @Param("fechaHasta") LocalDateTime fechaHasta,
                                    @Param("tipoComprobante") String tipoComprobante,
                                    @Param("estado") String estado);
}