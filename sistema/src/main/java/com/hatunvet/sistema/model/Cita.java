package com.hatunvet.sistema.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "citas")
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false, length = 36)
    private String id;

    // Conexión con el paciente (Mascota)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mascota_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Mascota mascota;

    // Conexión con el doctor asignado
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veterinario_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Usuario veterinario;

    @Column(name = "fecha_hora_programada", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaHoraProgramada; // La hora atípica (ej. 10:05)

    @Column(name = "fecha_hora_llegada")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaHoraLlegada; // Cuando el counter hace check-in

    @Column(nullable = false, length = 20)
    private String estado = "AGENDADA"; // AGENDADA, EN_ESPERA, EN_ATENCION, FINALIZADA

    @Column(name = "motivo_principal", nullable = false, length = 255)
    private String motivoPrincipal;

    @Column(name = "costo_base_informado")
    private boolean costoBaseInformado = false; // El check de que el Counter avisó el precio

    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    @PrePersist
    protected void onCreate() {
        this.creadoEn = LocalDateTime.now();
    }

    public Cita() {}

    // --- GETTERS Y SETTERS ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Mascota getMascota() { return mascota; }
    public void setMascota(Mascota mascota) { this.mascota = mascota; }
    public Usuario getVeterinario() { return veterinario; }
    public void setVeterinario(Usuario veterinario) { this.veterinario = veterinario; }
    public LocalDateTime getFechaHoraProgramada() { return fechaHoraProgramada; }
    public void setFechaHoraProgramada(LocalDateTime fechaHoraProgramada) { this.fechaHoraProgramada = fechaHoraProgramada; }
    public LocalDateTime getFechaHoraLlegada() { return fechaHoraLlegada; }
    public void setFechaHoraLlegada(LocalDateTime fechaHoraLlegada) { this.fechaHoraLlegada = fechaHoraLlegada; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getMotivoPrincipal() { return motivoPrincipal; }
    public void setMotivoPrincipal(String motivoPrincipal) { this.motivoPrincipal = motivoPrincipal; }
    public boolean isCostoBaseInformado() { return costoBaseInformado; }
    public void setCostoBaseInformado(boolean costoBaseInformado) { this.costoBaseInformado = costoBaseInformado; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }
}