package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.CajaMovimiento;
import com.hatunvet.sistema.model.CajaSesion;
import com.hatunvet.sistema.service.CajaService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/caja")
public class CajaController {

    private final CajaService cajaService;

    public CajaController(CajaService cajaService) {
        this.cajaService = cajaService;
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