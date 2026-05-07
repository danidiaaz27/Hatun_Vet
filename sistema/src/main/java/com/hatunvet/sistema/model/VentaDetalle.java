package com.hatunvet.sistema.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "venta_detalles")
public class VentaDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false, length = 36)
    private String id;

    // JsonIgnore evita errores circulares al convertir a JSON en las APIs
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_venta", nullable = false)
    @JsonIgnore
    private Venta venta;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(nullable = false)
    private int cantidad;

    @Column(name = "precio_unitario", nullable = false)
    private double precioUnitario; // Precio con IGV (Lo que ve el cliente)

    @Column(name = "valor_unitario", nullable = false)
    private double valorUnitario; // Precio sin IGV (Base para la SUNAT)

    @Column(nullable = false)
    private double igv;

    @Column(name = "importe_total", nullable = false)
    private double importeTotal; // cantidad * precioUnitario

    public VentaDetalle() {}

    // --- GETTERS Y SETTERS ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Venta getVenta() { return venta; }
    public void setVenta(Venta venta) { this.venta = venta; }

    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }

    public int getCantidad() { return cantidad; }
    public void setCantidad(int cantidad) { this.cantidad = cantidad; }

    public double getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(double precioUnitario) { this.precioUnitario = precioUnitario; }

    public double getValorUnitario() { return valorUnitario; }
    public void setValorUnitario(double valorUnitario) { this.valorUnitario = valorUnitario; }

    public double getIgv() { return igv; }
    public void setIgv(double igv) { this.igv = igv; }

    public double getImporteTotal() { return importeTotal; }
    public void setImporteTotal(double importeTotal) { this.importeTotal = importeTotal; }
}