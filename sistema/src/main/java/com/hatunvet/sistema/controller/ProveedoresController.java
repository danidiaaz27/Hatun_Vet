package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.Proveedor;
import com.hatunvet.sistema.service.ProveedorService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/proveedores")
public class ProveedoresController {

    private final ProveedorService proveedorService;

    public ProveedoresController(ProveedorService proveedorService) {
        this.proveedorService = proveedorService;
    }

    @GetMapping("/listar")
    public String listarProveedores() {
        return "proveedores";
    }

    @GetMapping("/api/listar")
    @ResponseBody
    public Map<String, Object> apiListar() {
        Map<String, Object> response = new HashMap<>();
        response.put("data", proveedorService.listarTodos());
        return response;
    }

    @GetMapping("/api/{id}")
    @ResponseBody
    public Map<String, Object> apiObtener(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        proveedorService.obtenerPorId(id).ifPresentOrElse(
                proveedor -> {
                    response.put("success", true);
                    response.put("data", proveedor);
                },
                () -> {
                    response.put("success", false);
                    response.put("message", "Proveedor no encontrado");
                }
        );
        return response;
    }

    @PostMapping("/api/guardar")
    @ResponseBody
    public Map<String, Object> apiGuardar(@RequestBody Proveedor proveedor) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (proveedor.getNombre() == null || proveedor.getNombre().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "El nombre del proveedor es obligatorio");
                return response;
            }
            if (proveedor.getRuc() == null || proveedor.getRuc().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "El RUC es obligatorio");
                return response;
            }
            
            proveedorService.guardar(proveedor);
            response.put("success", true);
            response.put("message", "Proveedor guardado correctamente");
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al guardar: " + e.getMessage());
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/api/cambiar-estado/{id}")
    @ResponseBody
    public Map<String, Object> apiCambiarEstado(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        boolean ok = proveedorService.cambiarEstado(id);
        response.put("success", ok);
        response.put("message", ok ? "Estado actualizado" : "No se encontró el proveedor");
        return response;
    }

    @DeleteMapping("/api/eliminar/{id}")
    @ResponseBody
    public Map<String, Object> apiEliminar(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        boolean ok = proveedorService.eliminar(id);
        response.put("success", ok);
        response.put("message", ok ? "Proveedor eliminado correctamente" : "No se encontró el proveedor");
        return response;
    }
}