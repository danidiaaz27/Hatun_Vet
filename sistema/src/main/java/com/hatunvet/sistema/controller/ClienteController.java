package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.Cliente;
import com.hatunvet.sistema.repository.BanoCorteRepository;
import com.hatunvet.sistema.repository.ClienteRepository;
import com.hatunvet.sistema.repository.VentaRepository;
import org.springframework.dao.DataIntegrityViolationException;
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
    public String index() { return "clientes"; }

    @GetMapping("/api/listar")
    @ResponseBody
    public Map<String, Object> listar() {
        Map<String, Object> res = new HashMap<>();
        res.put("data", clienteRepository.findAllByOrderByNombreCompletoAsc());
        return res;
    }

    @GetMapping("/api/{id}")
    @ResponseBody
    public Map<String, Object> obtener(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        clienteRepository.findById(id).ifPresentOrElse(
                c -> { response.put("success", true); response.put("data", c); },
                () -> { response.put("success", false); response.put("message", "Cliente no encontrado"); }
        );
        return response;
    }

    @PostMapping("/api/guardar")
    @ResponseBody
    public Map<String, Object> guardar(@RequestBody Cliente cliente) {
        Map<String, Object> res = new HashMap<>();
        try {
            cliente.setNumeroDocumento(cliente.getNumeroDocumento() != null ? cliente.getNumeroDocumento().trim() : "");
            cliente.setNombreCompleto(cliente.getNombreCompleto() != null ? cliente.getNombreCompleto().trim() : "");

            if (cliente.getNumeroDocumento().isEmpty() || cliente.getNombreCompleto().isEmpty()) {
                res.put("success", false);
                res.put("message", "El número de documento y el nombre son obligatorios.");
                return res;
            }

            if ("1".equals(cliente.getTipoDocumento()) && cliente.getNumeroDocumento().length() != 8) {
                res.put("success", false);
                res.put("message", "El DNI debe tener exactamente 8 dígitos.");
                return res;
            }
            if ("6".equals(cliente.getTipoDocumento()) && cliente.getNumeroDocumento().length() != 11) {
                res.put("success", false);
                res.put("message", "El RUC debe tener exactamente 11 dígitos.");
                return res;
            }

            Optional<Cliente> existente = clienteRepository.findByNumeroDocumento(cliente.getNumeroDocumento());
            if (existente.isPresent() && (cliente.getId() == null || !existente.get().getId().equals(cliente.getId()))) {
                res.put("success", false);
                res.put("message", "Ya existe un cliente registrado con ese número de documento.");
                return res;
            }

            if (cliente.getId() != null) {
                clienteRepository.findById(cliente.getId()).ifPresent(c -> cliente.setFechaRegistro(c.getFechaRegistro()));
            }

            Cliente saved = clienteRepository.save(cliente);
            res.put("success", true);
            res.put("message", "Cliente guardado correctamente");
            res.put("data", saved);
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "Error interno al guardar el cliente.");
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
        } catch (DataIntegrityViolationException e) {
            res.put("success", false);
            res.put("message", "No se puede eliminar este cliente porque tiene historial de compras o peluquería asociado.");
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "Error interno al intentar eliminar al cliente.");
        }
        return res;
    }
}