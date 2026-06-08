package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.Cita;
import com.hatunvet.sistema.model.HorarioVeterinario;
import com.hatunvet.sistema.model.PermisoVeterinario;
import com.hatunvet.sistema.model.Usuario;
import com.hatunvet.sistema.repository.CitaRepository;
import com.hatunvet.sistema.repository.HorarioVeterinarioRepository;
import com.hatunvet.sistema.repository.PermisoVeterinarioRepository;
import com.hatunvet.sistema.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/medicos")
public class MedicoController {

    private final UsuarioRepository usuarioRepository;
    private final HorarioVeterinarioRepository horarioRepository;
    private final PermisoVeterinarioRepository permisoRepository;
    private final CitaRepository citaRepository;

    public MedicoController(UsuarioRepository usuarioRepository,
                            HorarioVeterinarioRepository horarioRepository,
                            PermisoVeterinarioRepository permisoRepository,
                            CitaRepository citaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.horarioRepository = horarioRepository;
        this.permisoRepository = permisoRepository;
        this.citaRepository    = citaRepository;
    }

    // 1. Renderizar la vista principal de gestión
    @GetMapping("/horarios")
    public String index() {
        return "medicos";
    }

    // 2. Obtener lista de horarios de un veterinario específico
    @GetMapping("/api/{vetId}/horarios")
    @ResponseBody
    public ResponseEntity<List<HorarioVeterinario>> obtenerHorarios(@PathVariable String vetId) {
        return ResponseEntity.ok(horarioRepository.findByVeterinarioId(vetId));
    }

    // 3. Guardar/Añadir un horario semanal
    @PostMapping("/api/horarios")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> guardarHorario(@RequestBody HorarioVeterinario nuevoHorario) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (nuevoHorario.getVeterinario() == null || nuevoHorario.getVeterinario().getId() == null) {
                response.put("success", false);
                response.put("message", "El médico es obligatorio.");
                return ResponseEntity.badRequest().body(response);
            }
            if (nuevoHorario.getDiaSemana() == null || nuevoHorario.getDiaSemana() < 1 || nuevoHorario.getDiaSemana() > 7) {
                response.put("success", false);
                response.put("message", "El día de la semana debe estar entre 1 (Lunes) y 7 (Domingo).");
                return ResponseEntity.badRequest().body(response);
            }
            if (nuevoHorario.getHoraInicio() == null || nuevoHorario.getHoraFin() == null) {
                response.put("success", false);
                response.put("message", "Las horas de inicio y fin son obligatorias.");
                return ResponseEntity.badRequest().body(response);
            }
            if (nuevoHorario.getHoraInicio().isAfter(nuevoHorario.getHoraFin()) || nuevoHorario.getHoraInicio().equals(nuevoHorario.getHoraFin())) {
                response.put("success", false);
                response.put("message", "La hora de inicio debe ser anterior a la hora de fin.");
                return ResponseEntity.badRequest().body(response);
            }

            List<HorarioVeterinario> existentes = horarioRepository.findByVeterinarioIdAndDiaSemana(
                    nuevoHorario.getVeterinario().getId(), nuevoHorario.getDiaSemana());
            for (HorarioVeterinario h : existentes) {
                if (nuevoHorario.getHoraInicio().isBefore(h.getHoraFin()) && nuevoHorario.getHoraFin().isAfter(h.getHoraInicio())) {
                    response.put("success", false);
                    response.put("message", "El horario ingresado se solapa con otro horario existente para ese día.");
                    return ResponseEntity.badRequest().body(response);
                }
            }

