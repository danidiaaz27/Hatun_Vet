package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.Opcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OpcionRepository extends JpaRepository<Opcion, String> {
}