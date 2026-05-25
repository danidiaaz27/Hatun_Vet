package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.InventarioMovimiento;
import com.hatunvet.sistema.model.Producto;
import com.hatunvet.sistema.repository.InventarioMovimientoRepository;
import com.hatunvet.sistema.repository.ProductoRepository;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
@RequestMapping("/inventario")
public class InventarioController {

    private final InventarioMovimientoRepository inventarioRepo;
    private final ProductoRepository productoRepo;

    public InventarioController(InventarioMovimientoRepository inventarioRepo, ProductoRepository productoRepo) {
        this.inventarioRepo = inventarioRepo;
        this.productoRepo = productoRepo;
    }

    @GetMapping
    public String index() {
        return "inventario";
    }

    @GetMapping("/api/productos")
    @ResponseBody
    public Map<String, Object> listarProductosInventario() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", productoRepo.findAllByOrderByNombreAsc());
        return response;
    }

    @GetMapping("/api/kardex/{productoId}")
    @ResponseBody
    public Map<String, Object> obtenerKardex(@PathVariable String productoId) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", inventarioRepo.findByProductoIdOrderByFechaRegistroDesc(productoId));
        return response;
    }

    @PostMapping("/api/registrar")
    @ResponseBody
    @Transactional
    public Map<String, Object> registrarMovimiento(@RequestBody InventarioMovimiento movimiento, @RequestParam String idProducto) {
        Map<String, Object> response = new HashMap<>();

        try {
            // VALIDACIÓN 1: Jamás aceptar cantidades <= 0 (Evita hackeo por ley de signos)
            if (movimiento.getCantidad() == null || movimiento.getCantidad() <= 0) {
                response.put("success", false);
                response.put("message", "Operación rechazada. La cantidad debe ser mayor a 0.");
                return response;
            }

            // VALIDACIÓN 2: Lista blanca de Movimientos
            String tipo = movimiento.getTipoMovimiento();
            List<String> validTypes = List.of("COMPRA", "AJUSTE POSITIVO", "CONSUMO INTERNO", "MERMA POR VENCIMIENTO", "AJUSTE NEGATIVO");
            if (!validTypes.contains(tipo)) {
                response.put("success", false);
                response.put("message", "Operación rechazada. Tipo de movimiento no autorizado.");
                return response;
            }

            Optional<Producto> prodOpt = productoRepo.findById(idProducto);
            if (prodOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Producto no encontrado en la base de datos.");
                return response;
            }

            Producto producto = prodOpt.get();
            movimiento.setProducto(producto);

            int stockActual = producto.getStock();
            int cantidadMovimiento = movimiento.getCantidad(); // Ya sabemos que es positivo seguro

            // LOGICA MATEMATICA SEGURA
            if (tipo.equals("COMPRA") || tipo.equals("AJUSTE POSITIVO")) {
                producto.setStock(stockActual + cantidadMovimiento);
                // El registro de BD guarda cantidad en positivo
            } else {
                // Son salidas (CONSUMO, MERMA, AJUSTE NEGATIVO)
                if (stockActual < cantidadMovimiento) {
                    response.put("success", false);
                    response.put("message", "No hay stock suficiente. Stock actual: " + stockActual);
                    return response;
                }
                producto.setStock(stockActual - cantidadMovimiento);
                movimiento.setCantidad(-cantidadMovimiento); // Guardamos en negativo para el Kardex visual
            }

            productoRepo.save(producto);
            inventarioRepo.save(movimiento);

            response.put("success", true);
            response.put("message", "Movimiento registrado exitosamente. Nuevo stock: " + producto.getStock());

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error interno al registrar: " + e.getMessage());
        }

        return response;
    }
}