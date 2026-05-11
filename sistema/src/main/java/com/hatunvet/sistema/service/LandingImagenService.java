package com.hatunvet.sistema.service;

import com.hatunvet.sistema.model.LandingImagen;
import com.hatunvet.sistema.repository.LandingImagenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class LandingImagenService {

    private final LandingImagenRepository landingImagenRepository;
    private final FileStorageService fileStorageService;

    public LandingImagenService(LandingImagenRepository landingImagenRepository, FileStorageService fileStorageService) {
        this.landingImagenRepository = landingImagenRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public List<LandingImagen> listarTodas() {
        return landingImagenRepository.findAllByOrderByTipoAsc();
    }

    @Transactional(readOnly = true)
    public List<LandingImagen> listarActivas() {
        return landingImagenRepository.findAllByEstadoTrueOrderByTipoAsc();
    }

    @Transactional(readOnly = true)
    public Optional<LandingImagen> obtenerPorId(String id) {
        return landingImagenRepository.findById(id);
    }

    @Transactional
    public LandingImagen guardar(LandingImagen landingImagen, MultipartFile imagenFile) {
        if (landingImagen.getId() != null && landingImagen.getId().isBlank()) {
            landingImagen.setId(null);
        }

        Optional<LandingImagen> existenteOpt = landingImagen.getId() != null
                ? landingImagenRepository.findById(landingImagen.getId())
                : Optional.empty();

        if (imagenFile != null && !imagenFile.isEmpty()) {
            existenteOpt.ifPresent(existente -> fileStorageService.eliminarArchivo(existente.getImagen()));
            landingImagen.setImagen(fileStorageService.guardarArchivo(imagenFile));
        } else {
            existenteOpt.ifPresent(existente -> {
                if (landingImagen.getImagen() == null || landingImagen.getImagen().isBlank()) {
                    landingImagen.setImagen(existente.getImagen());
                }
            });
        }

        return landingImagenRepository.save(landingImagen);
    }

    @Transactional
    public boolean cambiarEstado(String id) {
        return landingImagenRepository.findById(id).map(imagen -> {
            imagen.setEstado(!imagen.isEstado());
            landingImagenRepository.save(imagen);
            return true;
        }).orElse(false);
    }

    @Transactional
    public boolean eliminar(String id) {
        return landingImagenRepository.findById(id).map(imagen -> {
            fileStorageService.eliminarArchivo(imagen.getImagen());
            landingImagenRepository.delete(imagen);
            return true;
        }).orElse(false);
    }
}