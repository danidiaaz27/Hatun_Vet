package com.hatunvet.sistema.service;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Random;

@Service
public class CodigoSeguridadService {

    private String codigoActual;
    private LocalDateTime expiracion;

    public String generarCodigo() {
        codigoActual = String.format("%06d", new Random().nextInt(999999));
        expiracion = LocalDateTime.now().plusMinutes(5);
        return codigoActual;
    }

    public boolean verificarCodigo(String codigo) {
        if (codigoActual == null || expiracion == null) return false;
        if (LocalDateTime.now().isAfter(expiracion)) return false;
        return codigoActual.equals(codigo);
    }

    public void limpiarCodigo() {
        codigoActual = null;
        expiracion = null;
    }
}