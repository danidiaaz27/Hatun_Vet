package com.hatunvet.sistema.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ProveedoresController {

    @GetMapping("/proveedores/listar")
    public String listarProveedores() {
        return "proveedores";
    }
}