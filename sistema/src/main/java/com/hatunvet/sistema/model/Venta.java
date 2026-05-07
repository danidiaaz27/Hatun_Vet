package com.hatunvet.sistema.model;

import jakarta.persistence.*;
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
    private String tipoComprobante; // '01' Factura, '03' Boleta

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

    @Column(name = "fecha_emision")
    private LocalDateTime fechaEmision = LocalDateTime.now();

    @Column(name = "op_gravadas", nullable = false)
    private double opGravadas;

    @Column(nullable = false)
    private double igv;

    @Column(nullable = false)
    private double total;

    @Column(length = 20)
    private String estado = "CREADO"; // CREADO, FACTURADO, ANULADO

    // Relación bidireccional para guardar todo el carrito de golpe
    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VentaDetalle> detalles = new ArrayList<>();

    public Venta() {}

    // --- GETTERS Y SETTERS ---
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

    public double getOpGravadas() { return opGravadas; }
    public void setOpGravadas(double opGravadas) { this.opGravadas = opGravadas; }

    public double getIgv() { return igv; }
    public void setIgv(double igv) { this.igv = igv; }

    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public List<VentaDetalle> getDetalles() { return detalles; }
    public void setDetalles(List<VentaDetalle> detalles) { this.detalles = detalles; }

    // Método de ayuda para sincronizar la relación bidireccional
    public void addDetalle(VentaDetalle detalle) {
        detalles.add(detalle);
        detalle.setVenta(this);
    }
}