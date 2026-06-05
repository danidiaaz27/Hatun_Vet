package com.hatunvet.sistema.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "servicios_terceros")
public class ServicioTercero {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Conexión con el Historial Médico (Consulta)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consulta_id", nullable = false)
    private ConsultaClinica consultaClinica;

    // Conexión con tu tabla actual de Proveedores (Laboratorios externos)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proveedor_id", nullable = false)
    private Proveedor proveedor;

    @Column(name = "tipo_examen", nullable = false, length = 150)
    private String tipoExamen;

    // --- Variables para la Matriz de Utilidad Oculta ---
    @Column(name = "costo_laboratorio", nullable = false, precision = 10, scale = 2)
    private BigDecimal costoLaboratorio; // Pago que HatunVet le debe al laboratorio

    @Column(name = "precio_cliente", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioCliente; // Cobro que se le hace al tutor de la mascota

    // Control de flujos operativos
    @Column(name = "estado_examen", length = 20)
    private String estadoExamen = "PENDIENTE"; // PENDIENTE, RESULTADO_LISTO

    @Column(name = "estado_pago_prov", length = 20)
    private String estadoPagoProv = "POR_PAGAR"; // POR_PAGAR, PAGADO

    public ServicioTercero() {}

    // --- GETTERS Y SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ConsultaClinica getConsultaClinica() { return consultaClinica; }
    public void setConsultaClinica(ConsultaClinica consultaClinica) { this.consultaClinica = consultaClinica; }
    public Proveedor getProveedor() { return proveedor; }
    public void setProveedor(Proveedor proveedor) { this.proveedor = proveedor; }
    public String getTipoExamen() { return tipoExamen; }
    public void setTipoExamen(String tipoExamen) { this.tipoExamen = tipoExamen; }
    public BigDecimal getCostoLaboratorio() { return costoLaboratorio; }
    public void setCostoLaboratorio(BigDecimal costoLaboratorio) { this.costoLaboratorio = costoLaboratorio; }
    public BigDecimal getPrecioCliente() { return precioCliente; }
    public void setPrecioCliente(BigDecimal precioCliente) { this.precioCliente = precioCliente; }
    public String getEstadoExamen() { return estadoExamen; }
    public void setEstadoExamen(String estadoExamen) { this.estadoExamen = estadoExamen; }
    public String getEstadoPagoProv() { return estadoPagoProv; }
    public void setEstadoPagoProv(String estadoPagoProv) { this.estadoPagoProv = estadoPagoProv; }
}