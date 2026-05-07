package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.service.UsuarioService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    private final UsuarioService usuarioService;

    public DashboardController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/dashboard")
    public String mostrarDashboard(Model model) {
        // Obtenemos datos reales para las tarjetas del inicio
        model.addAttribute("totalUsuarios", usuarioService.contarUsuarios());

        // Aquí podrías agregar más contadores después (mascotas, citas, etc.)
        model.addAttribute("totalMascotas", 0);
        model.addAttribute("citasHoy", 0);

        return "dashboard";
    }
}