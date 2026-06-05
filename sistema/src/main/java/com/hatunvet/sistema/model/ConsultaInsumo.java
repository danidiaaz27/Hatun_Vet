package com.hatunvet.sistema.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "consulta_insumos")
public class ConsultaInsumo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Conexión con el Historial Médico (Consulta)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consulta_id", nullable = false)
    private ConsultaClinica consultaClinica;

    // Conexión con tu tabla actual de Productos (Inventario)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(name = "cantidad_usada", nullable = false, precision = 8, scale = 2)
    private BigDecimal cantidadUsada;

    @Column(name = "unidad_medida", nullable = false, length = 20)
    private String unidadMedida; // Ej: "ml", "mg", "pastilla", "unidad"

    // --- Variables para la Matriz de Utilidad Oculta ---
    @Column(name = "costo_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal costoUnitario; // Lo que le costó a HatunVet

    @Column(name = "precio_cobrado", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioCobrado; // Lo que se le cobra al cliente en Caja

    public ConsultaInsumo() {}

    // --- GETTERS Y SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ConsultaClinica getConsultaClinica() { return consultaClinica; }
    public void setConsultaClinica(ConsultaClinica consultaClinica) { this.consultaClinica = consultaClinica; }
    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }
    public BigDecimal getCantidadUsada() { return cantidadUsada; }
    public void setCantidadUsada(BigDecimal cantidadUsada) { this.cantidadUsada = cantidadUsada; }
    public String getUnidadMedida() { return unidadMedida; }
    public void setUnidadMedida(String unidadMedida) { this.unidadMedida = unidadMedida; }
    public BigDecimal getCostoUnitario() { return costoUnitario; }
    public void setCostoUnitario(BigDecimal costoUnitario) { this.costoUnitario = costoUnitario; }
    public BigDecimal getPrecioCobrado() { return precioCobrado; }
    public void setPrecioCobrado(BigDecimal precioCobrado) { this.precioCobrado = precioCobrado; }
}