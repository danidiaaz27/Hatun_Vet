package com.hatunvet.sistema.model;

import jakarta.persistence.*;

@Entity
@Table(name = "configuracion")
public class Configuracion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false, length = 36)
    private String id;

    @Column(name = "nombre_veterinaria", length = 150)
    private String nombreVeterinaria;

    @Column(length = 255)
    private String logo;

    @Column(length = 30)
    private String telefono;

    @Column(length = 255)
    private String direccion;

    @Column(length = 150)
    private String correo;

    @Column(length = 255)
    private String facebook;

    @Column(length = 255)
    private String instagram;

    @Column(length = 80)
    private String whatsapp;

    @Column(name = "texto_hero", columnDefinition = "TEXT")
    private String textoHero;

    @Column(name = "subtitulo_hero", columnDefinition = "TEXT")
    private String subtituloHero;

    @Column(columnDefinition = "TEXT")
    private String mision;

    @Column(columnDefinition = "TEXT")
    private String vision;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getNombreVeterinaria() { return nombreVeterinaria; }
    public void setNombreVeterinaria(String nombreVeterinaria) { this.nombreVeterinaria = nombreVeterinaria; }
    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public String getFacebook() { return facebook; }
    public void setFacebook(String facebook) { this.facebook = facebook; }
    public String getInstagram() { return instagram; }
    public void setInstagram(String instagram) { this.instagram = instagram; }
    public String getWhatsapp() { return whatsapp; }
    public void setWhatsapp(String whatsapp) { this.whatsapp = whatsapp; }
    public String getTextoHero() { return textoHero; }
    public void setTextoHero(String textoHero) { this.textoHero = textoHero; }
    public String getSubtituloHero() { return subtituloHero; }
    public void setSubtituloHero(String subtituloHero) { this.subtituloHero = subtituloHero; }
    public String getMision() { return mision; }
    public void setMision(String mision) { this.mision = mision; }
    public String getVision() { return vision; }
    public void setVision(String vision) { this.vision = vision; }
}