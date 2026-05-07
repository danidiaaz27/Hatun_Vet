package com.hatunvet.sistema.service;

import com.hatunvet.sistema.model.Opcion;
import com.hatunvet.sistema.model.Perfil;
import com.hatunvet.sistema.repository.OpcionRepository;
import com.hatunvet.sistema.repository.PerfilRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PerfilService {

    private final PerfilRepository perfilRepository;
    private final OpcionRepository opcionRepository;

    public PerfilService(PerfilRepository perfilRepository, OpcionRepository opcionRepository) {
        this.perfilRepository = perfilRepository;
        this.opcionRepository = opcionRepository;
    }

    @Transactional(readOnly = true)
    public List<Perfil> listarTodos() {
        return perfilRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Perfil> listarActivos() {
        return perfilRepository.findByEstadoTrue();
    }

    @Transactional(readOnly = true)
    public Optional<Perfil> obtenerPorId(String id) {
        return perfilRepository.findById(id);
    }

    @Transactional
    public Perfil guardar(Perfil perfil) {
        // Si es nuevo, asegurarnos de que nazca activo
        if (perfil.getId() == null || perfil.getId().isEmpty()) {
            perfil.setEstado(true);
        } else {
            // Si es actualización, mantener las opciones que ya tenía para no borrarlas por accidente
            Perfil existente = perfilRepository.findById(perfil.getId()).orElse(null);
            if (existente != null && (perfil.getOpciones() == null || perfil.getOpciones().isEmpty())) {
                perfil.setOpciones(existente.getOpciones());
            }
        }
        return perfilRepository.save(perfil);
    }

    @Transactional
    public boolean cambiarEstado(String id) {
        return perfilRepository.findById(id).map(perfil -> {
            perfil.setEstado(!perfil.isEstado());
            perfilRepository.save(perfil);
            return true;
        }).orElse(false);
    }

    @Transactional
    public boolean eliminar(String id) {
        if (perfilRepository.existsById(id)) {
            perfilRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Transactional(readOnly = true)
    public List<Opcion> listarTodasOpciones() {
        return opcionRepository.findAll();
    }
}