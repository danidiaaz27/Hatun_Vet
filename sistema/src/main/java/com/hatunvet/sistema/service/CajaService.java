package com.hatunvet.sistema.service;

import com.hatunvet.sistema.model.*;
import com.hatunvet.sistema.repository.CajaMovimientoRepository;
import com.hatunvet.sistema.repository.CajaSesionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CajaService {

    private final CajaSesionRepository sesionRepository;
    private final CajaMovimientoRepository movimientoRepository;

    public CajaService(CajaSesionRepository sesionRepository, CajaMovimientoRepository movimientoRepository) {
        this.sesionRepository = sesionRepository;
        this.movimientoRepository = movimientoRepository;
    }

    @Transactional(readOnly = true)
    public Optional<CajaSesion> obtenerSesionActiva() {
        return sesionRepository.findByEstado("ABIERTA");
    }

    @Transactional
    public CajaSesion abrirCaja(BigDecimal montoInicial, String usuario) {
        if (sesionRepository.existsByEstado("ABIERTA")) {
            throw new IllegalArgumentException("Ya existe una sesión de caja abierta activa.");
        }
        CajaSesion nuevaSesion = new CajaSesion();
        nuevaSesion.setFechaApertura(LocalDateTime.now());
        nuevaSesion.setMontoApertura(montoInicial);
        nuevaSesion.setEstado("ABIERTA");
        nuevaSesion.setUsuarioApertura(usuario);
        return sesionRepository.save(nuevaSesion);
    }

    @Transactional
    public void registrarIngresoAutomatizado(BigDecimal monto, String descripcion, String medioPago, Venta venta, BanoCorte banoCorte) {
        CajaSesion sesionActiva = sesionRepository.findByEstado("ABIERTA")
                .orElseThrow(() -> new IllegalArgumentException("Operación rechazada: No se ha iniciado una sesión de caja."));

        CajaMovimiento mov = new CajaMovimiento();
        mov.setSesion(sesionActiva);
        mov.setTipo("INGRESO");
        mov.setMonto(monto);
        mov.setDescripcion(descripcion);
        mov.setMedioPago(medioPago);
        mov.setVenta(venta);
        mov.setBanoCorte(banoCorte);
        movimientoRepository.save(mov);
    }

    @Transactional
    public CajaMovimiento registrarMovimientoManual(String tipo, BigDecimal monto, String descripcion, String medioPago) {
        CajaSesion sesionActiva = sesionRepository.findByEstado("ABIERTA")
                .orElseThrow(() -> new IllegalArgumentException("No hay una caja abierta para registrar movimientos."));

        CajaMovimiento mov = new CajaMovimiento();
        mov.setSesion(sesionActiva);
        mov.setTipo(tipo.toUpperCase()); // "INGRESO" o "EGRESO"
        mov.setMonto(monto);
        mov.setDescripcion(descripcion.trim());
        mov.setMedioPago(medioPago);
        return movimientoRepository.save(mov);
    }

    @Transactional
    public CajaSesion cerrarCaja(BigDecimal montoReal, String usuario) {
        CajaSesion sesion = sesionRepository.findByEstado("ABIERTA")
                .orElseThrow(() -> new IllegalArgumentException("No hay ninguna sesión de caja abierta para cerrar."));

        List<CajaMovimiento> movimientos = movimientoRepository.findBySesionIdOrderByFechaMovimientoDesc(sesion.getId());

        BigDecimal ingresos = movimientos.stream()
                .filter(m -> "INGRESO".equals(m.getTipo()))
                .map(CajaMovimiento::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal egresos = movimientos.stream()
                .filter(m -> "EGRESO".equals(m.getTipo()))
                .map(CajaMovimiento::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Fórmula: Esperado = Inicial + Ingresos - Egresos
        BigDecimal esperado = sesion.getMontoApertura().add(ingresos).subtract(egresos);

        sesion.setFechaCierre(LocalDateTime.now());
        sesion.setMontoCierreEsperado(esperado);
        sesion.setMontoCierreReal(montoReal);
        sesion.setEstado("CERRADA");
        sesion.setUsuarioCierre(usuario);

        return sesionRepository.save(sesion);
    }

    @Transactional(readOnly = true)
    public List<CajaMovimiento> listarMovimientosDeSesion(String sesionId) {
        return movimientoRepository.findBySesionIdOrderByFechaMovimientoDesc(sesionId);
    }
}