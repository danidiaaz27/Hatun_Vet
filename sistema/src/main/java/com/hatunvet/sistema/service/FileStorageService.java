package com.hatunvet.sistema.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    // La carpeta física donde se guardarán las imágenes
    private final Path fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

    public FileStorageService() {
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("No se pudo crear el directorio donde se subirán los archivos.", ex);
        }
    }

    public String guardarArchivo(MultipartFile file) {
        if (file == null || file.isEmpty()) return null;

        try {
            // Limpiamos el nombre original y le agregamos un UUID para que nunca se repita
            String originalFileName = file.getOriginalFilename();
            String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            String fileName = UUID.randomUUID().toString() + fileExtension;

            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return fileName; // Retornamos el nombre generado para guardarlo en MySQL
        } catch (IOException ex) {
            throw new RuntimeException("No se pudo guardar el archivo " + file.getOriginalFilename(), ex);
        }
    }

    public void eliminarArchivo(String fileName) {
        if (fileName != null && !fileName.isEmpty()) {
            try {
                Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
                Files.deleteIfExists(filePath);
            } catch (IOException ex) {
                System.err.println("No se pudo eliminar el archivo: " + fileName);
            }
        }
    }
}