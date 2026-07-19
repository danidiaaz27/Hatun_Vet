package com.hatunvet.sistema.service;

import org.springframework.beans.factory.annotation.Value;
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

    @Value("${miapi.url}")
    private String apiUrl;

    @Value("${miapi.secret}")
    private String claveSecreta;

    public Map<String, Object> enviarAMiapicloud(Map<String, Object> payload) {
        // Mantenemos la clave en el cuerpo usando la variable inyectada
        payload.put("claveSecreta", claveSecreta);

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Enviamos tu clave de forma segura desde las propiedades configuradas
        headers.set("Authorization", "Bearer " + claveSecreta);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            // Intentamos enviar la factura apuntando a la URL inyectada
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, request, Map.class);
            return response.getBody();

        } catch (HttpClientErrorException e) {
            // Si Miapicloud o la SUNAT rechazan la factura (ej. 401, 400),
            // atrapamos el mensaje real y lo enviamos en la excepción.
            throw new RuntimeException("Miapicloud responde: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            throw new RuntimeException("Fallo en la red: " + e.getMessage());
        }
    }
}