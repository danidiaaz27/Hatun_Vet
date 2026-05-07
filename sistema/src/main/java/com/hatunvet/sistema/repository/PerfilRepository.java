package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.Perfil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PerfilRepository extends JpaRepository<Perfil, String> {

    // Busca todos los perfiles que están activos
    List<Perfil> findByEstadoTrue();
}