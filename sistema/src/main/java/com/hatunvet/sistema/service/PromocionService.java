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

        List<Promocion> candidatas = promocionRepository.findActivasPorTipoEnRango(
                promocion.getTipo(),
                promocion.getFechaInicio(),
                promocion.getFechaFin()
        );

        // GENERAL y COMPRA_MINIMA afectan el pedido completo (no un producto ni
        // categoría en particular), así que ahí sí basta con que coincida el tipo
        // y se crucen las fechas para que sean incompatibles entre sí.
        boolean esAlcanceOrdenCompleto = "GENERAL".equals(promocion.getTipo())
                || "COMPRA_MINIMA".equals(promocion.getTipo());

        for (Promocion existente : candidatas) {
            // Al editar, no comparar la promoción contra sí misma.
            if (promocion.getId() != null && promocion.getId().equals(existente.getId())) {
                continue;
            }

            boolean choca = esAlcanceOrdenCompleto || seCruzanEnAlcance(promocion, existente);

            if (choca) {
                throw new IllegalArgumentException(
                        "Ya existe una promoción activa (\"" + existente.getNombre() +
                        "\") del mismo tipo que se cruza en fechas y alcance (producto/categoría)."
                );
            }
        }
    }

    // Determina si dos promociones del MISMO tipo realmente se pisarían en el POS,
    // según a qué apliquen: mismo producto, misma categoría, o alguna de las dos
    // es "general" (sin producto ni categoría), lo que significa que cubre TODO.
    private boolean seCruzanEnAlcance(Promocion a, Promocion b) {
        String prodA = a.getProducto() != null ? a.getProducto().getId() : null;
        String prodB = b.getProducto() != null ? b.getProducto().getId() : null;
        String catA = a.getCategoria() != null ? a.getCategoria().getId() : null;
        String catB = b.getCategoria() != null ? b.getCategoria().getId() : null;

        boolean aEsGeneral = prodA == null && catA == null;
        boolean bEsGeneral = prodB == null && catB == null;

        // Una promo sin producto ni categoría (ej. un PORCENTUAL "general por
        // producto") aplica a todos los productos, así que choca con cualquier
        // otra promoción del mismo tipo, sea cual sea su alcance específico.
        if (aEsGeneral || bEsGeneral) {
            return true;
        }

        if (prodA != null && prodA.equals(prodB)) {
            return true;
        }

        return catA != null && catA.equals(catB);
    }

    @Transactional
    public void eliminar(String id) {
        promocionRepository.deleteById(id);
    }
}