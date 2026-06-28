package com.hatunvet.sistema.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "consultas_clinicas")
public class ConsultaClinica {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false, length = 36)
    private String id;

    // Relación estricta 1 a 1: Una cita genera exactamente una consulta clínica
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cita_id", nullable = false, unique = true)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Cita cita;

    // Anamnesis Obligatoria
    @Column(name = "peso_kg", nullable = false, precision = 5, scale = 2)
    private BigDecimal pesoKg;

    @Column(name = "temperatura_c", nullable = false, precision = 4, scale = 2)
    private BigDecimal temperaturaC;

    @Column(name = "frecuencia_cardiaca")
    private Integer frecuenciaCardiaca;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String sintomas;

    @Column(name = "diagnostico_presuntivo", columnDefinition = "TEXT", nullable = false)
    private String diagnosticoPresuntivo;

    @Column(name = "tratamiento_indicado", columnDefinition = "TEXT", nullable = false)
    private String tratamientoIndicado;

    @Column(name = "fecha_atencion", updatable = false)
    private LocalDateTime fechaAtencion;

    @Column(name = "fecha_proxima_cita")
    private java.time.LocalDate fechaProximaCita;

    @Column(name = "nombre_proxima_vacuna", length = 100)
    private String nombreProximaVacuna;

    @Column(name = "fecha_proxima_vacuna")
    private java.time.LocalDate fechaProximaVacuna;

    @Column(name = "nombre_proximo_desparasitante", length = 100)
    private String nombreProximoDesparasitante;

    @Column(name = "fecha_proxima_desparasitacion")
    private java.time.LocalDate fechaProximaDesparasitacion;

    @PrePersist
    protected void onCreate() {
        this.fechaAtencion = LocalDateTime.now();
    }

    public ConsultaClinica() {}

    // --- GETTERS Y SETTERS ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Cita getCita() { return cita; }
    public void setCita(Cita cita) { this.cita = cita; }
    public BigDecimal getPesoKg() { return pesoKg; }
    public void setPesoKg(BigDecimal pesoKg) { this.pesoKg = pesoKg; }
    public BigDecimal getTemperaturaC() { return temperaturaC; }
    public void setTemperaturaC(BigDecimal temperaturaC) { this.temperaturaC = temperaturaC; }
    public Integer getFrecuenciaCardiaca() { return frecuenciaCardiaca; }
    public void setFrecuenciaCardiaca(Integer frecuenciaCardiaca) { this.frecuenciaCardiaca = frecuenciaCardiaca; }
    public String getSintomas() { return sintomas; }
    public void setSintomas(String sintomas) { this.sintomas = sintomas; }
    public String getDiagnosticoPresuntivo() { return diagnosticoPresuntivo; }
    public void setDiagnosticoPresuntivo(String diagnosticoPresuntivo) { this.diagnosticoPresuntivo = diagnosticoPresuntivo; }
    public String getTratamientoIndicado() { return tratamientoIndicado; }
    public void setTratamientoIndicado(String tratamientoIndicado) { this.tratamientoIndicado = tratamientoIndicado; }
    public LocalDateTime getFechaAtencion() { return fechaAtencion; }
    public void setFechaAtencion(LocalDateTime fechaAtencion) { this.fechaAtencion = fechaAtencion; }

    public java.time.LocalDate getFechaProximaCita() { return fechaProximaCita; }
    public void setFechaProximaCita(java.time.LocalDate fechaProximaCita) { this.fechaProximaCita = fechaProximaCita; }
    public String getNombreProximaVacuna() { return nombreProximaVacuna; }
    public void setNombreProximaVacuna(String nombreProximaVacuna) { this.nombreProximaVacuna = nombreProximaVacuna; }
    public java.time.LocalDate getFechaProximaVacuna() { return fechaProximaVacuna; }
    public void setFechaProximaVacuna(java.time.LocalDate fechaProximaVacuna) { this.fechaProximaVacuna = fechaProximaVacuna; }

    public String getNombreProximoDesparasitante() { return nombreProximoDesparasitante; }
    public void setNombreProximoDesparasitante(String nombreProximoDesparasitante) { this.nombreProximoDesparasitante = nombreProximoDesparasitante; }
    public java.time.LocalDate getFechaProximaDesparasitacion() { return fechaProximaDesparasitacion; }
    public void setFechaProximaDesparasitacion(java.time.LocalDate fechaProximaDesparasitacion) { this.fechaProximaDesparasitacion = fechaProximaDesparasitacion; }
}