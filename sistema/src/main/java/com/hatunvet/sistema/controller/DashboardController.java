package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.service.UsuarioService;
import com.hatunvet.sistema.service.CitaService;
import com.hatunvet.sistema.service.MascotaService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    private final UsuarioService usuarioService;
    private final CitaService citaService;
    private final MascotaService mascotaService;

    public DashboardController(UsuarioService usuarioService, CitaService citaService, MascotaService mascotaService) {
        this.usuarioService = usuarioService;
        this.citaService = citaService;
        this.mascotaService = mascotaService;
    }

    @GetMapping("/dashboard")
    public String mostrarDashboard(Model model) {
        // Obtenemos datos reales para las tarjetas del inicio
        model.addAttribute("totalUsuarios", usuarioService.contarUsuarios());
        
        try {
            model.addAttribute("totalMascotas", mascotaService.listarTodas().size());
        } catch (Exception e) {
            model.addAttribute("totalMascotas", 0);
        }

        try {
            long citasHoy = citaService.obtenerTodasLasCitas().stream()
                    .filter(c -> c.getFechaHoraProgramada() != null && 
                                 c.getFechaHoraProgramada().toLocalDate().equals(java.time.LocalDate.now()))
                    .count();
            model.addAttribute("citasHoy", citasHoy);
        } catch (Exception e) {
            model.addAttribute("citasHoy", 0);
        }

        // Alertas de próximas citas y vacunas
        model.addAttribute("alertas", citaService.obtenerAlertasVigentes());

        return "dashboard";
    }
}