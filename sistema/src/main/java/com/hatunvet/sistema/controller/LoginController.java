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

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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
                    .sorted(Comparator
                            .comparingInt((Opcion opcion) -> getOrdenMenu(opcion.getRuta()))
                            .thenComparing(Opcion::getNombre))
                    .collect(Collectors.toCollection(ArrayList::new));

            session.setAttribute("menuOpciones", opcionesMenu);
            session.setAttribute("menuSecciones", construirSeccionesMenu(opcionesMenu));
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

    private List<MenuSeccion> construirSeccionesMenu(List<Opcion> opcionesOrdenadas) {
        Map<String, List<Opcion>> secciones = new LinkedHashMap<>();
        secciones.put("VENTAS", new ArrayList<>());
        secciones.put("GROOMING", new ArrayList<>());
        secciones.put("ADMINISTRACIÓN", new ArrayList<>());

        for (Opcion opcion : opcionesOrdenadas) {
            String seccion = obtenerSeccion(opcion.getRuta());
            secciones.computeIfAbsent(seccion, key -> new ArrayList<>()).add(opcion);
        }

        return secciones.entrySet().stream()
                .filter(entry -> !entry.getValue().isEmpty())
                .map(entry -> new MenuSeccion(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }

    private String obtenerSeccion(String ruta) {
        if (ruta == null) {
            return "ADMINISTRACIÓN";
        }

        if ("/dashboard".equals(ruta) || ruta.startsWith("/ventas/")) {
            return "VENTAS";
        }
        if (ruta.startsWith("/banos-cortes")) {
            return "GROOMING";
        }
        return "ADMINISTRACIÓN";
    }

    private int getOrdenMenu(String ruta) {
        if (ruta == null) {
            return 999;
        }

        return switch (ruta) {
            case "/dashboard" -> 10;
            case "/ventas/pos" -> 20;
            case "/ventas/historial" -> 30;
            case "/banos-cortes" -> 40;
            case "/mascotas" -> 45;
            case "/inventario" -> 50;
            case "/categorias" -> 60;
            case "/productos/listar" -> 70;
            case "/proveedores/listar" -> 80;
            case "/clientes" -> 90;
            case "/perfiles/listar" -> 100;
            case "/usuarios/listar" -> 110;
            case "/medicos/horarios" -> 115;
            case "/reportes" -> 120;
            case "/configuracion" -> 130;
            default -> 500;
        };
    }

    public static class MenuSeccion {
        private final String titulo;
        private final List<Opcion> opciones;

        public MenuSeccion(String titulo, List<Opcion> opciones) {
            this.titulo = titulo;
            this.opciones = opciones;
        }

        public String getTitulo() {
            return titulo;
        }

        public List<Opcion> getOpciones() {
            return opciones;
        }
    }
}