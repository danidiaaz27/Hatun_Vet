package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.Usuario;
import com.hatunvet.sistema.service.CodigoSeguridadService;
import com.hatunvet.sistema.service.MailService;
import com.hatunvet.sistema.service.PerfilService;
import com.hatunvet.sistema.service.UsuarioService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final PerfilService perfilService;
    private final MailService mailService;
    private final CodigoSeguridadService codigoSeguridadService;

    @Value("${admin.email}")
    private String adminEmail;

    public UsuarioController(
            UsuarioService usuarioService,
            PerfilService perfilService,
            MailService mailService,
            CodigoSeguridadService codigoSeguridadService) {
        this.usuarioService = usuarioService;
        this.perfilService = perfilService;
        this.mailService = mailService;
        this.codigoSeguridadService = codigoSeguridadService;
    }

    @GetMapping("/listar")
    public String vistaUsuarios() {
        return "usuarios";
    }

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
                .filter(u -> u.isActivo()
                        && u.getPerfil() != null
                        && "Veterinario".equalsIgnoreCase(u.getPerfil().getNombre()))
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
                usuario -> {
                    response.put("success", true);
                    response.put("data", usuario);
                },
                () -> {
                    response.put("success", false);
                    response.put("message", "Usuario no encontrado");
                });

        return response;
    }

    @PostMapping("/api/cambiar-password")
    @ResponseBody
    public Map<String, Object> apiCambiarPassword(@RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();

        try {
            String usuarioId = body.get("usuarioId");
            String nuevaClave = body.get("nuevaClave");

            String errorPwd = validarPasswordBackend(nuevaClave);
            if (errorPwd != null) {
                response.put("success", false);
                response.put("message", errorPwd);
                return response;
            }

            boolean actualizado = usuarioService.cambiarPassword(usuarioId, nuevaClave);

            if (!actualizado) {
                response.put("success", false);
                response.put("message", "No se pudo actualizar la contraseña.");
                return response;
            }

            try {
                usuarioService.obtenerUsuarioPorId(usuarioId).ifPresent(usuario -> {
                    mailService.enviarCorreo(
                            adminEmail,
                            "HatunVet - Contraseña actualizada",
                            "Hola Administrador,\n\n" +
                                    "La contraseña del usuario " + usuario.getNombre() +
                                    " fue modificada correctamente.\n\n" +
                                    "Usuario: " + usuario.getUsuario() + "\n" +
                                    "Fecha y hora: " + java.time.LocalDateTime.now() + "\n\n" +
                                    "Si usted no realizó esta acción, revise inmediatamente el sistema.\n\n" +
                                    "Equipo HatunVet");
                });
            } catch (Exception mailError) {
                System.out.println("No se pudo enviar correo de confirmación: " + mailError.getMessage());
            }

            codigoSeguridadService.limpiarCodigo();

            response.put("success", true);
            response.put("message", "Contraseña actualizada correctamente.");

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error interno al cambiar la contraseña.");
        }

        return response;
    }

    @PostMapping("/api/guardar")
    @ResponseBody
    public Map<String, Object> apiGuardar(@RequestBody Usuario usuario) {
        Map<String, Object> response = new HashMap<>();

        try {
            usuario.setNombre(usuario.getNombre() != null ? usuario.getNombre().trim() : "");
            usuario.setUsuario(usuario.getUsuario() != null ? usuario.getUsuario().trim().toLowerCase() : "");

            if (usuario.getNombre().isEmpty() || usuario.getUsuario().length() < 3) {
                response.put("success", false);
                response.put("message", "Nombre inválido o usuario demasiado corto (min 3 chars).");
                return response;
            }

            if (!usuario.getNombre().matches("^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s]+$")) {
                response.put("success", false);
                response.put("message", "El nombre del usuario solo debe contener letras y espacios.");
                return response;
            }

            String password = usuario.getPasswordHash();
            boolean esNuevo = usuario.getId() == null || usuario.getId().isEmpty();

            if (!validarPasswordUsuario(password, esNuevo, response)) {
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

    @PostMapping("/api/enviar-codigo")
    @ResponseBody
    public Map<String, Object> apiEnviarCodigo() {
        Map<String, Object> response = new HashMap<>();

        try {
            String codigo = codigoSeguridadService.generarCodigo();

            mailService.enviarCorreo(
                    adminEmail,
                    "Código de seguridad HatunVet",
                    "Tu código de verificación es: " + codigo +
                            "\n\nEste código vence en 5 minutos.");

            response.put("success", true);
            response.put("message", "Código enviado correctamente.");

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "No se pudo enviar el código.");
        }

        return response;
    }

    @PostMapping("/api/verificar-codigo")
    @ResponseBody
    public Map<String, Object> apiVerificarCodigo(@RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();

        String codigo = body.get("codigo");
        boolean valido = codigoSeguridadService.verificarCodigo(codigo);

        response.put("success", valido);
        response.put(
                "message",
                valido ? "Código verificado correctamente." : "Código incorrecto o expirado.");

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
                });

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

    private boolean validarPasswordUsuario(
            String password,
            boolean esNuevo,
            Map<String, Object> response) {
        if (esNuevo && (password == null || password.trim().isEmpty())) {
            response.put("success", false);
            response.put("message", "La contraseña es obligatoria para nuevos usuarios.");
            return false;
        }

        if (password != null && !password.trim().isEmpty()) {
            String errorPwd = validarPasswordBackend(password);

            if (errorPwd != null) {
                response.put("success", false);
                response.put("message", errorPwd);
                return false;
            }
        }

        return true;
    }

    private String validarPasswordBackend(String pwd) {
        if (pwd.length() < 6) {
            return "La contraseña debe tener al menos 6 caracteres.";
        }

        if (!pwd.matches(".*[A-Z].*")) {
            return "La contraseña debe contener al menos una letra mayúscula.";
        }

        if (!pwd.matches(".*[a-z].*")) {
            return "La contraseña debe contener al menos una letra minúscula.";
        }

        if (!pwd.matches(".*[0-9].*")) {
            return "La contraseña debe contener al menos un número.";
        }

        if (!pwd.matches(".*[^a-zA-Z0-9\\s].*")) {
            return "La contraseña debe contener al menos un carácter especial.";
        }

        return null;
    }
}