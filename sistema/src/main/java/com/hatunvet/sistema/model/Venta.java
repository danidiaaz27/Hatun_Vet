package com.hatunvet.sistema.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ventas")
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false, length = 36)
    private String id;

    @Column(name = "tipo_comprobante", nullable = false, length = 2)
    private String tipoComprobante;

    @Column(nullable = false, length = 4)
    private String serie;

    @Column(nullable = false)
    private int correlativo;

    @Column(name = "cliente_documento", nullable = false, length = 15)
    private String clienteDocumento;

    @Column(name = "cliente_nombre", nullable = false, length = 150)
    private String clienteNombre;

    @Column(name = "cliente_direccion", length = 255)
    private String clienteDireccion;

    @Column(name = "fecha_emision", updatable = false)
    private LocalDateTime fechaEmision;

    @Column(name = "op_gravadas", nullable = false, precision = 10, scale = 2)
    private BigDecimal opGravadas;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal igv;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(length = 20)
    private String estado;

    @Column(name = "medio_pago", length = 30)
    private String medioPago;

    // CORREGIDO: Se cambió VentaDetail por VentaDetalle
    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<VentaDetalle> detalles = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.fechaEmision = LocalDateTime.now();
    }

    public Venta() {}

    // --- GETTER Y SETTER DE MEDIO DE PAGO ---
    public String getMedioPago() {
        return medioPago;
    }

    public void setMedioPago(String medioPago) {
        this.medioPago = medioPago;
    }

    // --- GETTERS Y SETTERS ORIGINALES ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTipoComprobante() { return tipoComprobante; }
    public void setTipoComprobante(String tipoComprobante) { this.tipoComprobante = tipoComprobante; }
    public String getSerie() { return serie; }
    public void setSerie(String serie) { this.serie = serie; }
    public int getCorrelativo() { return correlativo; }
    public void setCorrelativo(int correlativo) { this.correlativo = correlativo; }
    public String getClienteDocumento() { return clienteDocumento; }
    public void setClienteDocumento(String clienteDocumento) { this.clienteDocumento = clienteDocumento; }
    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }
    public String getClienteDireccion() { return clienteDireccion; }
    public void setClienteDireccion(String clienteDireccion) { this.clienteDireccion = clienteDireccion; }
    public LocalDateTime getFechaEmision() { return fechaEmision; }
    public void setFechaEmision(LocalDateTime fechaEmision) { this.fechaEmision = fechaEmision; }
    public BigDecimal getOpGravadas() { return opGravadas; }
    public void setOpGravadas(BigDecimal opGravadas) { this.opGravadas = opGravadas; }
    public BigDecimal getIgv() { return igv; }
    public void setIgv(BigDecimal igv) { this.igv = igv; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    // --- GETTER Y SETTER DE LA LISTA DE DETALLES ---
    public List<VentaDetalle> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<VentaDetalle> detalles) {
        this.detalles = detalles;
    }

    // --- MÉTODO OPERATIVO COMPLETO ---
    public void addDetalle(VentaDetalle detalle) {
        detalles.add(detalle);
        detalle.setVenta(this);
    }
}