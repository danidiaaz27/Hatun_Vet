package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.CategoriaProducto;
import com.hatunvet.sistema.service.CategoriaProductoService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/categorias")
public class CategoriaProductoController {

    private final CategoriaProductoService categoriaService;

    public CategoriaProductoController(CategoriaProductoService categoriaService) {
        this.categoriaService = categoriaService;
    }

    // Retorna la vista HTML
    @GetMapping
    public String vistaCategorias() {
        return "categorias";
    }

    // --- API PARA DATATABLES Y AJAX ---

    @GetMapping("/api/listar")
    @ResponseBody
    public Map<String, Object> apiListar() {
        Map<String, Object> response = new HashMap<>();
        response.put("data", categoriaService.listarCategorias());
        return response;
    }

    @GetMapping("/api/{id}")
    @ResponseBody
    public Map<String, Object> apiObtener(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        categoriaService.obtenerCategoriaPorId(id).ifPresentOrElse(
                cat -> { response.put("success", true); response.put("data", cat); },
                () -> { response.put("success", false); response.put("message", "Categoría no encontrada"); }
        );
        return response;
    }

    @PostMapping("/api/guardar")
    @ResponseBody
    public Map<String, Object> apiGuardar(@RequestBody CategoriaProducto categoria) {
        Map<String, Object> response = new HashMap<>();
        try {
            categoriaService.guardarCategoria(categoria);
            response.put("success", true);
            response.put("message", "Categoría guardada con éxito");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al guardar");
        }
        return response;
    }

    @PostMapping("/api/cambiar-estado/{id}")
    @ResponseBody
    public Map<String, Object> apiCambiarEstado(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        boolean ok = categoriaService.cambiarEstado(id);
        response.put("success", ok);
        response.put("message", ok ? "Estado actualizado" : "Error al actualizar");
        return response;
    }

    @DeleteMapping("/api/eliminar/{id}")
    @ResponseBody
    public Map<String, Object> apiEliminar(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        boolean ok = categoriaService.eliminarCategoria(id);
        response.put("success", ok);
        response.put("message", ok ? "Categoría eliminada" : "Error al eliminar. Verifique si tiene productos asociados.");
        return response;
    }
}