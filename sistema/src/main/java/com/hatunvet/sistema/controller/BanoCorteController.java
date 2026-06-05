package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.BanoCorte;
import com.hatunvet.sistema.model.Cliente;
import com.hatunvet.sistema.model.Mascota;
import com.hatunvet.sistema.repository.BanoCorteRepository;
import com.hatunvet.sistema.repository.MascotaRepository;
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
    private final MascotaRepository mascotaRepository;

    public BanoCorteController(BanoCorteRepository banoCorteRepository, MascotaRepository mascotaRepository) {
        this.banoCorteRepository = banoCorteRepository;
        this.mascotaRepository = mascotaRepository;
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

            Long mascotaId = registro.getMascotaId();
            if (mascotaId == null) {
                res.put("success", false);
                res.put("message", "Debe seleccionar una mascota registrada.");
                return res;
            }

            Mascota mascota = mascotaRepository.findById(mascotaId)
                    .orElse(null);
            if (mascota == null) {
                res.put("success", false);
                res.put("message", "La mascota seleccionada no existe.");
                return res;
            }

            if (mascota.getEstado() != null && !"ACTIVA".equalsIgnoreCase(mascota.getEstado().trim())) {
                res.put("success", false);
                res.put("message", "La mascota no está activa en el padrón.");
                return res;
            }

            vincularDatosDesdeMascota(registro, mascota);

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

    private void vincularDatosDesdeMascota(BanoCorte registro, Mascota mascota) {
        registro.setMascota(mascota);
        registro.setNombreMascota(mascota.getNombre());
        registro.setEspecie(mascota.getEspecie() != null ? mascota.getEspecie() : "Sin especie");

        Cliente cliente = mascota.getCliente();
        if (cliente != null) {
            registro.setNombreDueno(cliente.getNombreCompleto() != null ? cliente.getNombreCompleto() : "Sin dueño");
            registro.setDniDueno(cliente.getNumeroDocumento());
        } else {
            registro.setNombreDueno("Sin dueño vinculado");
            registro.setDniDueno(null);
        }
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

        banoCorteRepository.findById(id).ifPresentOrElse(r -> {
            r.setEstado(nuevoEstado);
            banoCorteRepository.save(r);
            res.put("success", true);
        }, () -> {
            res.put("success", false);
            res.put("message", "Servicio no encontrado.");
        });

        return res;
    }

    @GetMapping("/api/tipos-servicio")
    @ResponseBody
    public List<String> listarTipos() {
        return banoCorteRepository.findTiposUnicos();
    }
}
