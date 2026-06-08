package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.Usuario;
import com.hatunvet.sistema.service.ConfiguracionService;
import com.hatunvet.sistema.service.LandingImagenService;
import com.hatunvet.sistema.service.UsuarioService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.stream.Collectors;

@Controller
public class PaginaPrincipalController {

    private final ConfiguracionService configuracionService;
    private final LandingImagenService landingImagenService;
    private final UsuarioService usuarioService;

    public PaginaPrincipalController(ConfiguracionService configuracionService, 
                                     LandingImagenService landingImagenService, 
                                     UsuarioService usuarioService) {
        this.configuracionService = configuracionService;
        this.landingImagenService = landingImagenService;
        this.usuarioService = usuarioService;
    }

    @GetMapping({"/", "/pagina_principal"})
    public String mostrarPaginaPrincipal(Model model) {
        model.addAttribute("config", configuracionService.obtenerConfiguracion());
        model.addAttribute("landingImages", landingImagenService.listarActivas());
        
        List<Usuario> medicos = usuarioService.listarUsuarios().stream()
                .filter(u -> u.isActivo() && u.getPerfil() != null && "Veterinario".equalsIgnoreCase(u.getPerfil().getNombre()))
                .collect(Collectors.toList());
        model.addAttribute("medicos", medicos);
        
        return "pagina_principal";
    }
}