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
    private static final String PROVEEDORES_ID = "4aee659b-4c37-11f1-baf2-f0bfed632bab";
    private static final String INVENTARIO_ID = "4aee9e82-4c37-11f1-baf2-f0bfed632bab";

    private final OpcionRepository opcionRepository;
    private final PerfilRepository perfilRepository;

    public DataLoader(OpcionRepository opcionRepository, PerfilRepository perfilRepository) {
        this.opcionRepository = opcionRepository;
        this.perfilRepository = perfilRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        Opcion configuracion = upsertOpcion(OPCION_ID, "Configuración", "/configuracion", "bi bi-gear-fill");
        Opcion proveedores = upsertOpcion(PROVEEDORES_ID, "Proveedores", "/proveedores/listar", "bi bi-truck");
        Opcion inventario = upsertOpcion(INVENTARIO_ID, "Inventario", "/inventario", "bi bi-boxes");

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
            boolean cambio = false;
            if (perfilAsignado.getOpciones().stream().noneMatch(o -> OPCION_ID.equals(o.getId()))) {
                perfilAsignado.getOpciones().add(configuracion);
                cambio = true;
            }
            if (perfilAsignado.getOpciones().stream().noneMatch(o -> PROVEEDORES_ID.equals(o.getId()))) {
                perfilAsignado.getOpciones().add(proveedores);
                cambio = true;
            }
            if (perfilAsignado.getOpciones().stream().noneMatch(o -> INVENTARIO_ID.equals(o.getId()))) {
                perfilAsignado.getOpciones().add(inventario);
                cambio = true;
            }
            if (cambio) {
                perfilRepository.save(perfilAsignado);
            }
        }
    }

    private Opcion upsertOpcion(String id, String nombre, String ruta, String icono) {
        Opcion opcion = opcionRepository.findById(id).orElseGet(Opcion::new);
        opcion.setId(id);
        opcion.setNombre(nombre);
        opcion.setRuta(ruta);
        opcion.setIcono(icono);
        return opcionRepository.save(opcion);
    }
}
