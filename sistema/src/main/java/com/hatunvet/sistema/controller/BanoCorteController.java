package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.BanoCorte;
import com.hatunvet.sistema.repository.BanoCorteRepository;
import com.hatunvet.sistema.service.CajaService; // NUEVA CONEXIÓN
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/banos-cortes")
public class BanoCorteController {

    private final BanoCorteRepository banoCorteRepository;
    private final CajaService cajaService; // NUEVA CONEXIÓN

    public BanoCorteController(BanoCorteRepository banoCorteRepository, CajaService cajaService) {
        this.banoCorteRepository = banoCorteRepository;
        this.cajaService = cajaService;
    }

    @GetMapping
    public String index() {
        return "banos-cortes";
    }

    @GetMapping("/api/listar")
    @ResponseBody
    public Map<String, Object> listar() {
        Map<String, Object> res = new HashMap<>();
        res.put("data", banoCorteRepository.findAllByOrderByFechaServicioDesc());
        return res;
    }

    @PostMapping("/api/guardar")
    @ResponseBody
    public Map<String, Object> guardar(@RequestBody BanoCorte registro) {
        Map<String, Object> res = new HashMap<>();
        try {
            if (registro.getPrecio() == null || registro.getPrecio().compareTo(BigDecimal.ZERO) <= 0) {
                res.put("success", false);
                res.put("message", "El precio debe ser mayor a 0.");
                return res;
            }

            registro.setId(null);
            registro.setEstado("PENDIENTE");

            banoCorteRepository.save(registro);
            res.put("success", true);
            res.put("message", "Servicio registrado correctamente");
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "Error: Verifique que todos los campos requeridos estén llenos.");
        }
        return res;
    }

    @PostMapping("/api/cambiar-estado/{id}")
    @ResponseBody
    public Map<String, Object> cambiarEstado(@PathVariable Long id, @RequestParam String nuevoEstado) {
        Map<String, Object> res = new HashMap<>();

        if (!nuevoEstado.equals("TERMINADO") && !nuevoEstado.equals("PAGADO")) {
            res.put("success", false);
            res.put("message", "Estado no permitido por el sistema.");
            return res;
        }

        try {
            banoCorteRepository.findById(id).ifPresentOrElse(r -> {
                r.setEstado(nuevoEstado);
                banoCorteRepository.save(r);

                // CONEXIÓN AUTOMÁTICA A CAJA: Se ejecuta si el nuevo estado es "PAGADO"
                if ("PAGADO".equals(nuevoEstado)) {
                    cajaService.registrarIngresoAutomatizado(
                            r.getPrecio(),
                            "Servicio Grooming (" + r.getTipoServicio() + ") - Mascota: " + r.getNombreMascota(),
                            "EFECTIVO",
                            null,
                            r
                    );
                }

                res.put("success", true);
            }, () -> {
                res.put("success", false);
                res.put("message", "Servicio no encontrado.");
            });
        } catch (IllegalArgumentException e) {
            // Captura el error si el usuario intenta cobrar sin haber abierto la caja previamente
            res.put("success", false);
            res.put("message", e.getMessage());
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "Error interno del sistema al cambiar de estado.");
        }

        return res;
    }

    @GetMapping("/api/tipos-servicio")
    @ResponseBody
    public List<String> listarTipos() {
        return banoCorteRepository.findTiposUnicos();
    }
}