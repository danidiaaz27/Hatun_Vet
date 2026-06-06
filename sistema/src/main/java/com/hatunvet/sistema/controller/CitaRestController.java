package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.Cita;
import com.hatunvet.sistema.model.ConsultaClinica;
import com.hatunvet.sistema.service.CitaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // --- CAMBIO: Endpoint actualizado para recibir el parámetro de confirmación ---
    @PostMapping("/{id}/check-in")
    public ResponseEntity<Map<String, Object>> hacerCheckIn(
            @PathVariable String id, 
            @RequestParam boolean costoBaseInformado) {
        
        Map<String, Object> response = new HashMap<>();
        try {
            // Se pasa el parámetro booleano directo al servicio modificado
            Cita cita = citaService.registrarLlegadaPaciente(id, costoBaseInformado);
            
            response.put("success", true);
            response.put("message", "Paciente en sala de espera. Check-in completado.");
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

    @GetMapping("/historial/{mascotaId}")
    public ResponseEntity<List<Map<String, Object>>> verHistorial(@PathVariable String mascotaId) {
        return ResponseEntity.ok(citaService.obtenerHistorialMascota(mascotaId));
    }

    @GetMapping("/por-cobrar")
    public ResponseEntity<List<Map<String, Object>>> citasPorCobrar() {
        return ResponseEntity.ok(citaService.obtenerCitasParaFacturacion());
    }
}