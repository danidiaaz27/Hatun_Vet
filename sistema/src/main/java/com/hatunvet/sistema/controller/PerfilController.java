package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.Perfil;
import com.hatunvet.sistema.service.PerfilService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/perfiles")
public class PerfilController {

    private final PerfilService perfilService;

    public PerfilController(PerfilService perfilService) {
        this.perfilService = perfilService;
    }

    @GetMapping("/listar")
    public String vistaPerfiles() { return "perfiles"; }

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
                    Map<String, Object> perfilMap = new HashMap<>();
                    perfilMap.put("id", perfil.getId());
                    perfilMap.put("nombre", perfil.getNombre());
                    perfilMap.put("descripcion", perfil.getDescripcion());
                    perfilMap.put("estado", perfil.isEstado());
                    perfilMap.put("opciones", perfil.getOpciones().stream().map(o -> o.getId()).collect(Collectors.toList()));
                    response.put("data", perfilMap);
                },
                () -> { response.put("success", false); response.put("message", "Perfil no encontrado"); }
        );
        return response;
    }

    @PostMapping("/api/guardar")
    @ResponseBody
    public Map<String, Object> apiGuardar(@RequestBody Perfil perfil) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Sanitización
            perfil.setNombre(perfil.getNombre() != null ? perfil.getNombre().trim() : "");
            perfil.setDescripcion(perfil.getDescripcion() != null ? perfil.getDescripcion().trim() : "");

            if (perfil.getNombre().isEmpty()) {
                response.put("success", false);
                response.put("message", "El nombre del perfil es obligatorio.");
                return response;
            }

            // Validación de duplicidad
            List<Perfil> existentes = perfilService.listarTodos();
            boolean duplicado = existentes.stream()
                    .anyMatch(p -> p.getNombre().equalsIgnoreCase(perfil.getNombre())
                            && (perfil.getId() == null || !p.getId().equals(perfil.getId())));

            if (duplicado) {
                response.put("success", false);
                response.put("message", "Ya existe un perfil con ese nombre.");
                return response;
            }

            perfilService.guardar(perfil);
            response.put("success", true);
            response.put("message", "Perfil guardado correctamente");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al procesar: " + e.getMessage());
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
        try {
            boolean success = perfilService.eliminar(id);
            response.put("success", success);
            response.put("message", success ? "Perfil eliminado" : "Error al eliminar. Verifique que no haya usuarios usándolo.");
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al intentar eliminar el perfil: " + e.getMessage());
        }
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