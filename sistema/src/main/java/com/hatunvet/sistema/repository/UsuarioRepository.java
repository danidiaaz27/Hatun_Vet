package com.hatunvet.sistema.repository;

import com.hatunvet.sistema.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, String> {

    // Busca al usuario por su nombre de usuario (ej. 'admin')
    Optional<Usuario> findByUsuario(String usuario);

    // Verifica si un nombre de usuario ya existe
    boolean existsByUsuario(String usuario);

    // Trae solo los usuarios activos
    List<Usuario> findAllByActivoTrue();

    // Cuenta cuántos usuarios activos hay
    long countByActivoTrue();
}