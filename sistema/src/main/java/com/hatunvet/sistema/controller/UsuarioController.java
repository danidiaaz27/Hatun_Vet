package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.Usuario;
import com.hatunvet.sistema.service.PerfilService;
import com.hatunvet.sistema.service.UsuarioService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final PerfilService perfilService; // Necesitamos esto para llenar el "Select" del formulario

    public UsuarioController(UsuarioService usuarioService, PerfilService perfilService) {
        this.usuarioService = usuarioService;
        this.perfilService = perfilService;
    }

    // 1. Devuelve la vista HTML
    @GetMapping("/listar")
    public String vistaUsuarios() {
        return "usuarios";
    }

    // ==========================================
    // ENDPOINTS API PARA AJAX (DataTables y JS)
    // ==========================================

    @GetMapping("/api/listar")
    @ResponseBody
    public Map<String, Object> apiListar() {
        Map<String, Object> response = new HashMap<>();
        response.put("data", usuarioService.listarUsuarios());
        return response;
    }

    @GetMapping("/api/perfiles")
    @ResponseBody
    public Map<String, Object> apiListarPerfilesActivos() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", perfilService.listarActivos()); // Solo perfiles activos para asignar
        return response;
    }

    @GetMapping("/api/{id}")
    @ResponseBody
    public Map<String, Object> apiObtener(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        usuarioService.obtenerUsuarioPorId(id).ifPresentOrElse(
                usuario -> {
                    response.put("success", true);
                    response.put("data", usuario);
                },
                () -> {
                    response.put("success", false);
                    response.put("message", "Usuario no encontrado");
                }
        );
        return response;
    }

    @PostMapping("/api/guardar")
    @ResponseBody
    public Map<String, Object> apiGuardar(@RequestBody Usuario usuario) {
        Map<String, Object> response = new HashMap<>();
        try {
            usuarioService.guardarUsuario(usuario);
            response.put("success", true);
            response.put("message", "Usuario guardado correctamente");
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al guardar el usuario");
        }
        return response;
    }

    @PostMapping("/api/cambiar-estado/{id}")
    @ResponseBody
    public Map<String, Object> apiCambiarEstado(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        usuarioService.cambiarEstadoUsuario(id).ifPresentOrElse(
                u -> {
                    response.put("success", true);
                    response.put("message", "Estado actualizado");
                },
                () -> {
                    response.put("success", false);
                    response.put("message", "Error al actualizar");
                }
        );
        return response;
    }

    @DeleteMapping("/api/eliminar/{id}")
    @ResponseBody
    public Map<String, Object> apiEliminar(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            usuarioService.eliminarUsuario(id);
            response.put("success", true);
            response.put("message", "Usuario eliminado (desactivado)");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al eliminar");
        }
        return response;
    }
}