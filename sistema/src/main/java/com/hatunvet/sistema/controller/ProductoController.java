package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.Producto;
import com.hatunvet.sistema.service.CategoriaProductoService;
import com.hatunvet.sistema.service.ProductoService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/productos")
public class ProductoController {

    private final ProductoService productoService;
    private final CategoriaProductoService categoriaService;

    public ProductoController(ProductoService productoService, CategoriaProductoService categoriaService) {
        this.productoService = productoService;
        this.categoriaService = categoriaService;
    }

    @GetMapping("/listar")
    public String vistaProductos() {
        return "productos";
    }

    @GetMapping("/api/listar")
    @ResponseBody
    public Map<String, Object> apiListar() {
        Map<String, Object> response = new HashMap<>();
        response.put("data", productoService.listarTodos());
        return response;
    }

    @GetMapping("/api/categorias")
    @ResponseBody
    public Map<String, Object> apiListarCategorias() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", categoriaService.listarCategorias());
        return response;
    }

    @GetMapping("/api/{id}")
    @ResponseBody
    public Map<String, Object> apiObtener(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        productoService.obtenerPorId(id).ifPresentOrElse(
                producto -> {
                    response.put("success", true);
                    response.put("data", producto);
                },
                () -> {
                    response.put("success", false);
                    response.put("message", "Producto no encontrado");
                }
        );
        return response;
    }

    @PostMapping("/api/guardar")
    @ResponseBody
    public Map<String, Object> apiGuardar(
            @ModelAttribute Producto producto,
            @RequestParam(value = "imagenFile", required = false) MultipartFile imagenFile) {

        Map<String, Object> response = new HashMap<>();
        try {
            productoService.guardar(producto, imagenFile);
            response.put("success", true);
            response.put("message", "Producto guardado correctamente");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al guardar: " + e.getMessage());
        }
        return response;
    }

    @PostMapping("/api/cambiar-estado/{id}")
    @ResponseBody
    public Map<String, Object> apiCambiarEstado(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        boolean ok = productoService.cambiarEstado(id);
        response.put("success", ok);
        response.put("message", ok ? "Estado actualizado" : "Error al actualizar");
        return response;
    }

    @DeleteMapping("/api/eliminar/{id}")
    @ResponseBody
    public Map<String, Object> apiEliminar(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean ok = productoService.eliminar(id);
            response.put("success", ok);
            response.put("message", ok ? "Producto eliminado" : "No se pudo eliminar");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al eliminar. Verifique dependencias.");
        }
        return response;
    }
}