            Usuario vet = usuarioRepository.findById(nuevoHorario.getVeterinario().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Médico no encontrado."));
            nuevoHorario.setVeterinario(vet);

            HorarioVeterinario guardado = horarioRepository.save(nuevoHorario);
            response.put("success", true);
            response.put("message", "Horario guardado con éxito.");
            response.put("data", guardado);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error interno al guardar el horario: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 4. Eliminar un horario
    @DeleteMapping("/api/horarios/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> eliminarHorario(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (!horarioRepository.existsById(id)) {
                response.put("success", false);
                response.put("message", "Horario no encontrado.");
                return ResponseEntity.badRequest().body(response);
            }
            horarioRepository.deleteById(id);
            response.put("success", true);
            response.put("message", "Horario eliminado con éxito.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al eliminar el horario.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 5. Obtener lista de permisos de un veterinario específico
    @GetMapping("/api/{vetId}/permisos")
    @ResponseBody
    public ResponseEntity<List<PermisoVeterinario>> obtenerPermisos(@PathVariable String vetId) {
        return ResponseEntity.ok(permisoRepository.findByVeterinarioId(vetId));
    }

    // 6. Guardar/Añadir un permiso de ausencia
    @PostMapping("/api/permisos")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> guardarPermiso(@RequestBody PermisoVeterinario nuevoPermiso) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (nuevoPermiso.getVeterinario() == null || nuevoPermiso.getVeterinario().getId() == null) {
                response.put("success", false);
                response.put("message", "El médico es obligatorio.");
                return ResponseEntity.badRequest().body(response);
            }
            if (nuevoPermiso.getFechaInicio() == null || nuevoPermiso.getFechaFin() == null) {
                response.put("success", false);
                response.put("message", "Las fechas de inicio y fin son obligatorias.");
                return ResponseEntity.badRequest().body(response);
            }
            if (nuevoPermiso.getFechaInicio().isAfter(nuevoPermiso.getFechaFin()) || nuevoPermiso.getFechaInicio().equals(nuevoPermiso.getFechaFin())) {
                response.put("success", false);
                response.put("message", "La fecha de inicio debe ser anterior a la fecha de fin.");
                return ResponseEntity.badRequest().body(response);
            }
            if (nuevoPermiso.getMotivo() == null || nuevoPermiso.getMotivo().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "El motivo es obligatorio.");
                return ResponseEntity.badRequest().body(response);
            }

            Usuario vet = usuarioRepository.findById(nuevoPermiso.getVeterinario().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Médico no encontrado."));
            nuevoPermiso.setVeterinario(vet);

            PermisoVeterinario guardado = permisoRepository.save(nuevoPermiso);
            response.put("success", true);
            response.put("message", "Permiso/Ausencia guardado con éxito.");
            response.put("data", guardado);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error interno al guardar la ausencia: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 7. Togglear estado de un permiso
    @PostMapping("/api/permisos/{id}/toggle")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> togglePermiso(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            PermisoVeterinario permiso = permisoRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Permiso no encontrado."));
            permiso.setActivo(!permiso.isActivo());
            permisoRepository.save(permiso);
            response.put("success", true);
            response.put("message", "Estado de la ausencia modificado a: " + (permiso.isActivo() ? "ACTIVO" : "INACTIVO"));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al modificar la ausencia.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 8. Eliminar un permiso
    @DeleteMapping("/api/permisos/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> eliminarPermiso(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (!permisoRepository.existsById(id)) {
                response.put("success", false);
                response.put("message", "Permiso no encontrado.");
                return ResponseEntity.badRequest().body(response);
            }
            permisoRepository.deleteById(id);
            response.put("success", true);
            response.put("message", "Permiso eliminado con éxito.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al eliminar la ausencia.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 9. SLOTS DISPONIBLES
    // GET /medicos/api/slots-disponibles?medicoId=X&fecha=2026-06-08
    @GetMapping("/api/slots-disponibles")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> obtenerSlotsDisponibles(
            @RequestParam String medicoId,
            @RequestParam String fecha) {

        Map<String, Object> response = new HashMap<>();
        try {
            LocalDate localDate = LocalDate.parse(fecha);
            int diaSemana = localDate.getDayOfWeek().getValue(); // 1=Lunes ... 7=Domingo

            // Horarios del médico para ese día
            List<HorarioVeterinario> horarios = horarioRepository
                    .findByVeterinarioIdAndDiaSemana(medicoId, diaSemana);

            if (horarios.isEmpty()) {
                response.put("success", true);
                response.put("slots", new ArrayList<>());
                response.put("mensaje", "El médico no trabaja ese día.");
                return ResponseEntity.ok(response);
            }

            // Citas ya ocupadas ese día
            LocalDateTime inicioDia = localDate.atStartOfDay();
            LocalDateTime finDia    = localDate.atTime(23, 59, 59);
            List<String> estadosOcupados = List.of("AGENDADA", "EN_ESPERA", "EN_ATENCION");

            List<Cita> citasOcupadas = citaRepository
                    .findByVeterinarioIdAndFechaHoraProgramadaBetweenAndEstadoIn(
                            medicoId, inicioDia, finDia, estadosOcupados);

            List<LocalTime> horasOcupadas = citasOcupadas.stream()
                    .map(c -> c.getFechaHoraProgramada().toLocalTime()
                            .withMinute(0).withSecond(0).withNano(0))
                    .collect(Collectors.toList());

            // Generar slots de 1 hora por cada franja
            List<String> slotsDisponibles = new ArrayList<>();
            for (HorarioVeterinario h : horarios) {
                LocalTime cursor = h.getHoraInicio().withMinute(0);
                LocalTime fin    = h.getHoraFin();
                while (cursor.isBefore(fin)) {
                    if (!horasOcupadas.contains(cursor)) {
                        slotsDisponibles.add(String.format("%02d:%02d", cursor.getHour(), cursor.getMinute()));
                    }
                    cursor = cursor.plusHours(1);
                }
            }

            response.put("success", true);
            response.put("slots", slotsDisponibles);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al calcular slots: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}