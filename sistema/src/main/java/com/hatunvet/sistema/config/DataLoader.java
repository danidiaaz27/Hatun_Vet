package com.hatunvet.sistema.config;

import com.hatunvet.sistema.model.Opcion;
import com.hatunvet.sistema.model.Perfil;
import com.hatunvet.sistema.repository.OpcionRepository;
import com.hatunvet.sistema.repository.PerfilRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class DataLoader implements ApplicationRunner {

    private static final String OPCION_ID = "e1c51161-4bf2-11f1-980a-8d0986850898";

    private final OpcionRepository opcionRepository;
    private final PerfilRepository perfilRepository;

    public DataLoader(OpcionRepository opcionRepository, PerfilRepository perfilRepository) {
        this.opcionRepository = opcionRepository;
        this.perfilRepository = perfilRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        // Crear la opción si no existe
        if (!opcionRepository.existsById(OPCION_ID)) {
            Opcion opcion = new Opcion();
            opcion.setId(OPCION_ID);
            opcion.setNombre("Configuración");
            opcion.setRuta("/configuracion");
            opcion.setIcono("bi bi-gear-fill");
            opcionRepository.save(opcion);
        }

        Opcion opcion = opcionRepository.findById(OPCION_ID).orElse(null);
        if (opcion == null) return;

        // Buscar un perfil administrador o el primer perfil activo
        List<Perfil> perfilesActivos = perfilRepository.findByEstadoTrue();
        Perfil perfilAsignado = null;

        for (Perfil p : perfilesActivos) {
            String nombre = p.getNombre() == null ? "" : p.getNombre().toLowerCase();
            if (nombre.contains("admin") || nombre.contains("administrador")) {
                perfilAsignado = p;
                break;
            }
        }

        if (perfilAsignado == null && !perfilesActivos.isEmpty()) {
            perfilAsignado = perfilesActivos.get(0);
        }

        if (perfilAsignado != null) {
            boolean ya = perfilAsignado.getOpciones().stream().anyMatch(o -> OPCION_ID.equals(o.getId()));
            if (!ya) {
                perfilAsignado.getOpciones().add(opcion);
                perfilRepository.save(perfilAsignado);
            }
        }
    }
}
