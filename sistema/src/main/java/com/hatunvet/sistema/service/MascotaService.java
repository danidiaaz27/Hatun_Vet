package com.hatunvet.sistema.service;

import com.hatunvet.sistema.model.Cliente;
import com.hatunvet.sistema.model.Mascota;
import com.hatunvet.sistema.repository.ClienteRepository;
import com.hatunvet.sistema.repository.MascotaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MascotaService {

    private final MascotaRepository mascotaRepository;
    private final ClienteRepository clienteRepository;

    public MascotaService(MascotaRepository mascotaRepository, ClienteRepository clienteRepository) {
        this.mascotaRepository = mascotaRepository;
        this.clienteRepository = clienteRepository;
    }

    @Transactional(readOnly = true)
    public List<Mascota> listarTodas() {
        return mascotaRepository.findAllByOrderByNombreAsc();
    }

    @Transactional(readOnly = true)
    public Optional<Mascota> obtenerPorId(Long id) {
        return mascotaRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Mascota> obtenerMascotasPorCliente(Integer clienteId) {
        return mascotaRepository.findByClienteId(clienteId);
    }

    @Transactional(readOnly = true)
    public List<Mascota> buscarPorIdONombre(String valor) {
        String texto = trimToEmpty(valor);
        if (texto.isEmpty()) {
            return listarTodas();
        }

        try {
            Long id = Long.valueOf(texto);
            Optional<Mascota> mascota = mascotaRepository.findById(id);
            if (mascota.isPresent()) {
                return List.of(mascota.get());
            }
        } catch (NumberFormatException ignored) {
        }

        return mascotaRepository.findByNombreContainingIgnoreCase(texto);
    }

    @Transactional
    public Mascota guardar(Mascota mascota) {
        if (mascota == null) {
            throw new IllegalArgumentException("La mascota es obligatoria.");
        }

        Mascota nueva = new Mascota();
        aplicarCampos(mascota, nueva, false);
        return mascotaRepository.save(nueva);
    }

    @Transactional
    public Mascota actualizar(Long id, Mascota mascota) {
        Mascota existente = mascotaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mascota no encontrada."));

        aplicarCampos(mascota, existente, true);
        return mascotaRepository.save(existente);
    }

    @Transactional
    public boolean eliminar(Long id) {
        if (!mascotaRepository.existsById(id)) {
            return false;
        }
        mascotaRepository.deleteById(id);
        return true;
    }

    @Transactional
    public Map<String, Object> registroRapido(RegistroRapidoRequest request) {
        Map<String, Object> response = new HashMap<>();

        if (request == null) {
            response.put("success", false);
            response.put("message", "La solicitud de registro rápido es obligatoria.");
            return response;
        }

        String numeroDocumento = trimToEmpty(request.numeroDocumento());
        String nombreCompleto = trimToEmpty(request.nombreCompleto());
        String nombreMascota = trimToEmpty(request.nombreMascota());
        String tipoDocumento = trimToEmpty(request.tipoDocumento());

        if (numeroDocumento.isEmpty() || nombreCompleto.isEmpty() || nombreMascota.isEmpty()) {
            response.put("success", false);
            response.put("message", "El documento, el nombre del cliente y el nombre de la mascota son obligatorios.");
            return response;
        }

        Cliente cliente = buscarOCrearCliente(request, tipoDocumento, numeroDocumento, nombreCompleto);

        Mascota mascota = new Mascota();
        mascota.setNombre(nombreMascota);
        mascota.setEspecie(trimToNull(request.especie()));
        mascota.setRaza(trimToNull(request.raza()));
        mascota.setSexo(trimToNull(request.sexo()));
        mascota.setColor(trimToNull(request.color()));
        mascota.setObservaciones(trimToNull(request.observaciones()));
        mascota.setEstado("ACTIVA");
        mascota.setFechaNacimiento(request.fechaNacimiento());
        mascota.setCliente(cliente);

        Mascota guardada = mascotaRepository.save(mascota);

        response.put("success", true);
        response.put("message", cliente.getId() != null ? "Registro rápido completado." : "Registro rápido completado.");
        response.put("clienteId", cliente.getId());
        response.put("mascotaId", guardada.getId());
        response.put("data", guardada);
        return response;
    }

    private Cliente buscarOCrearCliente(RegistroRapidoRequest request, String tipoDocumento, String numeroDocumento, String nombreCompleto) {
        if (request.clienteId() != null) {
            return clienteRepository.findById(request.clienteId())
                    .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado para el id proporcionado."));
        }

        Optional<Cliente> existente = clienteRepository.findByNumeroDocumento(numeroDocumento);
        if (existente.isPresent()) {
            return existente.get();
        }

        Cliente cliente = new Cliente();
        cliente.setTipoDocumento(tipoDocumento.isEmpty() ? "1" : tipoDocumento);
        cliente.setNumeroDocumento(numeroDocumento);
        cliente.setNombreCompleto(nombreCompleto);
        cliente.setTelefono(trimToNull(request.telefono()));
        cliente.setCorreo(trimToNull(request.correo()));
        return clienteRepository.save(cliente);
    }

    private void aplicarCampos(Mascota origen, Mascota destino, boolean preservarClienteExistente) {
        String nombre = trimToEmpty(origen.getNombre());
        if (nombre.isEmpty()) {
            throw new IllegalArgumentException("El nombre de la mascota es obligatorio.");
        }

        destino.setNombre(nombre);
        destino.setEspecie(trimToNull(origen.getEspecie()));
        destino.setRaza(trimToNull(origen.getRaza()));
        destino.setSexo(trimToNull(origen.getSexo()));
        destino.setFechaNacimiento(origen.getFechaNacimiento());
        destino.setColor(trimToNull(origen.getColor()));
        destino.setObservaciones(trimToNull(origen.getObservaciones()));
        destino.setEstado(trimToNull(origen.getEstado()) != null ? trimToNull(origen.getEstado()) : "ACTIVA");

        if (origen.getCliente() != null) {
            Integer clienteId = origen.getCliente().getId();
            if (clienteId != null) {
                Cliente cliente = clienteRepository.findById(clienteId)
                        .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado."));
                destino.setCliente(cliente);
            } else if (!preservarClienteExistente) {
                destino.setCliente(null);
            }
        } else if (!preservarClienteExistente) {
            destino.setCliente(null);
        }
    }

    private String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    public record RegistroRapidoRequest(
            Integer clienteId,
            String tipoDocumento,
            String numeroDocumento,
            String nombreCompleto,
            String telefono,
            String correo,
            String nombreMascota,
            String especie,
            String raza,
            String sexo,
            java.time.LocalDate fechaNacimiento,
            String color,
            String observaciones
    ) {}
}
