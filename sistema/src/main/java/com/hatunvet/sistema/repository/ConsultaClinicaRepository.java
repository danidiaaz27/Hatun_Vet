package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.ConsultaClinica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ConsultaClinicaRepository extends JpaRepository<ConsultaClinica, String> {
    Optional<ConsultaClinica> findByCitaId(String citaId);
}