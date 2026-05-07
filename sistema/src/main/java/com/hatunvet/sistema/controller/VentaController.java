package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.Producto;
import com.hatunvet.sistema.repository.ProductoRepository;
import com.hatunvet.sistema.repository.VentaRepository;
import com.hatunvet.sistema.service.ClienteConsultaService;
import com.hatunvet.sistema.service.VentaService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/ventas")
public class VentaController {

    private final ProductoRepository productoRepository;
    private final VentaService ventaService;
    private final VentaRepository ventaRepository;
    private final ClienteConsultaService clienteConsultaService;

    // Constructor con todos los servicios inyectados
    public VentaController(ProductoRepository productoRepository,
                           VentaService ventaService,
                           VentaRepository ventaRepository,
                           ClienteConsultaService clienteConsultaService) {
        this.productoRepository = productoRepository;
        this.ventaService = ventaService;
        this.ventaRepository = ventaRepository;
        this.clienteConsultaService = clienteConsultaService;
    }

    // 1. Mostrar la pantalla del Punto de Venta (HTML)
    @GetMapping("/pos")
    public String vistaPuntoDeVenta() {
        return "pos";
    }

    // 2. Buscador en vivo de productos para el carrito
    @GetMapping("/api/buscar-producto")
    @ResponseBody
    public Map<String, Object> buscarProducto(@RequestParam String termino) {
        Map<String, Object> response = new HashMap<>();

        List<Producto> encontrados = productoRepository.findByEstadoTrue().stream()
                .filter(p -> p.getCodigo().toLowerCase().contains(termino.toLowerCase()) ||
                        p.getNombre().toLowerCase().contains(termino.toLowerCase()))
                .toList();

        if (!encontrados.isEmpty()) {
            response.put("success", true);
            response.put("data", encontrados);
        } else {
            response.put("success", false);
            response.put("message", "No se encontraron productos");
        }
        return response;
    }

    // 3. Procesar la venta, guardar en BD y conectar con Miapicloud
    @PostMapping("/api/procesar")
    @ResponseBody
    public Map<String, Object> procesarVenta(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> respuestaMiapicloud = ventaService.procesarVentaYFacturar(payload);
            response.put("success", true);
            response.put("miapicloud", respuestaMiapicloud);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al procesar la venta: " + e.getMessage());
        }
        return response;
    }

    // 4. Mostrar la vista del Historial (HTML)
    @GetMapping("/historial")
    public String vistaHistorial() {
        return "historial-ventas";
    }

    // 5. API para obtener todas las ventas ordenadas por la más reciente
    @GetMapping("/api/historial")
    @ResponseBody
    public Map<String, Object> apiListarHistorial() {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("success", true);
            response.put("data", ventaRepository.findAllByOrderByFechaEmisionDesc());
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al cargar el historial: " + e.getMessage());
        }
        return response;
    }

    // 6. Consultar DNI / RUC a Miapicloud
    @GetMapping("/api/consultar-cliente")
    @ResponseBody
    public Map<String, Object> consultarCliente(@RequestParam String tipoDoc, @RequestParam String numero) {
        return clienteConsultaService.consultarDocumento(tipoDoc, numero);
    }
}