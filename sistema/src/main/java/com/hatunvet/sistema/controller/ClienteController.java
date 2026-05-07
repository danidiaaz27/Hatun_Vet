package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.Cliente;
import com.hatunvet.sistema.repository.BanoCorteRepository;
import com.hatunvet.sistema.repository.ClienteRepository;
import com.hatunvet.sistema.repository.VentaRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
@RequestMapping("/clientes")
public class ClienteController {

    private final ClienteRepository clienteRepository;
    private final VentaRepository ventaRepository;
    private final BanoCorteRepository banoCorteRepository;

    public ClienteController(ClienteRepository clienteRepository, VentaRepository ventaRepository, BanoCorteRepository banoCorteRepository) {
        this.clienteRepository = clienteRepository;
        this.ventaRepository = ventaRepository;
        this.banoCorteRepository = banoCorteRepository;
    }

    @GetMapping
    public String index() {
        return "clientes";
    }

    @GetMapping("/api/listar")
    @ResponseBody
    public Map<String, Object> listar() {
        Map<String, Object> res = new HashMap<>();
        res.put("data", clienteRepository.findAllByOrderByNombreCompletoAsc());
        return res;
    }

    @PostMapping("/api/guardar")
    @ResponseBody
    public Map<String, Object> guardar(@RequestBody Cliente cliente) {
        Map<String, Object> res = new HashMap<>();
        try {
            Optional<Cliente> existente = clienteRepository.findByNumeroDocumento(cliente.getNumeroDocumento());

            if (existente.isPresent() && (cliente.getId() == null || !existente.get().getId().equals(cliente.getId()))) {
                res.put("success", false);
                res.put("message", "Ya existe un cliente registrado con ese número de documento.");
                return res;
            }

            clienteRepository.save(cliente);
            res.put("success", true);
            res.put("message", "Cliente guardado correctamente");
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "Error: " + e.getMessage());
        }
        return res;
    }

    @GetMapping("/api/historial/{numDocumento}")
    @ResponseBody
    public Map<String, Object> obtenerHistorial(@PathVariable String numDocumento) {
        Map<String, Object> response = new HashMap<>();

        try {
            response.put("compras", ventaRepository.findByNumDocOrderByFechaEmisionDesc(numDocumento));
            response.put("peluqueria", banoCorteRepository.findByDniDuenoOrderByFechaServicioDesc(numDocumento));
            response.put("clinica", List.of());
            response.put("success", true);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al cargar historial: " + e.getMessage());
        }

        return response;
    }

    @DeleteMapping("/api/eliminar/{id}")
    @ResponseBody
    public Map<String, Object> eliminar(@PathVariable Integer id) {
        Map<String, Object> res = new HashMap<>();
        try {
            clienteRepository.deleteById(id);
            res.put("success", true);
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "No se puede eliminar este cliente porque tiene historial asociado.");
        }
        return res;
    }
}