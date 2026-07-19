package com.hatunvet.sistema.service;

import com.hatunvet.sistema.model.Proveedor;
import com.hatunvet.sistema.repository.ProveedorRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;
    private final FileStorageService fileStorageService;

    public ProveedorService(ProveedorRepository proveedorRepository, FileStorageService fileStorageService) {
        this.proveedorRepository = proveedorRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public List<Proveedor> listarTodos() {
        return proveedorRepository.findAllByOrderByNombreAsc();
    }

    @Transactional(readOnly = true)
    public Optional<Proveedor> obtenerPorId(Integer id) {
        return proveedorRepository.findById(id);
    }

    @Transactional
    public Proveedor guardar(Proveedor proveedor, MultipartFile comprobanteFile) {
        // Limpiamos los espacios en blanco
        proveedor.setNombre(proveedor.getNombre() != null ? proveedor.getNombre().trim() : null);
        proveedor.setRuc(proveedor.getRuc() != null ? proveedor.getRuc().trim() : null);

        if (proveedor.getNombre() == null || proveedor.getNombre().isEmpty()) {
            throw new IllegalArgumentException("El nombre del proveedor es requerido");
        }
        if (proveedor.getRuc() == null || proveedor.getRuc().isEmpty()) {
            throw new IllegalArgumentException("El RUC es requerido");
        }
        if (proveedor.getRuc().length() != 11) {
            throw new IllegalArgumentException("El RUC debe tener 11 dígitos");
        }

        // VALIDACIÓN 1: Prefijos oficiales de SUNAT
        String prefijo = proveedor.getRuc().substring(0, 2);
        if (!List.of("10", "15", "17", "20").contains(prefijo)) {
            throw new IllegalArgumentException("El RUC ingresado no es válido en Perú (Debe iniciar con 10, 15, 17 o 20).");
        }

        // Validar teléfono (opcional, pero si está presente debe ser de 9 dígitos y empezar con 9)
        if (proveedor.getTelefono() != null && !proveedor.getTelefono().trim().isEmpty()) {
            proveedor.setTelefono(proveedor.getTelefono().trim());
            if (!proveedor.getTelefono().matches("^9[0-9]{8}$")) {
                throw new IllegalArgumentException("El teléfono debe tener exactamente 9 dígitos y comenzar con 9.");
            }
        }

        // Validar persona de contacto (opcional, pero si está presente solo debe contener letras y espacios)
        if (proveedor.getContacto() != null && !proveedor.getContacto().trim().isEmpty()) {
            proveedor.setContacto(proveedor.getContacto().trim());
            if (!proveedor.getContacto().matches("^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s]+$")) {
                throw new IllegalArgumentException("El nombre del contacto solo debe contener letras y espacios.");
            }
        }

        Optional<Proveedor> existente = proveedorRepository.findByRuc(proveedor.getRuc());
        if (existente.isPresent() && (proveedor.getId() == null || !existente.get().getId().equals(proveedor.getId()))) {
            throw new IllegalArgumentException("Ya existe un proveedor registrado con ese RUC.");
        }

        procesarComprobante(proveedor, comprobanteFile);

        return proveedorRepository.save(proveedor);
    }

    private void procesarComprobante(Proveedor proveedor, MultipartFile comprobanteFile) {
        if (comprobanteFile != null && !comprobanteFile.isEmpty()) {
            String contentType = comprobanteFile.getContentType();
            String nombreOriginal = comprobanteFile.getOriginalFilename() != null
                    ? comprobanteFile.getOriginalFilename().toLowerCase()
                    : "";

            boolean esPdf = "application/pdf".equals(contentType) || nombreOriginal.endsWith(".pdf");

            if (!esPdf) {
                throw new IllegalArgumentException("El comprobante debe ser un archivo PDF.");
            }

            String nombreArchivo = fileStorageService.guardarArchivo(comprobanteFile);
            proveedor.setComprobante(nombreArchivo);
            return;
        }

        // No se subió un archivo nuevo: si es una edición, conservamos el comprobante existente
        if (proveedor.getId() != null) {
            proveedorRepository.findById(proveedor.getId()).ifPresent(p -> {
                if (proveedor.getComprobante() == null) {
                    proveedor.setComprobante(p.getComprobante());
                }
            });
        }
    }

    @Transactional
    public boolean cambiarEstado(Integer id) {
        return proveedorRepository.findById(id).map(proveedor -> {
            proveedor.setEstado(!proveedor.isEstado());
            proveedorRepository.save(proveedor);
            return true;
        }).orElse(false);
    }

    @Transactional
    public boolean eliminar(Integer id) {
        try {
            if (proveedorRepository.existsById(id)) {
                proveedorRepository.deleteById(id);
                return true;
            }
            return false;
        } catch (DataIntegrityViolationException e) {
            // VALIDACIÓN 2: Proteger contra la eliminación de proveedores en uso
            throw new RuntimeException("No se puede eliminar este proveedor porque ya tiene productos o compras asociadas en el sistema.");
        }
    }
}