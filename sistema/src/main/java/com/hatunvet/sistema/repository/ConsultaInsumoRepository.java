package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.ConsultaInsumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;

public interface ConsultaInsumoRepository extends JpaRepository<ConsultaInsumo, Long> {

    List<ConsultaInsumo> findByConsultaClinicaId(String consultaClinicaId);

    @Query("SELECT COALESCE(SUM(i.precioCobrado * i.cantidadUsada), 0) FROM ConsultaInsumo i")
    BigDecimal sumTotalVendidoInsumos();

    // Si agregas o calculas un campo costo de adquisición en el producto o el insumo:
    @Query("SELECT COALESCE(SUM(i.producto.precio * 0.40 * i.cantidadUsada), 0) FROM ConsultaInsumo i") 
    BigDecimal sumCostoTotalInsumos(); 
}