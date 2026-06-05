package com.hatunvet.sistema.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "banos_cortes")
public class BanoCorte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha_servicio", updatable = false)
    private LocalDateTime fechaServicio;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mascota_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Mascota mascota;

    /** Campo de entrada JSON; el controlador resuelve la entidad Mascota. */
    @Transient
    @JsonProperty("mascotaId")
    private Long mascotaId;

    @Column(name = "nombre_mascota", nullable = false)
    private String nombreMascota;

    @Column(name = "dni_dueno", length = 8)
    private String dniDueno;

    @Column(name = "nombre_dueno", nullable = false)
    private String nombreDueno;

    private String especie;

    @Column(name = "tipo_servicio")
    private String tipoServicio;

    @Column(name = "detalles_extra")
    private String detallesExtra;

    // ESTÁNDAR FINANCIERO RESTAURADO
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    private String estado;

    @PrePersist
    protected void onCreate() {
        this.fechaServicio = LocalDateTime.now();
        // El estado se fuerza a PENDIENTE en el controlador por seguridad, pero dejamos el fallback aquí.
        if (this.estado == null) this.estado = "PENDIENTE";
    }

    // --- GETTERS Y SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getFechaServicio() { return fechaServicio; }
    public void setFechaServicio(LocalDateTime fechaServicio) { this.fechaServicio = fechaServicio; }

    public Mascota getMascota() { return mascota; }
    public void setMascota(Mascota mascota) { this.mascota = mascota; }

    public Long getMascotaId() {
        if (mascota != null && mascota.getId() != null) {
            return mascota.getId();
        }
        return mascotaId;
    }

    public void setMascotaId(Long mascotaId) { this.mascotaId = mascotaId; }

    public String getNombreMascota() { return nombreMascota; }
    public void setNombreMascota(String nombreMascota) { this.nombreMascota = nombreMascota; }

    public String getDniDueno() { return dniDueno; }
    public void setDniDueno(String dniDueno) { this.dniDueno = dniDueno; }

    public String getNombreDueno() { return nombreDueno; }
    public void setNombreDueno(String nombreDueno) { this.nombreDueno = nombreDueno; }

    public String getEspecie() { return especie; }
    public void setEspecie(String especie) { this.especie = especie; }

    public String getTipoServicio() { return tipoServicio; }
    public void setTipoServicio(String tipoServicio) { this.tipoServicio = tipoServicio; }

    public String getDetallesExtra() { return detallesExtra; }
    public void setDetallesExtra(String detallesExtra) { this.detallesExtra = detallesExtra; }

    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}