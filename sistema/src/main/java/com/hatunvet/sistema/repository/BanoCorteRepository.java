package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.BanoCorte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BanoCorteRepository extends JpaRepository<BanoCorte, Long> {

    List<BanoCorte> findAllByOrderByFechaServicioDesc();

    // NUEVO: Para el historial del cliente
    List<BanoCorte> findByDniDuenoOrderByFechaServicioDesc(String dniDueno);

    @Query("SELECT DISTINCT b.tipoServicio FROM BanoCorte b WHERE b.tipoServicio IS NOT NULL")
    List<String> findTiposUnicos();

    // --- NUEVAS CONSULTAS PARA REPORTES ---
    @Query("SELECT COALESCE(SUM(b.precio), 0) FROM BanoCorte b WHERE DATE(b.fechaServicio) = CURRENT_DATE AND b.estado IN ('TERMINADO', 'PAGADO')")
    Double sumIngresosHoy();

    @Query("SELECT COALESCE(SUM(b.precio), 0) FROM BanoCorte b WHERE MONTH(b.fechaServicio) = MONTH(CURRENT_DATE) AND YEAR(b.fechaServicio) = YEAR(CURRENT_DATE) AND b.estado IN ('TERMINADO', 'PAGADO')")
    Double sumIngresosMes();

    @Query("SELECT COUNT(b) FROM BanoCorte b WHERE MONTH(b.fechaServicio) = MONTH(CURRENT_DATE) AND YEAR(b.fechaServicio) = YEAR(CURRENT_DATE)")
    Integer countServiciosMes();

    // Agrupaciones para los gráficos de Chart.js
    @Query("SELECT b.especie, COUNT(b) FROM BanoCorte b GROUP BY b.especie")
    List<Object[]> countAtencionesPorEspecie();

    @Query("SELECT b.tipoServicio, COUNT(b) FROM BanoCorte b GROUP BY b.tipoServicio")
    List<Object[]> countAtencionesPorServicio();
}