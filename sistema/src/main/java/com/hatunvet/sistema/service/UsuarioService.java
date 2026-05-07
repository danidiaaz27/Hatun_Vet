package com.hatunvet.sistema.service;

import com.hatunvet.sistema.model.Usuario;
import com.hatunvet.sistema.repository.UsuarioRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @Transactional(readOnly = true)
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    @Transactional
    public Usuario guardarUsuario(Usuario usuario) {
        try {
            if (usuario.getNombre() == null || usuario.getNombre().trim().isEmpty()) {
                throw new IllegalArgumentException("El nombre es obligatorio");
            }

            if (usuario.getUsuario() == null || usuario.getUsuario().trim().isEmpty()) {
                throw new IllegalArgumentException("El usuario es obligatorio");
            }

            if (usuario.getPerfil() == null || usuario.getPerfil().getId() == null) {
                throw new IllegalArgumentException("Debe seleccionar un perfil");
            }

            usuario.setNombre(usuario.getNombre().trim());
            usuario.setUsuario(usuario.getUsuario().trim().toLowerCase());

            // Si el ID existe, es una actualización
            if (usuario.getId() != null && !usuario.getId().isEmpty()) {
                Usuario usuarioExistente = obtenerUsuarioPorId(usuario.getId())
                        .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

                // Si no mandan nueva clave, mantenemos la anterior
                if (usuario.getPasswordHash() == null || usuario.getPasswordHash().trim().isEmpty()) {
                    usuario.setPasswordHash(usuarioExistente.getPasswordHash());
                } else {
                    usuario.setPasswordHash(passwordEncoder.encode(usuario.getPasswordHash().trim()));
                }
            } else {
                // Es un usuario nuevo
                if (usuario.getPasswordHash() == null || usuario.getPasswordHash().trim().isEmpty()) {
                    throw new IllegalArgumentException("La contraseña es obligatoria para nuevos usuarios");
                }
                usuario.setPasswordHash(passwordEncoder.encode(usuario.getPasswordHash().trim()));
                usuario.setActivo(true); // Activo por defecto
            }

            return usuarioRepository.save(usuario);

        } catch (DataIntegrityViolationException e) {
            String message = e.getMessage().toLowerCase();
            if (message.contains("usuario")) {
                throw new IllegalArgumentException("El nombre de usuario ya está registrado");
            } else {
                throw new IllegalArgumentException("Error de integridad de datos");
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al guardar el usuario: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public long contarUsuarios() {
        return usuarioRepository.countByActivoTrue();
    }

    @Transactional(readOnly = true)
    public Optional<Usuario> obtenerUsuarioPorId(String id) {
        return usuarioRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Usuario> findByUsuario(String usuario) {
        return usuarioRepository.findByUsuario(usuario.trim().toLowerCase());
    }

    @Transactional
    public void eliminarUsuario(String id) {
        Usuario usuario = obtenerUsuarioPorId(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        usuario.setActivo(false); // Borrado lógico
        usuarioRepository.save(usuario);
    }

    @Transactional
    public Optional<Usuario> cambiarEstadoUsuario(String id) {
        return obtenerUsuarioPorId(id).map(usuario -> {
            usuario.setActivo(!usuario.isActivo());
            return usuarioRepository.save(usuario);
        });
    }

    @Transactional(readOnly = true)
    public boolean existeUsuario(String usuario) {
        if (usuario == null || usuario.trim().isEmpty()) return false;
        return usuarioRepository.existsByUsuario(usuario.trim().toLowerCase());
    }

    public boolean verificarContrasena(String contrasenaTextoPlano, String contrasenaEncriptada) {
        return passwordEncoder.matches(contrasenaTextoPlano, contrasenaEncriptada);
    }
}