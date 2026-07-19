package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.CajaMovimiento;
import com.hatunvet.sistema.model.CajaSesion;
import com.hatunvet.sistema.service.CajaService;
import com.hatunvet.sistema.repository.CajaMovimientoRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
@RequestMapping("/caja")
public class CajaController {

    private final CajaService cajaService;
    private final CajaMovimientoRepository movimientoRepository;

    public CajaController(CajaService cajaService, CajaMovimientoRepository movimientoRepository) {
        this.cajaService = cajaService;
        this.movimientoRepository = movimientoRepository;
    }

    @GetMapping
    public String index() {
        return "caja";
    }

    @GetMapping("/api/estado")
    @ResponseBody
    public Map<String, Object> obtenerEstado() {
        Map<String, Object> res = new HashMap<>();
        cajaService.obtenerSesionActiva().ifPresentOrElse(
            sesion -> {
                res.put("success", true);
                res.put("activo", true);
                res.put("sesion", sesion);
                res.put("movimientos", cajaService.listarMovimientosDeSesion(sesion.getId()));
            },
            () -> {
                res.put("success", true);
                res.put("activo", false);
            }
        );
        return res;
    }

    // Endpoint para el botón Buscar del Monitor de Caja
    @GetMapping("/api/filtrar")
    @ResponseBody
    public Map<String, Object> filtrarMonitor(
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String medioPago) {
        
        Map<String, Object> res = new HashMap<>();
        try {
            // CORREGIDO: antes se filtraba en TODA la tabla de movimientos, sin
            // importar la sesión de caja. Eso podía mezclar movimientos de
            // sesiones ya cerradas con el balance de la sesión actual (que usa
            // el monto de apertura de HOY). El Monitor de Caja es sobre la
            // sesión activa, así que el filtro debe quedar acotado a ella.
            Optional<CajaSesion> sesionActivaOpt = cajaService.obtenerSesionActiva();
            if (sesionActivaOpt.isEmpty()) {
                res.put("success", false);
                res.put("message", "No hay una caja abierta para filtrar movimientos.");
                return res;
            }

            LocalDateTime inicio = (fechaDesde != null && !fechaDesde.isEmpty()) ? LocalDateTime.parse(fechaDesde + "T00:00:00") : null;
            LocalDateTime fin = (fechaHasta != null && !fechaHasta.isEmpty()) ? LocalDateTime.parse(fechaHasta + "T23:59:59") : null;
            
            List<CajaMovimiento> movimientos = movimientoRepository.filtrarMovimientosMonitor(
                    sesionActivaOpt.get().getId(), inicio, fin, tipo, medioPago);
            
            res.put("success", true);
            res.put("data", movimientos);
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "Error al filtrar los datos");
        }
        return res;
    }

    @PostMapping("/api/abrir")
    @ResponseBody
    public Map<String, Object> abrirCaja(@RequestParam BigDecimal montoApertura, @RequestParam String usuario) {
        Map<String, Object> res = new HashMap<>();
        try {
            if (montoApertura.compareTo(BigDecimal.ZERO) < 0) {
                res.put("success", false);
                res.put("message", "El monto de apertura no puede ser negativo.");
                return res;
            }
            CajaSesion sesion = cajaService.abrirCaja(montoApertura, usuario);
            res.put("success", true);
            res.put("message", "Caja abierta correctamente.");
            res.put("sesion", sesion);
        } catch (IllegalArgumentException e) {
            res.put("success", false);
            res.put("message", e.getMessage());
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "Error interno al abrir la caja.");
        }
        return res;
    }

    @PostMapping("/api/movimiento-manual")
    @ResponseBody
    public Map<String, Object> movimientoManual(@RequestParam String tipo, 
                                                @RequestParam BigDecimal monto, 
                                                @RequestParam String descripcion,
                                                @RequestParam String medioPago) {
        Map<String, Object> res = new HashMap<>();
        try {
            if (monto.compareTo(BigDecimal.ZERO) <= 0) {
                res.put("success", false);
                res.put("message", "El monto debe ser mayor a cero.");
                return res;
            }
            if (descripcion.trim().isEmpty()) {
                res.put("success", false);
                res.put("message", "La descripción es obligatoria.");
                return res;
            }
            cajaService.registrarMovimientoManual(tipo, monto, descripcion, medioPago);
            res.put("success", true);
            res.put("message", "Movimiento registrado correctamente.");
        } catch (IllegalArgumentException e) {
            res.put("success", false);
            res.put("message", e.getMessage());
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "Error al registrar el movimiento.");
        }
        return res;
    }

    @PostMapping("/api/cerrar")
    @ResponseBody
    public Map<String, Object> cerrarCaja(@RequestParam BigDecimal montoCierreReal, @RequestParam String usuario) {
        Map<String, Object> res = new HashMap<>();
        try {
            if (montoCierreReal.compareTo(BigDecimal.ZERO) < 0) {
                res.put("success", false);
                res.put("message", "El monto real no puede ser negativo.");
                return res;
            }
            CajaSesion sesion = cajaService.cerrarCaja(montoCierreReal, usuario);
            res.put("success", true);
            res.put("message", "Caja cerrada correctamente.");
            res.put("sesion", sesion);
        } catch (IllegalArgumentException e) {
            res.put("success", false);
            res.put("message", e.getMessage());
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "Error al cerrar la caja.");
        }
        return res;
    }
}