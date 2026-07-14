package com.hatunvet.sistema.service;

import com.hatunvet.sistema.model.BanoCorte;
import com.hatunvet.sistema.model.Cliente;
import com.hatunvet.sistema.model.Mascota;
import com.hatunvet.sistema.model.Producto;
import com.hatunvet.sistema.repository.BanoCorteRepository;
import com.hatunvet.sistema.repository.MascotaRepository;
import com.hatunvet.sistema.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class BanoCorteService {

    private final BanoCorteRepository banoCorteRepository;
    private final MascotaRepository mascotaRepository;
    private final ProductoRepository productoRepository;

    // --- MAPA DE TRANSICIONES DE ESTADO VÁLIDAS ---
    // Clave: estado actual · Valor: conjunto de estados a los que puede saltar
    private static final Map<String, Set<String>> TRANSICIONES_VALIDAS = Map.of(
            "PENDIENTE",    Set.of("EN_PROCESO", "PAGO_PARCIAL", "PAGADO", "CANCELADO"),
            "EN_PROCESO",   Set.of("TERMINADO", "CANCELADO"),
            "TERMINADO",    Set.of("PAGO_PARCIAL", "PAGADO"),
            "PAGO_PARCIAL", Set.of("PAGADO"),
            "PAGADO",       Set.of(),
            "CANCELADO",    Set.of()
    );

    // Estados que se pueden asignar manualmente desde /cambiar-estado (cancelación tiene su propio endpoint)
    private static final List<String> ESTADOS_CAMBIABLES_MANUALMENTE =
            List.of("EN_PROCESO", "TERMINADO", "PAGO_PARCIAL", "PAGADO");

    public BanoCorteService(BanoCorteRepository banoCorteRepository,
                             MascotaRepository mascotaRepository,
                             ProductoRepository productoRepository) {
        this.banoCorteRepository = banoCorteRepository;
        this.mascotaRepository = mascotaRepository;
        this.productoRepository = productoRepository;
    }

    @Transactional
    public BanoCorte guardarServicio(BanoCorte registro) {
        if (registro.getPrecio() == null || registro.getPrecio().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El precio debe ser mayor a 0.");
        }

        Long mascotaId = registro.getMascotaId();
        if (mascotaId == null) {
            throw new IllegalArgumentException("Debe seleccionar una mascota registrada.");
        }

        Mascota mascota = mascotaRepository.findById(mascotaId)
                .orElseThrow(() -> new IllegalArgumentException("La mascota seleccionada no existe."));

        if (mascota.getEstado() != null && !"ACTIVA".equalsIgnoreCase(mascota.getEstado().trim())) {
            throw new IllegalArgumentException("La mascota no está activa en el padrón.");
        }

        String productoId = registro.getProductoId();
        if (productoId == null || productoId.isEmpty()) {
            throw new IllegalArgumentException("Debe seleccionar un servicio del catálogo.");
        }

        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new IllegalArgumentException("El servicio seleccionado no existe."));

        if (!producto.isEstado()) {
            throw new IllegalArgumentException("El servicio seleccionado está inactivo.");
        }

        vincularDatosDesdeMascota(registro, mascota);

        registro.setProducto(producto);
        registro.setTipoServicio(producto.getNombre());

        registro.setId(null);
        registro.setEstado("PENDIENTE");

        return banoCorteRepository.save(registro);
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

    @Transactional
    public BanoCorte cambiarEstado(Long id, String nuevoEstado) {
        if (!ESTADOS_CAMBIABLES_MANUALMENTE.contains(nuevoEstado)) {
            throw new IllegalArgumentException("Estado no permitido por el sistema.");
        }

        BanoCorte registro = banoCorteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Servicio no encontrado."));

        validarTransicion(registro.getEstado(), nuevoEstado);

        String estadoFinal = nuevoEstado;
        if ("TERMINADO".equals(nuevoEstado) && registro.getTotalCobrado() != null
                && registro.getTotalCobrado().compareTo(registro.getPrecio()) >= 0) {
            estadoFinal = "PAGADO";
        }

        registro.setEstado(estadoFinal);
        return banoCorteRepository.save(registro);
    }

    // --- NUEVO: CANCELAR SERVICIO ---
    @Transactional
    public BanoCorte cancelarServicio(Long id) {
        BanoCorte registro = banoCorteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Servicio no encontrado."));

        validarTransicion(registro.getEstado(), "CANCELADO");

        registro.setEstado("CANCELADO");
        return banoCorteRepository.save(registro);
    }

    private void validarTransicion(String estadoActual, String nuevoEstado) {
        Set<String> permitidos = TRANSICIONES_VALIDAS.getOrDefault(estadoActual, Set.of());
        if (!permitidos.contains(nuevoEstado)) {
            throw new IllegalStateException(
                    "No se puede pasar de '" + estadoActual + "' a '" + nuevoEstado + "'.");
        }
    }

    public List<BanoCorte> listarTodos() {
        return banoCorteRepository.findAllByOrderByFechaServicioDesc();
    }

    public List<String> listarTiposUnicos() {
        return banoCorteRepository.findTiposUnicos();
    }

    public List<Map<String, Object>> obtenerServiciosParaFacturacion() {
        List<BanoCorte> pendientesDeCobro = banoCorteRepository.findAll().stream()
                .filter(b -> "TERMINADO".equalsIgnoreCase(b.getEstado()) ||
                             "PENDIENTE".equalsIgnoreCase(b.getEstado()) ||
                             "PAGO_PARCIAL".equalsIgnoreCase(b.getEstado()))
                .filter(b -> {
                    BigDecimal totalCobrado = b.getTotalCobrado() != null ? b.getTotalCobrado() : BigDecimal.ZERO;
                    BigDecimal precio = b.getPrecio() != null ? b.getPrecio() : BigDecimal.ZERO;
                    return precio.subtract(totalCobrado).compareTo(BigDecimal.ZERO) > 0;
                })
                .toList();

        return pendientesDeCobro.stream().map(b -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", b.getId());
            map.put("mascota", b.getNombreMascota());
            map.put("clienteDocumento", b.getDniDueno());
            map.put("clienteNombre", b.getNombreDueno());
            map.put("tipoServicio", b.getTipoServicio());

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