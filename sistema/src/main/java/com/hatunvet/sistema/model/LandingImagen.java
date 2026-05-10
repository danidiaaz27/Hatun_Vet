package com.hatunvet.sistema.model;

import jakarta.persistence.*;

@Entity
@Table(name = "landing_imagenes")
public class LandingImagen {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false, length = 36)
    private String id;

    @Column(length = 255)
    private String imagen;

    @Column(length = 80)
    private String tipo;

    @Column(nullable = false)
    private boolean estado = true;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getImagen() { return imagen; }
    public void setImagen(String imagen) { this.imagen = imagen; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public boolean isEstado() { return estado; }
    public void setEstado(boolean estado) { this.estado = estado; }
}