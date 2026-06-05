package com.hatunvet.sistema.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class CitaWebController {

    // Pantalla para el Counter / Recepción
    @GetMapping("/agenda")
    public String agendaCounter() {
        return "agenda"; 
    }

    // Pantalla para el Médico (Torre de Control)
    @GetMapping("/consultorio")
    public String torreControlMedico() {
        return "consultorio"; 
    }
}