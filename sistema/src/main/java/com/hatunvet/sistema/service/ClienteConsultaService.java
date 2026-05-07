package com.hatunvet.sistema.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class ClienteConsultaService {

    // Tu Token JWT de Miapicloud para Consultas
    private final String TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNTcsImV4cCI6MTc2MDM4MzM5MX0.lezap0_4CCz9OW8bkz06_iwwF1xts58v-DH2XpEsvEE";

    public Map<String, Object> consultarDocumento(String tipoDoc, String numero) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + TOKEN);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        // Si tipoDoc es 1 es DNI, si es 6 es RUC
        String url = tipoDoc.equals("1")
                ? "https://miapi.cloud/v1/dni/" + numero
                : "https://miapi.cloud/v1/ruc/" + numero;

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            return response.getBody();
        } catch (Exception e) {
            return Map.of("success", false, "message", "Error al consultar: " + e.getMessage());
        }
    }
}