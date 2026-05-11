package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.LandingImagen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LandingImagenRepository extends JpaRepository<LandingImagen, String> {
    List<LandingImagen> findAllByOrderByTipoAsc();
    List<LandingImagen> findAllByEstadoTrueOrderByTipoAsc();
}