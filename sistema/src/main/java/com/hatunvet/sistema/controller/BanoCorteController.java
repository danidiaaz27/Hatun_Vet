package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.BanoCorte;
import com.hatunvet.sistema.repository.BanoCorteRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List; // <-- Esta es la importación que seguramente faltaba
import java.util.Map;

@Controller
@RequestMapping("/banos-cortes")
public class BanoCorteController {

    private final BanoCorteRepository banoCorteRepository;

    public BanoCorteController(BanoCorteRepository banoCorteRepository) {
        this.banoCorteRepository = banoCorteRepository;
    }

    // 1. Cargar la página principal (HTML)
    @GetMapping
    public String index() {
        return "banos-cortes";
    }

    // 2. Listar todos los servicios (API para la tabla)
    @GetMapping("/api/listar")
    @ResponseBody
    public Map<String, Object> listar() {
        Map<String, Object> res = new HashMap<>();
        res.put("data", banoCorteRepository.findAllByOrderByFechaServicioDesc());
        return res;
    }

    // 3. Guardar un nuevo registro en la base de datos
    @PostMapping("/api/guardar")
    @ResponseBody
    public Map<String, Object> guardar(@RequestBody BanoCorte registro) {
        Map<String, Object> res = new HashMap<>();
        try {
            banoCorteRepository.save(registro);
            res.put("success", true);
            res.put("message", "Servicio registrado correctamente");
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "Error: " + e.getMessage());
        }
        return res;
    }

    // 4. Cambiar el estado del servicio (PENDIENTE -> TERMINADO -> PAGADO)
    @PostMapping("/api/cambiar-estado/{id}")
    @ResponseBody
    public Map<String, Object> cambiarEstado(@PathVariable Long id, @RequestParam String nuevoEstado) {
        Map<String, Object> res = new HashMap<>();
        banoCorteRepository.findById(id).ifPresent(r -> {
            r.setEstado(nuevoEstado);
            banoCorteRepository.save(r);
        });
        res.put("success", true);
        return res;
    }

    // 5. Obtener los tipos de servicio dinámicos (El nuevo endpoint)
    @GetMapping("/api/tipos-servicio")
    @ResponseBody
    public List<String> listarTipos() {
        return banoCorteRepository.findTiposUnicos();
    }
}