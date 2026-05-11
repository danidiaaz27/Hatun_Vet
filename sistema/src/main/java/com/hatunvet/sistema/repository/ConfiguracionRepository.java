package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.Configuracion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfiguracionRepository extends JpaRepository<Configuracion, String> {
    Optional<Configuracion> findFirstByOrderByIdAsc();
}