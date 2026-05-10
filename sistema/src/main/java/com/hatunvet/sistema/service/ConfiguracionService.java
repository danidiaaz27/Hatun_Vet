package com.hatunvet.sistema.service;

import com.hatunvet.sistema.model.Configuracion;
import com.hatunvet.sistema.repository.ConfiguracionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@Service
public class ConfiguracionService {

    private final ConfiguracionRepository configuracionRepository;
    private final FileStorageService fileStorageService;

    public ConfiguracionService(ConfiguracionRepository configuracionRepository, FileStorageService fileStorageService) {
        this.configuracionRepository = configuracionRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public Configuracion obtenerConfiguracion() {
        return configuracionRepository.findFirstByOrderByIdAsc().orElseGet(() -> {
            Configuracion configuracion = new Configuracion();
            configuracion.setNombreVeterinaria("HatunVet");
            configuracion.setTelefono("+51 987 654 321");
            configuracion.setDireccion("Av. Principal 123, Lima");
            configuracion.setCorreo("contacto@hatunvet.com");
            configuracion.setTextoHero("Bienvenidos a HatunVet");
            configuracion.setSubtituloHero("Tu clínica veterinaria de confianza. Ofrecemos atención profesional y amorosa para el bienestar de tus compañeros más fieles.");
            configuracion.setMision("Brindar servicios veterinarios de excelencia, con amor y profesionalismo.");
            configuracion.setVision("Ser la veterinaria líder en la región, reconocida por nuestra excelencia.");
            return configuracion;
        });
    }

    @Transactional
    public Configuracion guardarConfiguracion(Configuracion configuracion, MultipartFile logoFile) {
        if (configuracion.getId() != null && configuracion.getId().isBlank()) {
            configuracion.setId(null);
        }

        Optional<Configuracion> existenteOpt = configuracion.getId() != null
                ? configuracionRepository.findById(configuracion.getId())
                : configuracionRepository.findFirstByOrderByIdAsc();

        Configuracion existente = existenteOpt.orElse(null);

        if (configuracion.getId() == null && existente != null) {
            configuracion.setId(existente.getId());
        }

        if (logoFile != null && !logoFile.isEmpty()) {
            if (existente != null) {
                fileStorageService.eliminarArchivo(existente.getLogo());
            }
            configuracion.setLogo(fileStorageService.guardarArchivo(logoFile));
        } else if (existente != null && (configuracion.getLogo() == null || configuracion.getLogo().isBlank())) {
            configuracion.setLogo(existente.getLogo());
        }

        return configuracionRepository.save(configuracion);
    }
}