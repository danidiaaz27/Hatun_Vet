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

    // ==============================================================================
    // --- MENÚ: Construcción de secciones ---
    // ==============================================================================

    private List<MenuSeccion> construirSeccionesMenu(List<Opcion> opcionesOrdenadas) {
        Map<String, List<Opcion>> secciones = new LinkedHashMap<>();
        secciones.put("VENTAS", new ArrayList<>());
        secciones.put("OPERACIONES Y CITAS", new ArrayList<>());
        secciones.put("PACIENTES Y CLIENTES", new ArrayList<>());
        secciones.put("INVENTARIO Y LOGÍSTICA", new ArrayList<>());
        secciones.put("REPORTES Y ANALÍTICA", new ArrayList<>());
        secciones.put("CONFIGURACIÓN Y SEGURIDAD", new ArrayList<>());

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
        if (ruta == null) return "CONFIGURACIÓN Y SEGURIDAD";

        return switch (ruta) {
            case "/dashboard", "/ventas/pos", "/ventas/historial", "/caja" -> "VENTAS";
            case "/agenda", "/banos-cortes", "/torre-control"              -> "OPERACIONES Y CITAS";
            case "/mascotas", "/clientes"                                  -> "PACIENTES Y CLIENTES";
            case "/inventario", "/productos/listar",
                 "/categorias", "/proveedores/listar"                      -> "INVENTARIO Y LOGÍSTICA";
            case "/reportes"                                               -> "REPORTES Y ANALÍTICA";
            default                                                        -> "CONFIGURACIÓN Y SEGURIDAD";
        };
    }

    private int getOrdenMenu(String ruta) {
        if (ruta == null) return 999;

        return switch (ruta) {
            // VENTAS
            case "/dashboard"          -> 10;
            case "/ventas/pos"         -> 20;
            case "/ventas/historial"   -> 30;
            case "/caja"               -> 40;
            // OPERACIONES Y CITAS
            case "/agenda"             -> 50;
            case "/banos-cortes"       -> 60;
            case "/torre-control"      -> 70;
            // PACIENTES Y CLIENTES
            case "/mascotas"           -> 80;
            case "/clientes"           -> 90;
            // INVENTARIO Y LOGÍSTICA
            case "/inventario"         -> 100;
            case "/productos/listar"   -> 110;
            case "/categorias"         -> 120;
            case "/proveedores/listar" -> 130;
            // REPORTES
            case "/reportes"           -> 140;
            // CONFIGURACIÓN Y SEGURIDAD
            case "/configuracion"      -> 150;
            case "/perfiles/listar"    -> 160;
            case "/usuarios/listar"    -> 170;
            case "/medicos/horarios"   -> 180;
            default                    -> 500;
        };
    }

    // ==============================================================================
    // --- CLASE INTERNA: MenuSeccion ---
    // ==============================================================================

    public static class MenuSeccion {
        private final String titulo;
        private final List<Opcion> opciones;

        public MenuSeccion(String titulo, List<Opcion> opciones) {
            this.titulo = titulo;
            this.opciones = opciones;
        }

        public String getTitulo() { return titulo; }
        public List<Opcion> getOpciones() { return opciones; }
    }
}