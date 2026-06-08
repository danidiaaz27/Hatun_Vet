package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.Usuario;
import com.hatunvet.sistema.service.PerfilService;
import com.hatunvet.sistema.service.UsuarioService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final PerfilService perfilService;

    public UsuarioController(UsuarioService usuarioService, PerfilService perfilService) {
        this.usuarioService = usuarioService;
        this.perfilService = perfilService;
    }

    @GetMapping("/listar")
    public String vistaUsuarios() { return "usuarios"; }

    @GetMapping("/api/listar")
    @ResponseBody
    public Map<String, Object> apiListar() {
        Map<String, Object> response = new HashMap<>();
        response.put("data", usuarioService.listarUsuarios());
        return response;
    }

    @GetMapping("/api/veterinarios")
    @ResponseBody
    public Map<String, Object> apiListarVeterinarios() {
        Map<String, Object> response = new HashMap<>();
        List<Usuario> veterinarios = usuarioService.listarUsuarios().stream()
                .filter(u -> u.isActivo() && u.getPerfil() != null && "Veterinario".equalsIgnoreCase(u.getPerfil().getNombre()))
                .collect(Collectors.toList());
        response.put("success", true);
        response.put("data", veterinarios);
        return response;
    }

    @GetMapping("/api/perfiles")
    @ResponseBody
    public Map<String, Object> apiListarPerfilesActivos() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", perfilService.listarActivos());
        return response;
    }

    @GetMapping("/api/{id}")
    @ResponseBody
    public Map<String, Object> apiObtener(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        usuarioService.obtenerUsuarioPorId(id).ifPresentOrElse(
                usuario -> { response.put("success", true); response.put("data", usuario); },
                () -> { response.put("success", false); response.put("message", "Usuario no encontrado"); }
        );
        return response;
    }

    @PostMapping("/api/guardar")
    @ResponseBody
    public Map<String, Object> apiGuardar(@RequestBody Usuario usuario) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Sanitización
            usuario.setNombre(usuario.getNombre() != null ? usuario.getNombre().trim() : "");
            usuario.setUsuario(usuario.getUsuario() != null ? usuario.getUsuario().trim().toLowerCase() : "");

            if (usuario.getNombre().isEmpty() || usuario.getUsuario().length() < 3) {
                response.put("success", false);
                response.put("message", "Nombre inválido o usuario demasiado corto (min 3 chars).");
                return response;
            }

            usuarioService.guardarUsuario(usuario);
            response.put("success", true);
            response.put("message", "Usuario guardado correctamente");
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error interno al guardar el usuario");
        }
        return response;
    }

    @PostMapping("/api/cambiar-estado/{id}")
    @ResponseBody
    public Map<String, Object> apiCambiarEstado(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        usuarioService.cambiarEstadoUsuario(id).ifPresentOrElse(
                u -> { response.put("success", true); response.put("message", "Estado actualizado"); },
                () -> { response.put("success", false); response.put("message", "Error al actualizar"); }
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
            response.put("message", "Error al eliminar: " + e.getMessage());
        }
        return response;
    }
}