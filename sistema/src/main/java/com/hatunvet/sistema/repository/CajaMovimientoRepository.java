package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.CajaMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CajaMovimientoRepository extends JpaRepository<CajaMovimiento, Integer> {
    List<CajaMovimiento> findBySesionIdOrderByFechaMovimientoDesc(String sesionId);
}