package com.hatunvet.sistema.util;

import com.hatunvet.sistema.model.Opcion;
import com.hatunvet.sistema.model.Usuario;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component("sidebarHelper")
public class SidebarHelper {

    public boolean hasRuta(Usuario usuario, List<Opcion> opciones, String ruta) {
        if (usuario != null && usuario.getPerfil() != null && "Administrador".equalsIgnoreCase(usuario.getPerfil().getNombre())) {
            return true;
        }
        if (opciones == null || ruta == null) return false;
        String rTarget = ruta.trim();
        return opciones.stream().anyMatch(op -> op.getRuta() != null && rTarget.equalsIgnoreCase(op.getRuta().trim()));
    }

    public boolean hasRutas(Usuario usuario, List<Opcion> opciones, String rutasCsv) {
        if (usuario != null && usuario.getPerfil() != null && "Administrador".equalsIgnoreCase(usuario.getPerfil().getNombre())) {
            return true;
        }
        if (opciones == null || rutasCsv == null) return false;
        List<String> listaRutas = Arrays.asList(rutasCsv.split(","));
        return opciones.stream().anyMatch(op -> op.getRuta() != null && listaRutas.stream().anyMatch(r -> r.trim().equalsIgnoreCase(op.getRuta().trim())));
    }
}
