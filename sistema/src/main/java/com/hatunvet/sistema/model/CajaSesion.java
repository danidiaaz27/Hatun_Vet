package com.hatunvet.sistema.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "caja_sesiones")
public class CajaSesion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false, length = 36)
    private String id;

    @Column(name = "fecha_apertura", nullable = false)
    private LocalDateTime fechaApertura;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @Column(name = "monto_apertura", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoApertura; // Es modificable al abrir

    @Column(name = "monto_cierre_real", precision = 10, scale = 2)
    private BigDecimal montoCierreReal; // Lo que la recepcionista cuenta físicamente

    @Column(name = "monto_cierre_esperado", precision = 10, scale = 2)
    private BigDecimal montoCierreEsperado; // Cálculo automático del sistema

    @Column(nullable = false, length = 15)
    private String estado; // "ABIERTA", "CERRADA"

    @Column(length = 50)
    private String usuarioApertura;

    @Column(length = 50)
    private String usuarioCierre;

    public CajaSesion() {}

    // --- GETTERS Y SETTERS ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public LocalDateTime getFechaApertura() { return fechaApertura; }
    public void setFechaApertura(LocalDateTime fechaApertura) { this.fechaApertura = fechaApertura; }
    public LocalDateTime getFechaCierre() { return fechaCierre; }
    public void setFechaCierre(LocalDateTime fechaCierre) { this.fechaCierre = fechaCierre; }
    public BigDecimal getMontoApertura() { return montoApertura; }
    public void setMontoApertura(BigDecimal montoApertura) { this.montoApertura = montoApertura; }
    public BigDecimal getMontoCierreReal() { return montoCierreReal; }
    public void setMontoCierreReal(BigDecimal montoCierreReal) { this.montoCierreReal = montoCierreReal; }
    public BigDecimal getMontoCierreEsperado() { return montoCierreEsperado; }
    public void setMontoCierreEsperado(BigDecimal montoCierreEsperado) { this.montoCierreEsperado = montoCierreEsperado; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getUsuarioApertura() { return usuarioApertura; }
    public void setUsuarioApertura(String usuarioApertura) { this.usuarioApertura = usuarioApertura; }
    public String getUsuarioCierre() { return usuarioCierre; }
    public void setUsuarioCierre(String usuarioCierre) { this.usuarioCierre = usuarioCierre; }
}