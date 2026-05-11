package com.hatunvet.sistema.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class FacturacionService {

    private final String API_URL = "https://miapi.cloud/apifact/invoice/create";
    private final String CLAVE_SECRETA = "miap-7ci-u47-raa";

    public Map<String, Object> enviarAMiapicloud(Map<String, Object> payload) {
        // Mantenemos la clave en el cuerpo por si acaso
        payload.put("claveSecreta", CLAVE_SECRETA);

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // ¡LA SOLUCIÓN! Enviamos tu clave como un Token de Autorización Bearer
        headers.set("Authorization", "Bearer " + CLAVE_SECRETA);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            // Intentamos enviar la factura
            ResponseEntity<Map> response = restTemplate.postForEntity(API_URL, request, Map.class);
            return response.getBody();

        } catch (HttpClientErrorException e) {
            // Si Miapicloud o la SUNAT rechazan la factura (ej. 401, 400),
            // atrapamos el mensaje real y te lo mostramos en pantalla.
            throw new RuntimeException("Miapicloud responde: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            throw new RuntimeException("Fallo en la red: " + e.getMessage());
        }
    }
}