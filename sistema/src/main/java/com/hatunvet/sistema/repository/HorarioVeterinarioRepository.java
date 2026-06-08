package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.HorarioVeterinario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HorarioVeterinarioRepository extends JpaRepository<HorarioVeterinario, Long> {
    List<HorarioVeterinario> findByVeterinarioId(String veterinarioId);
    List<HorarioVeterinario> findByVeterinarioIdAndDiaSemana(String veterinarioId, Integer diaSemana);
}
