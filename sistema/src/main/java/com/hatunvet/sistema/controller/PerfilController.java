package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.Perfil;
import com.hatunvet.sistema.service.PerfilService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/perfiles")
public class PerfilController {

    private final PerfilService perfilService;

    public PerfilController(PerfilService perfilService) {
        this.perfilService = perfilService;
    }

    // 1. Devuelve la vista HTML
    @GetMapping("/listar")
    public String vistaPerfiles() {
        return "perfiles";
    }

    // ==========================================
    // ENDPOINTS API PARA AJAX (DataTables y JS)
    // ==========================================

    @GetMapping("/api/listar")
    @ResponseBody
    public Map<String, Object> apiListar() {
        Map<String, Object> response = new HashMap<>();
        response.put("data", perfilService.listarTodos());
        return response;
    }

    @GetMapping("/api/{id}")
    @ResponseBody
    public Map<String, Object> apiObtener(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        perfilService.obtenerPorId(id).ifPresentOrElse(
                perfil -> {
                    response.put("success", true);
                    // Extraemos solo los IDs de las opciones para facilitar la lectura en JS
                    Map<String, Object> perfilMap = new HashMap<>();
                    perfilMap.put("id", perfil.getId());
                    perfilMap.put("nombre", perfil.getNombre());
                    perfilMap.put("descripcion", perfil.getDescripcion());
                    perfilMap.put("estado", perfil.isEstado());
                    perfilMap.put("opciones", perfil.getOpciones().stream().map(o -> o.getId()).collect(Collectors.toList()));
                    response.put("data", perfilMap);
                },
                () -> {
                    response.put("success", false);
                    response.put("message", "Perfil no encontrado");
                }
        );
        return response;
    }

    @PostMapping("/api/guardar")
    @ResponseBody
    public Map<String, Object> apiGuardar(@RequestBody Perfil perfil) {
        Map<String, Object> response = new HashMap<>();
        try {
            perfilService.guardar(perfil);
            response.put("success", true);
            response.put("message", "Perfil guardado correctamente");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al guardar: " + e.getMessage());
        }
        return response;
    }

    @PostMapping("/api/cambiar-estado/{id}")
    @ResponseBody
    public Map<String, Object> apiCambiarEstado(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        boolean success = perfilService.cambiarEstado(id);
        response.put("success", success);
        response.put("message", success ? "Estado actualizado" : "Error al actualizar");
        return response;
    }

    @DeleteMapping("/api/eliminar/{id}")
    @ResponseBody
    public Map<String, Object> apiEliminar(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        boolean success = perfilService.eliminar(id);
        response.put("success", success);
        response.put("message", success ? "Perfil eliminado" : "Error al eliminar. Verifique que no haya usuarios usándolo.");
        return response;
    }

    @GetMapping("/api/opciones")
    @ResponseBody
    public Map<String, Object> apiListarOpciones() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", perfilService.listarTodasOpciones());
        return response;
    }
}