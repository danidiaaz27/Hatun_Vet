package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.Mascota;
import com.hatunvet.sistema.service.MascotaService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/mascotas")
public class MascotaController {

    private final MascotaService mascotaService;

    public MascotaController(MascotaService mascotaService) {
        this.mascotaService = mascotaService;
    }

    @GetMapping
    public String index() {
        return "mascotas";
    }

    @GetMapping("/api/listar")
    @ResponseBody
    public Map<String, Object> listar() {
        Map<String, Object> response = new HashMap<>();
        response.put("data", mascotaService.listarTodas());
        response.put("success", true);
        return response;
    }

    @GetMapping("/api/{id}")
    @ResponseBody
    public Map<String, Object> obtener(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        mascotaService.obtenerPorId(id).ifPresentOrElse(
                mascota -> {
                    response.put("success", true);
                    response.put("data", mascota);
                },
                () -> {
                    response.put("success", false);
                    response.put("message", "Mascota no encontrada");
                }
        );
        return response;
    }

    @GetMapping("/api/buscar/{valor}")
    @ResponseBody
    public Map<String, Object> buscar(@PathVariable String valor) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", mascotaService.buscarPorIdONombre(valor));
        return response;
    }

    @PostMapping("/api/registro-rapido")
    @ResponseBody
    public Map<String, Object> registroRapido(@RequestBody MascotaService.RegistroRapidoRequest request) {
        return mascotaService.registroRapido(request);
    }

    @PostMapping("/api/guardar")
    @ResponseBody
    public Map<String, Object> guardar(@RequestBody Mascota mascota) {
        Map<String, Object> response = new HashMap<>();
        try {
            Mascota guardada = mascotaService.guardar(mascota);
            response.put("success", true);
            response.put("message", "Mascota guardada correctamente");
            response.put("data", guardada);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error interno al guardar la mascota.");
        }
        return response;
    }

    @PutMapping("/api/actualizar/{id}")
    @ResponseBody
    public Map<String, Object> actualizar(@PathVariable Long id, @RequestBody Mascota mascota) {
        Map<String, Object> response = new HashMap<>();
        try {
            Mascota actualizada = mascotaService.actualizar(id, mascota);
            response.put("success", true);
            response.put("message", "Mascota actualizada correctamente");
            response.put("data", actualizada);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error interno al actualizar la mascota.");
        }
        return response;
    }

    @DeleteMapping("/api/eliminar/{id}")
    @ResponseBody
    public Map<String, Object> eliminar(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean eliminado = mascotaService.eliminar(id);
            response.put("success", eliminado);
            response.put("message", eliminado ? "Mascota eliminada correctamente" : "Mascota no encontrada");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error interno al eliminar la mascota.");
        }
        return response;
    }
}
