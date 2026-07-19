package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.VentaDetalle;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VentaDetalleRepository extends JpaRepository<VentaDetalle, String> {

    List<VentaDetalle> findByVentaId(String ventaId);

    // NUEVO: top productos más vendidos (por cantidad), para el dashboard de Reportes
    @Query("SELECT d.producto.nombre, SUM(d.cantidad) FROM VentaDetalle d " +
           "WHERE d.venta.estado != 'ANULADO' " +
           "GROUP BY d.producto.nombre ORDER BY SUM(d.cantidad) DESC")
    List<Object[]> topProductosVendidos(Pageable pageable);
}