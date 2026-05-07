package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.VentaDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VentaDetalleRepository extends JpaRepository<VentaDetalle, String> {
    // Útil si necesitamos buscar los productos específicos de una venta en particular
    List<VentaDetalle> findByVentaId(String ventaId);
}