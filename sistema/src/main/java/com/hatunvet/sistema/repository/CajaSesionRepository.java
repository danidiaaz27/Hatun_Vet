package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.CajaSesion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CajaSesionRepository extends JpaRepository<CajaSesion, String> {
    
    // Devuelve la caja abierta actual si es que existe
    Optional<CajaSesion> findByEstado(String estado);
    
    // Verifica si ya hay una caja abierta para impedir duplicidad de aperturas
    boolean existsByEstado(String estado);
}