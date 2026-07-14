package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.BanoCorte;
import com.hatunvet.sistema.service.BanoCorteService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/banos-cortes")
public class BanoCorteController {

    private final BanoCorteService banoCorteService;

    public BanoCorteController(BanoCorteService banoCorteService) {
        this.banoCorteService = banoCorteService;
    }

    @GetMapping
    public String index() {
        return "banos-cortes";
    }

    @GetMapping("/api/listar")
    @ResponseBody
    public Map<String, Object> listar() {
        Map<String, Object> res = new HashMap<>();
        res.put("data", banoCorteService.listarTodos());
        return res;
    }

    @PostMapping("/api/guardar")
    @ResponseBody
    public Map<String, Object> guardar(@RequestBody BanoCorte registro) {
        Map<String, Object> res = new HashMap<>();
        try {
            banoCorteService.guardarServicio(registro);
            res.put("success", true);
            res.put("message", "Servicio registrado correctamente");
        } catch (IllegalArgumentException e) {
            res.put("success", false);
            res.put("message", e.getMessage());
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "Error: Verifique que todos los campos requeridos estén llenos.");
        }
        return res;
    }

    @PostMapping("/api/cambiar-estado/{id}")
    @ResponseBody
    public Map<String, Object> cambiarEstado(@PathVariable Long id, @RequestParam String nuevoEstado) {
        Map<String, Object> res = new HashMap<>();
        try {
            banoCorteService.cambiarEstado(id, nuevoEstado);
            res.put("success", true);
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", e.getMessage());
        }
        return res;
    }

    // --- NUEVO: CANCELAR SERVICIO ---
    @PostMapping("/api/cancelar/{id}")
    @ResponseBody
    public Map<String, Object> cancelar(@PathVariable Long id) {
        Map<String, Object> res = new HashMap<>();
        try {
            banoCorteService.cancelarServicio(id);
            res.put("success", true);
            res.put("message", "Servicio cancelado correctamente.");
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", e.getMessage());
        }
        return res;
    }

    @GetMapping("/api/tipos-servicio")
    @ResponseBody
    public List<String> listarTipos() {
        return banoCorteService.listarTiposUnicos();
    }

    @GetMapping("/api/por-cobrar")
    @ResponseBody
    public List<Map<String, Object>> porCobrar() {
        return banoCorteService.obtenerServiciosParaFacturacion();
    }
}