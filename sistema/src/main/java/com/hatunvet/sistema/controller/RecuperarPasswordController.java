package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.Usuario;
import com.hatunvet.sistema.service.CodigoSeguridadService;
import com.hatunvet.sistema.service.MailService;
import com.hatunvet.sistema.service.UsuarioService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/recuperar")
public class RecuperarPasswordController {

    private final UsuarioService usuarioService;
    private final MailService mailService;
    private final CodigoSeguridadService codigoSeguridadService;

    private String correoRecuperacion;

    public RecuperarPasswordController(
            UsuarioService usuarioService,
            MailService mailService,
            CodigoSeguridadService codigoSeguridadService) {
        this.usuarioService = usuarioService;
        this.mailService = mailService;
        this.codigoSeguridadService = codigoSeguridadService;
    }

    @PostMapping("/enviar-codigo")
    public Map<String, Object> enviarCodigo(@RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();

        try {
            String correo = body.get("correo").trim().toLowerCase();

            Optional<Usuario> usuarioOpt = usuarioService.findByUsuario(correo);

            if (usuarioOpt.isEmpty() || !usuarioOpt.get().isActivo()) {
                response.put("success", false);
                response.put("message", "No existe una cuenta activa con ese correo.");
                return response;
            }

            String codigo = codigoSeguridadService.generarCodigo();
            correoRecuperacion = correo;

            mailService.enviarCorreo(
                    correo,
                    "Código de recuperación HatunVet",
                    "Tu código de recuperación es: " + codigo +
                            "\n\nEste código vence en 5 minutos.");

            response.put("success", true);
            response.put("message", "Código enviado correctamente.");

        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "No se pudo enviar el código: " + e.getMessage());
        }
        return response;
    }

    @PostMapping("/verificar-codigo")
    public Map<String, Object> verificarCodigo(@RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();

        String codigo = body.get("codigo");
        boolean valido = codigoSeguridadService.verificarCodigo(codigo);

        response.put("success", valido);
        response.put(
                "message",
                valido ? "Código verificado correctamente." : "Código incorrecto o expirado.");

        return response;
    }

    @PostMapping("/cambiar-password")
    public Map<String, Object> cambiarPassword(@RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();

        try {
            String nuevaClave = body.get("nuevaClave");

            if (correoRecuperacion == null) {
                response.put("success", false);
                response.put("message", "Primero debes solicitar un código.");
                return response;
            }

            Optional<Usuario> usuarioOpt = usuarioService.findByUsuario(correoRecuperacion);

            if (usuarioOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Usuario no encontrado.");
                return response;
            }

            Usuario usuario = usuarioOpt.get();

            boolean actualizado = usuarioService.cambiarPassword(usuario.getId(), nuevaClave);

            if (!actualizado) {
                response.put("success", false);
                response.put("message", "No se pudo actualizar la contraseña.");
                return response;
            }

            mailService.enviarCorreo(
                    usuario.getUsuario(),
                    "HatunVet - Contraseña recuperada",
                    "Hola " + usuario.getNombre() + ",\n\n" +
                            "Tu contraseña fue actualizada correctamente.\n\n" +
                            "Si no realizaste esta acción, comunícate con el administrador.\n\n" +
                            "Equipo HatunVet");

            codigoSeguridadService.limpiarCodigo();
            correoRecuperacion = null;

            response.put("success", true);
            response.put("message", "Contraseña actualizada correctamente.");

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error interno al cambiar la contraseña.");
        }

        return response;
    }
}