package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.ConsultaInsumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ConsultaInsumoRepository extends JpaRepository<ConsultaInsumo, Long> {
    List<ConsultaInsumo> findByConsultaClinicaId(String consultaClinicaId);
}