package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.ConsultaClinica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsultaClinicaRepository extends JpaRepository<ConsultaClinica, String> {
    
    Optional<ConsultaClinica> findByCitaId(String citaId);

    // Consulta para la línea de tiempo (Historial Perpetuo)
    @Query("SELECT c FROM ConsultaClinica c WHERE c.cita.mascota.id = :mascotaId ORDER BY c.fechaAtencion DESC")
    List<ConsultaClinica> findHistorialByMascotaId(@Param("mascotaId") String mascotaId);

    // Consulta para obtener próximas alertas (citas o vacunas) a partir de una fecha de referencia
    @Query("SELECT c FROM ConsultaClinica c WHERE (c.fechaProximaCita IS NOT NULL AND c.fechaProximaCita >= :fechaReferencia) OR (c.fechaProximaVacuna IS NOT NULL AND c.fechaProximaVacuna >= :fechaReferencia) OR (c.fechaProximaDesparasitacion IS NOT NULL AND c.fechaProximaDesparasitacion >= :fechaReferencia)")
    List<ConsultaClinica> findAlertasVigentes(@Param("fechaReferencia") java.time.LocalDate fechaReferencia);
}