package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.Opcion;
import com.hatunvet.sistema.model.Usuario;
import com.hatunvet.sistema.service.UsuarioService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Comparator;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Controller
public class LoginController {

    private final UsuarioService usuarioService;

    public LoginController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/login")
    public String mostrarLogin(HttpSession session) {
        if (session.getAttribute("usuarioLogueado") != null) {
            return "redirect:/dashboard";
        }
        return "login";
    }

    @PostMapping("/login")
    public String procesarLogin(@RequestParam String usuario, @RequestParam String clave, HttpSession session, RedirectAttributes redirectAttributes) {

        Optional<Usuario> usuarioOpt = usuarioService.findByUsuario(usuario);

        if (usuarioOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "El nombre de usuario no existe.");
            return "redirect:/login";
        }

        Usuario u = usuarioOpt.get();

        if (!u.isActivo()) {
            redirectAttributes.addFlashAttribute("error", "Usuario inactivo. Contacte al administrador.");
            return "redirect:/login";
        }

        if (usuarioService.verificarContrasena(clave, u.getPasswordHash())) {
            session.setAttribute("usuarioLogueado", u);

            // Cargamos el menú dinámico del Perfil
            var opcionesMenu = u.getPerfil().getOpciones().stream()
                    .sorted(Comparator.comparing(Opcion::getNombre))
                    .collect(Collectors.toCollection(ArrayList::new));

            session.setAttribute("menuOpciones", opcionesMenu);
            return "redirect:/dashboard";
        } else {
            redirectAttributes.addFlashAttribute("error", "Contraseña incorrecta.");
            return "redirect:/login";
        }
    }

    @GetMapping("/logout")
    public String logout(HttpSession session, RedirectAttributes redirectAttributes) {
        session.invalidate();
        redirectAttributes.addFlashAttribute("logout", "Sesión cerrada correctamente.");
        return "redirect:/login";
    }

    // ==============================================================================
    // --- BORRAR DESPUÉS: Generador temporal de clave ---
    // ==============================================================================
    @GetMapping("/test-clave")
    @org.springframework.web.bind.annotation.ResponseBody
    public String generarClaveCorrecta() {
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode("123456");
    }
}