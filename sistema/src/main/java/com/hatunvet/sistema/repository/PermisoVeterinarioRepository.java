package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.PermisoVeterinario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PermisoVeterinarioRepository extends JpaRepository<PermisoVeterinario, Long> {
    List<PermisoVeterinario> findByVeterinarioIdAndActivoTrue(String veterinarioId);
    List<PermisoVeterinario> findByVeterinarioId(String veterinarioId);

    @Query("SELECT p FROM PermisoVeterinario p WHERE p.veterinario.id = :vetId AND p.activo = true AND :fecha BETWEEN p.fechaInicio AND p.fechaFin")
    List<PermisoVeterinario> findActivePermissionsOverlapping(
            @Param("vetId") String vetId,
            @Param("fecha") LocalDateTime fecha
    );
}
