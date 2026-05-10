package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.service.ConfiguracionService;
import com.hatunvet.sistema.service.LandingImagenService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PaginaPrincipalController {

    private final ConfiguracionService configuracionService;
    private final LandingImagenService landingImagenService;

    public PaginaPrincipalController(ConfiguracionService configuracionService, LandingImagenService landingImagenService) {
        this.configuracionService = configuracionService;
        this.landingImagenService = landingImagenService;
    }

    @GetMapping({"/", "/pagina_principal"})
    public String mostrarPaginaPrincipal(Model model) {
        model.addAttribute("config", configuracionService.obtenerConfiguracion());
        model.addAttribute("landingImages", landingImagenService.listarActivas());
        return "pagina_principal";
    }
}