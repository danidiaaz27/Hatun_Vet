package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.Promocion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PromocionRepository extends JpaRepository<Promocion, String> {

    @Query("SELECT p FROM Promocion p WHERE p.estado = 'ACTIVO' AND p.fechaInicio <= :fecha AND p.fechaFin >= :fecha")
    List<Promocion> findActivePromotionsByDate(@Param("fecha") LocalDate fecha);

    @Query("SELECT p FROM Promocion p WHERE p.tipo = :tipo AND p.estado = 'ACTIVO' " +
           "AND p.fechaInicio <= :fechaFin AND p.fechaFin >= :fechaInicio")
    List<Promocion> findActivasPorTipoEnRango(
            @Param("tipo") String tipo,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin
    );
}