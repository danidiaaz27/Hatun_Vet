package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.Cita;
import com.hatunvet.sistema.model.ConsultaClinica;
import com.hatunvet.sistema.service.CitaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.math.BigDecimal;
import com.hatunvet.sistema.model.ConsultaInsumo;

@RestController
@RequestMapping("/api/citas")
public class CitaRestController {

    private final CitaService citaService;

    public CitaRestController(CitaService citaService) {
        this.citaService = citaService;
    }

    @GetMapping
    public ResponseEntity<List<Cita>> listarCitas() {
        return ResponseEntity.ok(citaService.obtenerTodasLasCitas());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> crearCita(@RequestBody Cita nuevaCita) {
        Map<String, Object> response = new HashMap<>();
        try {
            nuevaCita.setEstado("AGENDADA"); 
            Cita citaGuardada = citaService.guardarCita(nuevaCita);
            response.put("success", true);
            response.put("message", "Cita agendada correctamente.");
            response.put("data", citaGuardada);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/{id}/check-in")
    public ResponseEntity<Map<String, Object>> hacerCheckIn(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Cita cita = citaService.registrarLlegadaPaciente(id);
            response.put("success", true);
            response.put("message", "Paciente en sala de espera. ¡No olvide cobrar la consulta base!");
            response.put("data", cita);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/{id}/iniciar-atencion")
    public ResponseEntity<Map<String, Object>> iniciarAtencion(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Cita cita = citaService.iniciarAtencionMedica(id);
            response.put("success", true);
            response.put("message", "Atención iniciada. Registre las constantes vitales.");
            response.put("data", cita);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/{id}/guardar-anamnesis")
    public ResponseEntity<Map<String, Object>> guardarAnamnesis(@PathVariable String id, @RequestBody ConsultaClinica datos) {
        Map<String, Object> response = new HashMap<>();
        try {
            ConsultaClinica consulta = citaService.guardarAnamnesis(id, datos);
            response.put("success", true);
            response.put("message", "Anamnesis guardada correctamente.");
            response.put("data", consulta);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}/consulta")
    public ResponseEntity<Map<String, Object>> obtenerConsultaByCitaId(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<ConsultaClinica> consultaOpt = citaService.obtenerConsultaPorCita(id);
            if (consultaOpt.isPresent()) {
                response.put("success", true);
                response.put("data", consultaOpt.get());
            } else {
                response.put("success", false);
                response.put("message", "No hay anamnesis registrada aún.");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<Map<String, Object>> finalizarCita(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Cita cita = citaService.finalizarCita(id);
            response.put("success", true);
            response.put("message", "Cita finalizada. Lista para cobro en Caja.");
            response.put("data", cita);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}/insumos")
    public ResponseEntity<List<Map<String, Object>>> listarInsumos(@PathVariable String id) {
        try {
            Optional<ConsultaClinica> consultaOpt = citaService.obtenerConsultaPorCita(id);
            if (consultaOpt.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }
            List<ConsultaInsumo> insumos = citaService.obtenerInsumosConsulta(consultaOpt.get().getId());
            List<Map<String, Object>> response = insumos.stream().map(ins -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", ins.getId());
                item.put("productoId", ins.getProducto().getId());
                item.put("productoNombre", ins.getProducto().getNombre());
                item.put("cantidadUsada", ins.getCantidadUsada());
                item.put("unidadMedida", ins.getUnidadMedida());
                item.put("precioCobrado", ins.getPrecioCobrado());
                return item;
            }).toList();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/{id}/insumos")
    public ResponseEntity<Map<String, Object>> registrarInsumo(
            @PathVariable String id, 
            @RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<ConsultaClinica> consultaOpt = citaService.obtenerConsultaPorCita(id);
            if (consultaOpt.isEmpty()) {
                throw new IllegalStateException("Debe guardar la anamnesis (peso, temperatura, etc.) al menos una vez antes de registrar insumos.");
            }
            String productoId = (String) payload.get("productoId");
            BigDecimal cantidadUsada = new BigDecimal(payload.get("cantidadUsada").toString());
            
            ConsultaInsumo insumo = citaService.registrarInsumo(consultaOpt.get().getId(), productoId, cantidadUsada);
            
            response.put("success", true);
            response.put("message", "Insumo registrado correctamente.");
            response.put("data", insumo.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/insumos/{insumoId}")
    public ResponseEntity<Map<String, Object>> revertirInsumo(@PathVariable Long insumoId) {
        Map<String, Object> response = new HashMap<>();
        try {
            citaService.revertirInsumo(insumoId);
            response.put("success", true);
            response.put("message", "Insumo retirado y stock revertido.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // --- NUEVO: ENDPOINT HISTORIAL PERPETUO ---
    @GetMapping("/historial/{mascotaId}")
    public ResponseEntity<List<Map<String, Object>>> verHistorial(@PathVariable String mascotaId) {
        return ResponseEntity.ok(citaService.obtenerHistorialMascota(mascotaId));
    }

    // --- NUEVO: ENDPOINT PUENTE AL POS ---
    @GetMapping("/por-cobrar")
    public ResponseEntity<List<Map<String, Object>>> citasPorCobrar() {
        return ResponseEntity.ok(citaService.obtenerCitasParaFacturacion());
    }
}