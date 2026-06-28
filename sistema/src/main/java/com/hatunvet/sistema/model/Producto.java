package com.hatunvet.sistema.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false, length = 36)
    private String id;

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    // VALIDACIÓN 1: Actualizado a BigDecimal
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(nullable = false)
    private int stock;

    @Column(length = 255)
    private String imagen;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_categoria", nullable = false)
    private CategoriaProducto categoria;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "proveedor_id")
    private Proveedor proveedor;

    @Column(nullable = false)
    private boolean estado = true;

    @Column(name = "es_servicio", nullable = false)
    private boolean esServicio = false;


    @Column(nullable = false)
    private boolean fraccionable = false;

    @Column(name = "unidad_medida", length = 20)
    private String unidadMedida;

    @Column(name = "capacidad_total", precision = 10, scale = 2)
    private BigDecimal capacidadTotal;

    @Column(name = "stock_fraccionado", precision = 10, scale = 2, nullable = false)
    private BigDecimal stockFraccionado = BigDecimal.ZERO;

    @Column(name = "precio_fraccionado", precision = 10, scale = 2)
    private BigDecimal precioFraccionado;

    // --- GETTERS Y SETTERS ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }

    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }

    public String getImagen() { return imagen; }
    public void setImagen(String imagen) { this.imagen = imagen; }

    public CategoriaProducto getCategoria() { return categoria; }
    public void setCategoria(CategoriaProducto categoria) { this.categoria = categoria; }

    public Proveedor getProveedor() { return proveedor; }
    public void setProveedor(Proveedor proveedor) { this.proveedor = proveedor; }

    public boolean isEstado() { return estado; }
    public void setEstado(boolean estado) { this.estado = estado; }

    public boolean isEsServicio() { return esServicio; }
    public void setEsServicio(boolean esServicio) { this.esServicio = esServicio; }


    public boolean isFraccionable() { return fraccionable; }
    public void setFraccionable(boolean fraccionable) { this.fraccionable = fraccionable; }

    public String getUnidadMedida() { return unidadMedida; }
    public void setUnidadMedida(String unidadMedida) { this.unidadMedida = unidadMedida; }

    public BigDecimal getCapacidadTotal() { return capacidadTotal; }
    public void setCapacidadTotal(BigDecimal capacidadTotal) { this.capacidadTotal = capacidadTotal; }

    public BigDecimal getStockFraccionado() { return stockFraccionado; }
    public void setStockFraccionado(BigDecimal stockFraccionado) { this.stockFraccionado = stockFraccionado; }

    public BigDecimal getPrecioFraccionado() { return precioFraccionado; }
    public void setPrecioFraccionado(BigDecimal precioFraccionado) { this.precioFraccionado = precioFraccionado; }
}