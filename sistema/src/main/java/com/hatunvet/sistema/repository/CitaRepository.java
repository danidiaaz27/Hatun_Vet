package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, String> {

    @Query("SELECT c FROM Cita c WHERE c.fechaHoraProgramada BETWEEN :inicio AND :fin ORDER BY c.fechaHoraProgramada ASC")
    List<Cita> findCitasDelDia(LocalDateTime inicio, LocalDateTime fin);

    List<Cita> findByEstadoOrderByFechaHoraProgramadaAsc(String estado);

    List<Cita> findByEstado(String estado);

    // ── NUEVO: para calcular slots ocupados por médico en una fecha ──
    List<Cita> findByVeterinarioIdAndFechaHoraProgramadaBetweenAndEstadoIn(
            String veterinarioId,
            LocalDateTime inicio,
            LocalDateTime fin,
            List<String> estados);
}