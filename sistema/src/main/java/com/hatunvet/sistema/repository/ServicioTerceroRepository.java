package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.ServicioTercero;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServicioTerceroRepository extends JpaRepository<ServicioTercero, Long> {
    List<ServicioTercero> findByConsultaClinicaId(String consultaClinicaId);
}