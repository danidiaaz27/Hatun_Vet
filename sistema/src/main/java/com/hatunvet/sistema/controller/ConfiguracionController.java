package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.Configuracion;
import com.hatunvet.sistema.model.LandingImagen;
import com.hatunvet.sistema.service.ConfiguracionService;
import com.hatunvet.sistema.service.LandingImagenService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/configuracion")
public class ConfiguracionController {

    private final ConfiguracionService configuracionService;
    private final LandingImagenService landingImagenService;

    public ConfiguracionController(ConfiguracionService configuracionService, LandingImagenService landingImagenService) {
        this.configuracionService = configuracionService;
        this.landingImagenService = landingImagenService;
    }

    @GetMapping
    public String vistaConfiguracion() {
        return "configuracion";
    }

    @GetMapping("/api/datos")
    @ResponseBody
    public Map<String, Object> apiObtenerDatos() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", configuracionService.obtenerConfiguracion());
        return response;
    }

    @PostMapping("/api/datos")
    @ResponseBody
    public Map<String, Object> apiGuardarDatos(@ModelAttribute Configuracion configuracion,
                                               @RequestParam(value = "logoFile", required = false) MultipartFile logoFile) {
        Map<String, Object> response = new HashMap<>();
        try {
            configuracionService.guardarConfiguracion(configuracion, logoFile);
            response.put("success", true);
            response.put("message", "Configuración guardada correctamente");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al guardar: " + e.getMessage());
        }
        return response;
    }

    @GetMapping("/api/imagenes")
    @ResponseBody
    public Map<String, Object> apiListarImagenes() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", landingImagenService.listarTodas());
        return response;
    }

    @GetMapping("/api/imagenes/{id}")
    @ResponseBody
    public Map<String, Object> apiObtenerImagen(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        landingImagenService.obtenerPorId(id).ifPresentOrElse(
                imagen -> {
                    response.put("success", true);
                    response.put("data", imagen);
                },
                () -> {
                    response.put("success", false);
                    response.put("message", "Imagen no encontrada");
                }
        );
        return response;
    }

    @PostMapping("/api/imagenes/guardar")
    @ResponseBody
    public Map<String, Object> apiGuardarImagen(@ModelAttribute LandingImagen landingImagen,
                                                @RequestParam(value = "imagenFile", required = false) MultipartFile imagenFile) {
        Map<String, Object> response = new HashMap<>();
        try {
            landingImagenService.guardar(landingImagen, imagenFile);
            response.put("success", true);
            response.put("message", "Imagen guardada correctamente");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al guardar: " + e.getMessage());
        }
        return response;
    }

    @PostMapping("/api/imagenes/cambiar-estado/{id}")
    @ResponseBody
    public Map<String, Object> apiCambiarEstadoImagen(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        boolean ok = landingImagenService.cambiarEstado(id);
        response.put("success", ok);
        response.put("message", ok ? "Estado actualizado" : "Error al actualizar");
        return response;
    }

    @DeleteMapping("/api/imagenes/eliminar/{id}")
    @ResponseBody
    public Map<String, Object> apiEliminarImagen(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        boolean ok = landingImagenService.eliminar(id);
        response.put("success", ok);
        response.put("message", ok ? "Imagen eliminada" : "Error al eliminar");
        return response;
    }
}