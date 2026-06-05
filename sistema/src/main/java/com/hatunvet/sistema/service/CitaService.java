package com.hatunvet.sistema.service;

import com.hatunvet.sistema.model.*;
import com.hatunvet.sistema.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CitaService {

    private final CitaRepository citaRepository;
    private final ConsultaClinicaRepository consultaRepository;
    private final ConsultaInsumoRepository insumoRepository;
    private final ServicioTerceroRepository terceroRepository;

    public CitaService(CitaRepository citaRepository, ConsultaClinicaRepository consultaRepository, 
                       ConsultaInsumoRepository insumoRepository, ServicioTerceroRepository terceroRepository) {
        this.citaRepository = citaRepository;
        this.consultaRepository = consultaRepository;
        this.insumoRepository = insumoRepository;
        this.terceroRepository = terceroRepository;
    }

    // --- MÉTODOS BÁSICOS DE AGENDA ---
    public List<Cita> obtenerTodasLasCitas() {
        return citaRepository.findAll();
    }

    @Transactional
    public Cita guardarCita(Cita cita) {
        return citaRepository.save(cita);
    }

    // --- 1. FLUJO DEL COUNTER ---
    @Transactional
    public Cita registrarLlegadaPaciente(String citaId) {
        Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada"));
        
        if (!cita.getEstado().equals("AGENDADA")) {
            throw new IllegalStateException("La cita no está en estado AGENDADA.");
        }

        cita.setEstado("EN_ESPERA");
        cita.setFechaHoraLlegada(LocalDateTime.now());
        // El counter marca el check de que sí avisó el costo base
        cita.setCostoBaseInformado(true); 
        return citaRepository.save(cita);
    }

    // --- 2. FLUJO DEL MÉDICO ---
    @Transactional
    public Cita iniciarAtencionMedica(String citaId) {
        Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada"));
        
        cita.setEstado("EN_ATENCION");
        return citaRepository.save(cita);
    }

    @Transactional
    public ConsultaClinica guardarAnamnesis(String citaId, ConsultaClinica datosClinicos) {
        // Regla estricta: No se guarda si faltan constantes vitales
        if (datosClinicos.getPesoKg() == null || datosClinicos.getTemperaturaC() == null || 
            datosClinicos.getSintomas().trim().isEmpty() || datosClinicos.getDiagnosticoPresuntivo().trim().isEmpty()) {
            throw new IllegalArgumentException("El peso, temperatura, síntomas y diagnóstico son obligatorios.");
        }

        Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada"));

        datosClinicos.setCita(cita);
        return consultaRepository.save(datosClinicos);
    }

    // --- 3. EL JALE DE INSUMOS Y TERCEROS ---
    @Transactional
    public ConsultaInsumo registrarInsumo(String consultaId, ConsultaInsumo insumo) {
        ConsultaClinica consulta = consultaRepository.findById(consultaId)
                .orElseThrow(() -> new IllegalArgumentException("Consulta no encontrada"));
        
        insumo.setConsultaClinica(consulta);
        // Aquí en el futuro inyectaremos ProductoService para descontar stock del Kardex
        return insumoRepository.save(insumo);
    }

    // --- 4. CIERRE DE CITA ---
    @Transactional
    public Cita finalizarCita(String citaId) {
        Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada"));
        
        // Verifica si el médico llenó la consulta antes de dejarlo finalizar
        consultaRepository.findByCitaId(citaId)
                .orElseThrow(() -> new IllegalStateException("No se puede finalizar la cita sin registrar la anamnesis y diagnóstico."));

        cita.setEstado("FINALIZADA");
        return citaRepository.save(cita);
    }
}