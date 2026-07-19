package com.hatunvet.sistema.service;

import com.hatunvet.sistema.model.Promocion;
import com.hatunvet.sistema.repository.PromocionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class PromocionService {

    private final PromocionRepository promocionRepository;

    public PromocionService(PromocionRepository promocionRepository) {
        this.promocionRepository = promocionRepository;
    }

    public List<Promocion> obtenerTodas() {
        return promocionRepository.findAll();
    }

    public List<Promocion> obtenerActivasYVigentes() {
        return promocionRepository.findActivePromotionsByDate(LocalDate.now());
    }

    public Optional<Promocion> obtenerPorId(String id) {
        return promocionRepository.findById(id);
    }

    @Transactional
    public Promocion guardar(Promocion promocion) {
        if (promocion.getNombre() == null || promocion.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la promoción es obligatorio.");
        }
        if (promocion.getTipo() == null || promocion.getTipo().trim().isEmpty()) {
            throw new IllegalArgumentException("El tipo de promoción es obligatorio.");
        }
        if (promocion.getFechaInicio() == null || promocion.getFechaFin() == null) {
            throw new IllegalArgumentException("Las fechas de inicio y fin son obligatorias.");
        }
        if (promocion.getFechaFin().isBefore(promocion.getFechaInicio())) {
            throw new IllegalArgumentException("La fecha de fin no puede ser anterior a la de inicio.");
        }

        validarTipoNoDuplicadoEnRango(promocion);

        return promocionRepository.save(promocion);
    }

    private void validarTipoNoDuplicadoEnRango(Promocion promocion) {
        // Solo validamos cruce contra otras promociones ACTIVAS.
        // Si la que se está guardando queda INACTIVA, no genera conflicto.
        if (!"ACTIVO".equalsIgnoreCase(promocion.getEstado())) {
            return;
        }

        List<Promocion> coincidencias = promocionRepository.findActivasPorTipoEnRango(
                promocion.getTipo(),
                promocion.getFechaInicio(),
                promocion.getFechaFin()
        );

        boolean existeConflicto = coincidencias.stream()
                .anyMatch(p -> promocion.getId() == null || !p.getId().equals(promocion.getId()));

        if (existeConflicto) {
            throw new IllegalArgumentException(
                    "Ya existe una promoción activa del mismo tipo que se cruza con ese rango de fechas."
            );
        }
    }

    @Transactional
    public void eliminar(String id) {
        promocionRepository.deleteById(id);
    }
}