package com.hatunvet.sistema.model;

import jakarta.persistence.*;
import java.time.LocalTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "horarios_veterinario")
public class HorarioVeterinario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veterinario_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Usuario veterinario;

    @Column(name = "dia_semana", nullable = false)
    private Integer diaSemana; // 1 = Lunes, 7 = Domingo

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    public HorarioVeterinario() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Usuario getVeterinario() { return veterinario; }
    public void setVeterinario(Usuario veterinario) { this.veterinario = veterinario; }
    public Integer getDiaSemana() { return diaSemana; }
    public void setDiaSemana(Integer diaSemana) { this.diaSemana = diaSemana; }
    public LocalTime getHoraInicio() { return horaInicio; }
    public void setHoraInicio(LocalTime horaInicio) { this.horaInicio = horaInicio; }
    public LocalTime getHoraFin() { return horaFin; }
    public void setHoraFin(LocalTime horaFin) { this.horaFin = horaFin; }
}
