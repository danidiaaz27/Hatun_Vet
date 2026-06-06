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

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    // --- CORREGIDO (Opción A): Se eliminó precision y scale para evitar el error en tipos floating point ---
    @Column(nullable = false) 
    private double stock;

    // --- NUEVOS CAMPOS CLINICOS ---
    
    @Column(name = "contenido_unidad", precision = 10, scale = 3)
    private BigDecimal contenidoUnidad; // Ej: 100.000 (para un frasco de 100ml)

    @Column(name = "unidad_medida", length = 30)
    private String unidadMedida; // Ej: "ml", "g", "tabletas"

    @Column(name = "sub_stock", precision = 10, scale = 3)
    private BigDecimal subStock; // Ej: Stock interno detallado por fracciones residuales

    // -------------------------------

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

    public double getStock() { return stock; }
    public void setStock(double stock) { this.stock = stock; }

    // --- GETTERS Y SETTERS DE LOS CAMPOS CLÍNICOS ---
    
    public BigDecimal getContenidoUnidad() { return contenidoUnidad; }
    public void setContenidoUnidad(BigDecimal contenidoUnidad) { this.contenidoUnidad = contenidoUnidad; }

    public String getUnidadMedida() { return unidadMedida; }
    public void setUnidadMedida(String unidadMedida) { this.unidadMedida = unidadMedida; }

    public BigDecimal getSubStock() { return subStock; }
    public void setSubStock(BigDecimal subStock) { this.subStock = subStock; }

    // -----------------------------------------------

    public String getImagen() { return imagen; }
    public void setImagen(String imagen) { this.imagen = imagen; }

    public CategoriaProducto getCategoria() { return categoria; }
    public void setCategoria(CategoriaProducto categoria) { this.categoria = categoria; }

    public Proveedor getProveedor() { return proveedor; }
    public void setProveedor(Proveedor proveedor) { this.proveedor = proveedor; }

    public boolean isEstado() { return estado; }
    public void setEstado(boolean estado) { this.estado = estado; }
}