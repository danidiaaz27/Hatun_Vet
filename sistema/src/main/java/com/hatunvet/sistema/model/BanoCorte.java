package com.hatunvet.sistema.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "banos_cortes")
public class BanoCorte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha_servicio", updatable = false)
    private LocalDateTime fechaServicio;

    @Column(name = "nombre_mascota")
    private String nombreMascota;

    @Column(name = "dni_dueno") // ¡El nuevo campo!
    private String dniDueno;

    @Column(name = "nombre_dueno")
    private String nombreDueno;

    private String especie;

    @Column(name = "tipo_servicio")
    private String tipoServicio;

    @Column(name = "detalles_extra")
    private String detallesExtra;

    private Double precio;

    private String estado;

    @PrePersist
    protected void onCreate() {
        this.fechaServicio = LocalDateTime.now();
        if (this.estado == null) this.estado = "PENDIENTE";
    }

    // --- GETTERS Y SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getFechaServicio() { return fechaServicio; }
    public void setFechaServicio(LocalDateTime fechaServicio) { this.fechaServicio = fechaServicio; }

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

    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}