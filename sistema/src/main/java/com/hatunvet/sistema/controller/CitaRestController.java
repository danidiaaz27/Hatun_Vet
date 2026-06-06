package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.Cita;
import com.hatunvet.sistema.model.ConsultaClinica;
import com.hatunvet.sistema.service.CitaService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/citas")
public class CitaRestController {

    private final CitaService citaService;

    public CitaRestController(CitaService citaService) {
        this.citaService = citaService;
    }

    // =========================================================================
    // MODIFICADO: @GetMapping robusto con soporte opcional para filtros de fecha
    // =========================================================================
    @GetMapping
    public ResponseEntity<List<Cita>> listarCitas(
            @RequestParam(value = "inicio", required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            
            @RequestParam(value = "fin", required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        
        // Se llama al método sobrecargado del servicio pasando los parámetros parseados
        return ResponseEntity.ok(citaService.obtenerTodasLasCitas(inicio, fin));
    }

    // =========================================================================
    // MÉTODOS OPERATIVOS SE MANTIENEN IGUAL
    // =========================================================================
    @PostMapping
    public ResponseEntity<Map<String, Object>> crearCita(@RequestBody Cita nuevaCita) {
        Map<String, Object> response = new HashMap<>();
        try {
            nuevaCita.setEstado("AGENDADA"); 
            Cita citaGuardada = citaService.guardarCita(nuevaCita);
            response.put("success", true);
            response.put("message", "Cita agendada correctamente.");
            response.put("data", Map.of("id", citaGuardada.getId()));
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
            response.put("data", Map.of("id", cita.getId()));
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
            response.put("data", Map.of("id", cita.getId()));
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
            response.put("data", Map.of("id", consulta.getId()));
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
            response.put("data", Map.of("id", cita.getId()));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // --- ENDPOINT HISTORIAL PERPETUO ---
    @GetMapping("/historial/{mascotaId}")
    public ResponseEntity<List<Map<String, Object>>> verHistorial(@PathVariable String mascotaId) {
        return ResponseEntity.ok(citaService.obtenerHistorialMascota(mascotaId));
    }

    // --- ENDPOINT PUENTE AL POS ---
    @GetMapping("/por-cobrar")
    public ResponseEntity<List<Map<String, Object>>> citasPorCobrar() {
        return ResponseEntity.ok(citaService.obtenerCitasParaFacturacion());
    }
}