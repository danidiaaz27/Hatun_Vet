package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.Promocion;
import com.hatunvet.sistema.service.PromocionService;
import com.hatunvet.sistema.repository.ProductoRepository;
import com.hatunvet.sistema.repository.CategoriaProductoRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class PromocionController {

    private final PromocionService promocionService;
    private final ProductoRepository productoRepository;
    private final CategoriaProductoRepository categoriaRepository;

    public PromocionController(PromocionService promocionService, ProductoRepository productoRepository, CategoriaProductoRepository categoriaRepository) {
        this.promocionService = promocionService;
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping("/promociones")
    public String index() {
        return "promociones";
    }

    @GetMapping("/promociones/api/listar")
    @ResponseBody
    public Map<String, Object> listar() {
        Map<String, Object> res = new HashMap<>();
        res.put("data", promocionService.obtenerTodas());
        return res;
    }

    @GetMapping("/promociones/api/activas")
    @ResponseBody
    public List<Promocion> listarActivas() {
        return promocionService.obtenerActivasYVigentes();
    }

    @PostMapping("/promociones/api/guardar")
    @ResponseBody
    public Map<String, Object> guardar(@RequestBody Promocion promocion) {
        Map<String, Object> res = new HashMap<>();
        try {
            if (promocion.getProducto() != null && promocion.getProducto().getId() != null && !promocion.getProducto().getId().isEmpty()) {
                productoRepository.findById(promocion.getProducto().getId()).ifPresent(promocion::setProducto);
            } else {
                promocion.setProducto(null);
            }
            
            if (promocion.getCategoria() != null && promocion.getCategoria().getId() != null && !promocion.getCategoria().getId().isEmpty()) {
                categoriaRepository.findById(promocion.getCategoria().getId()).ifPresent(promocion::setCategoria);
            } else {
                promocion.setCategoria(null);
            }
            
            if (promocion.getProductoRegalo() != null && promocion.getProductoRegalo().getId() != null && !promocion.getProductoRegalo().getId().isEmpty()) {
                productoRepository.findById(promocion.getProductoRegalo().getId()).ifPresent(promocion::setProductoRegalo);
            } else {
                promocion.setProductoRegalo(null);
            }

            promocionService.guardar(promocion);
            res.put("success", true);
            res.put("message", "Promoción guardada correctamente.");
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "Error: " + e.getMessage());
        }
        return res;
    }

    @DeleteMapping("/promociones/api/eliminar/{id}")
    @ResponseBody
    public Map<String, Object> eliminar(@PathVariable String id) {
        Map<String, Object> res = new HashMap<>();
        try {
            promocionService.eliminar(id);
            res.put("success", true);
            res.put("message", "Promoción eliminada correctamente.");
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "Error: " + e.getMessage());
        }
        return res;
    }
}
