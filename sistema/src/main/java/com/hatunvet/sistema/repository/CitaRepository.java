package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, String> {
    
    @Query("SELECT c FROM Cita c WHERE c.fechaHoraProgramada BETWEEN :inicio AND :fin ORDER BY c.fechaHoraProgramada ASC")
    List<Cita> findCitasDelDia(LocalDateTime inicio, LocalDateTime fin);

    // 1. Búsqueda por rango de fechas optimizada (Trae Mascota, Cliente y Veterinario)
    @Query("SELECT c FROM Cita c " +
           "JOIN FETCH c.mascota m " +
           "JOIN FETCH m.cliente " + 
           "JOIN FETCH c.veterinario " +
           "WHERE c.fechaHoraProgramada BETWEEN :inicio AND :fin " +
           "ORDER BY c.fechaHoraProgramada ASC")
    List<Cita> findCitasConRelacionesEnRango(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    // 2. Búsqueda general optimizada (Respaldo cuando no hay fechas)
    @Query("SELECT c FROM Cita c " +
           "JOIN FETCH c.mascota m " +
           "JOIN FETCH m.cliente " +
           "JOIN FETCH c.veterinario")
    List<Cita> findAllWithRelaciones();

    // 3. Búsqueda para el POS optimizada (Trae citas FINALIZADAS con todo su árbol de datos en 1 solo query)
    @Query("SELECT c FROM Cita c " +
           "JOIN FETCH c.mascota m " +
           "JOIN FETCH m.cliente " +
           "JOIN FETCH c.veterinario " +
           "WHERE c.estado = :estado")
    List<Cita> findByEstadoWithRelaciones(@Param("estado") String estado);
        
    List<Cita> findByEstadoOrderByFechaHoraProgramadaAsc(String estado);
    
    List<Cita> findByEstado(String estado);
}