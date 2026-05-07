package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, String> {

    List<Venta> findAllByOrderByFechaEmisionDesc();

    @Query("SELECT COALESCE(SUM(v.total), 0) FROM Venta v WHERE DATE(v.fechaEmision) = CURRENT_DATE AND v.estado != 'ANULADO'")
    Double sumVentasHoy();

    @Query("SELECT COALESCE(SUM(v.total), 0) FROM Venta v WHERE MONTH(v.fechaEmision) = MONTH(CURRENT_DATE) AND YEAR(v.fechaEmision) = YEAR(CURRENT_DATE) AND v.estado != 'ANULADO'")
    Double sumVentasMes();

    @Query("SELECT COUNT(v) FROM Venta v WHERE MONTH(v.fechaEmision) = MONTH(CURRENT_DATE) AND YEAR(v.fechaEmision) = YEAR(CURRENT_DATE) AND v.estado != 'ANULADO'")
    Integer countVentasMes();

    // ¡Aquí está la magia! Le decimos que busque por "clienteDocumento"
    @Query("SELECT v FROM Venta v WHERE v.clienteDocumento = :numDoc ORDER BY v.fechaEmision DESC")
    List<Venta> findByNumDocOrderByFechaEmisionDesc(@Param("numDoc") String numDoc);
}