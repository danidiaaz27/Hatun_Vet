package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.BanoCorte;
import com.hatunvet.sistema.model.Cliente;
import com.hatunvet.sistema.model.Mascota;
import com.hatunvet.sistema.model.Producto;
import com.hatunvet.sistema.repository.BanoCorteRepository;
import com.hatunvet.sistema.repository.MascotaRepository;
import com.hatunvet.sistema.repository.ProductoRepository;
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
    private final ProductoRepository productoRepository;

    public BanoCorteController(BanoCorteRepository banoCorteRepository, MascotaRepository mascotaRepository, ProductoRepository productoRepository) {
        this.banoCorteRepository = banoCorteRepository;
        this.mascotaRepository = mascotaRepository;
        this.productoRepository = productoRepository;
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

            String productoId = registro.getProductoId();
            if (productoId == null || productoId.isEmpty()) {
                res.put("success", false);
                res.put("message", "Debe seleccionar un servicio del catálogo.");
                return res;
            }

            Producto producto = productoRepository.findById(productoId)
                    .orElse(null);
            if (producto == null) {
                res.put("success", false);
                res.put("message", "El servicio seleccionado no existe.");
                return res;
            }

            vincularDatosDesdeMascota(registro, mascota);
            
            registro.setProducto(producto);
            registro.setTipoServicio(producto.getNombre());

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

        if (!nuevoEstado.equals("EN_PROCESO") && !nuevoEstado.equals("TERMINADO") && !nuevoEstado.equals("PAGO_PARCIAL") && !nuevoEstado.equals("PAGADO")) {
            res.put("success", false);
            res.put("message", "Estado no permitido por el sistema.");
            return res;
        }

        banoCorteRepository.findById(id).ifPresentOrElse(r -> {
            String estadoFinal = nuevoEstado;
            if ("TERMINADO".equals(nuevoEstado) && r.getTotalCobrado() != null && r.getTotalCobrado().compareTo(r.getPrecio()) >= 0) {
                estadoFinal = "PAGADO";
            }
            r.setEstado(estadoFinal);
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

    @GetMapping("/api/por-cobrar")
    @ResponseBody
    public List<Map<String, Object>> porCobrar() {
        List<BanoCorte> terminados = banoCorteRepository.findAll().stream()
                .filter(b -> "TERMINADO".equalsIgnoreCase(b.getEstado()) || 
                             "PENDIENTE".equalsIgnoreCase(b.getEstado()) || 
                             "PAGO_PARCIAL".equalsIgnoreCase(b.getEstado()))
                .filter(b -> {
                    BigDecimal totalCobrado = b.getTotalCobrado() != null ? b.getTotalCobrado() : BigDecimal.ZERO;
                    BigDecimal precio = b.getPrecio() != null ? b.getPrecio() : BigDecimal.ZERO;
                    return precio.subtract(totalCobrado).compareTo(BigDecimal.ZERO) > 0;
                })
                .toList();

        return terminados.stream().map(b -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", b.getId());
            map.put("mascota", b.getNombreMascota());
            map.put("clienteDocumento", b.getDniDueno());
            map.put("clienteNombre", b.getNombreDueno());
            map.put("tipoServicio", b.getTipoServicio());
            
            // Retornamos el saldo pendiente como el precio a cobrar en POS
            BigDecimal totalCobrado = b.getTotalCobrado() != null ? b.getTotalCobrado() : BigDecimal.ZERO;
            BigDecimal precio = b.getPrecio() != null ? b.getPrecio() : BigDecimal.ZERO;
            BigDecimal saldo = precio.subtract(totalCobrado);
            map.put("precio", saldo);
            map.put("precioTotalOriginal", precio);
            map.put("totalCobrado", totalCobrado);
            
            if (b.getProducto() != null) {
                map.put("productoId", b.getProducto().getId());
                map.put("productoCodigo", b.getProducto().getCodigo());
            } else {
                map.put("productoId", null);
                map.put("productoCodigo", "GR-001");
            }
            return map;
        }).toList();
    }
}
