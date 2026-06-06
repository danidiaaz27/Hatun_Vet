package com.hatunvet.sistema.service;

import com.hatunvet.sistema.model.*;
import com.hatunvet.sistema.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CitaService {

    private final CitaRepository citaRepository;
    private final ConsultaClinicaRepository consultaRepository;
    private final ConsultaInsumoRepository insumoRepository;
    private final ServicioTerceroRepository terceroRepository;
    private final ProductoRepository productoRepository; // NUEVA INYECCIÓN para control de inventario

    // Constructor actualizado con la nueva dependencia
    public CitaService(CitaRepository citaRepository, ConsultaClinicaRepository consultaRepository, 
                       ConsultaInsumoRepository insumoRepository, ServicioTerceroRepository terceroRepository,
                       ProductoRepository productoRepository) {
        this.citaRepository = citaRepository;
        this.consultaRepository = consultaRepository;
        this.insumoRepository = insumoRepository;
        this.terceroRepository = terceroRepository;
        this.productoRepository = productoRepository;
    }

    public List<Cita> obtenerTodasLasCitas() {
        return citaRepository.findAll();
    }

    @Transactional
    public Cita guardarCita(Cita cita) {
        return citaRepository.save(cita);
    }

    @Transactional
    public Cita registrarLlegadaPaciente(String citaId, boolean costoBaseInformado) {
        Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada"));
        
        if (!cita.getEstado().equals("AGENDADA")) {
            throw new IllegalStateException("La cita no está en estado AGENDADA.");
        }
        cita.setEstado("EN_ESPERA");
        cita.setFechaHoraLlegada(LocalDateTime.now());
        cita.setCostoBaseInformado(costoBaseInformado); 
        return citaRepository.save(cita);
    }

    @Transactional
    public Cita iniciarAtencionMedica(String citaId) {
        Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada"));
        cita.setEstado("EN_ATENCION");
        return citaRepository.save(cita);
    }

    @Transactional
    public ConsultaClinica guardarAnamnesis(String citaId, ConsultaClinica datosClinicos) {
        if (datosClinicos.getPesoKg() == null || datosClinicos.getTemperaturaC() == null || 
            datosClinicos.getSintomas().trim().isEmpty() || datosClinicos.getDiagnosticoPresuntivo().trim().isEmpty()) {
            throw new IllegalArgumentException("El peso, temperatura, síntomas y diagnóstico son obligatorios.");
        }

        Optional<ConsultaClinica> consultaExistenteOpt = consultaRepository.findByCitaId(citaId);
        
        if (consultaExistenteOpt.isPresent()) {
            ConsultaClinica consultaExistente = consultaExistenteOpt.get();
            
            consultaExistente.setPesoKg(datosClinicos.getPesoKg());
            consultaExistente.setTemperaturaC(datosClinicos.getTemperaturaC());
            consultaExistente.setFrecuenciaCardiaca(datosClinicos.getFrecuenciaCardiaca());
            consultaExistente.setSintomas(datosClinicos.getSintomas());
            consultaExistente.setDiagnosticoPresuntivo(datosClinicos.getDiagnosticoPresuntivo());
            consultaExistente.setTratamientoIndicado(datosClinicos.getTratamientoIndicado());
            
            return consultaRepository.save(consultaExistente);
        } else {
            Cita cita = citaRepository.findById(citaId)
                    .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada"));
            
            datosClinicos.setCita(cita);
            return consultaRepository.save(datosClinicos);
        }
    }

    // --- CAMBIO 2: Lógica de deducción y fraccionamiento del Sub-Stock Clínico ---
    @Transactional
    public ConsultaInsumo registrarInsumo(String consultaId, ConsultaInsumo insumo) {
        ConsultaClinica consulta = consultaRepository.findById(consultaId)
                .orElseThrow(() -> new IllegalArgumentException("Consulta no encontrada"));
        
        Producto producto = productoRepository.findById(insumo.getProducto().getId())
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        // --- CORREGIDO: Conversión segura y universal a BigDecimal sin importar el tipo de origen ---
        BigDecimal consumoReal = new BigDecimal(String.valueOf(insumo.getCantidadUsada()));

        if (producto.getSubStock() == null) {
            producto.setSubStock(BigDecimal.ZERO);
        }

        if (producto.getSubStock().compareTo(consumoReal) < 0) {
            if (producto.getStock() >= 1) {
                producto.setStock(producto.getStock() - 1);
                
                BigDecimal contenidoAAgregar = producto.getContenidoUnidad() != null ? producto.getContenidoUnidad() : BigDecimal.ZERO;
                producto.setSubStock(producto.getSubStock().add(contenidoAAgregar));
            } else {
                throw new IllegalStateException("Stock comercial agotado. No es posible fraccionar más unidades de: " + producto.getNombre());
            }

            if (producto.getSubStock().compareTo(consumoReal) < 0) {
                throw new IllegalStateException("El consumo solicitado supera el contenido disponible fraccionado de: " + producto.getNombre());
            }
        }

        producto.setSubStock(producto.getSubStock().subtract(consumoReal));
        
        productoRepository.save(producto);

        insumo.setConsultaClinica(consulta);
        insumo.setProducto(producto);
        return insumoRepository.save(insumo);
    }

    @Transactional
    public Cita finalizarCita(String citaId) {
        Cita cita = citaRepository.findById(citaId).orElseThrow(() -> new IllegalArgumentException("Cita no encontrada"));
        consultaRepository.findByCitaId(citaId).orElseThrow(() -> new IllegalStateException("No se puede finalizar sin anamnesis."));
        cita.setEstado("FINALIZADA");
        return citaRepository.save(cita);
    }

    // --- HISTORIAL PERPETUO ---
    public List<Map<String, Object>> obtenerHistorialMascota(String mascotaId) {
        List<ConsultaClinica> consultas = consultaRepository.findHistorialByMascotaId(mascotaId);
        return consultas.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("fecha", c.getFechaAtencion());
            map.put("medico", c.getCita().getVeterinario().getNombre());
            map.put("peso", c.getPesoKg());
            map.put("temp", c.getTemperaturaC());
            map.put("sintomas", c.getSintomas());
            map.put("diagnostico", c.getDiagnosticoPresuntivo());
            map.put("tratamiento", c.getTratamientoIndicado());
            return map;
        }).toList();
    }

    // --- PUENTE CON EL PUNTO DE VENTA (POS) ---
    public List<Map<String, Object>> obtenerCitasParaFacturacion() {
        List<Cita> citasFinalizadas = citaRepository.findByEstado("FINALIZADA");
        
        return citasFinalizadas.stream().map(cita -> {
            Map<String, Object> map = new HashMap<>();
            map.put("citaId", cita.getId());
            map.put("mascota", cita.getMascota().getNombre());
            map.put("clienteDocumento", cita.getMascota().getCliente().getNumeroDocumento());
            map.put("clienteNombre", cita.getMascota().getCliente().getNombreCompleto());
            
            List<Map<String, Object>> detallesCesta = new ArrayList<>();
            
            Map<String, Object> itemConsulta = new HashMap<>();
            itemConsulta.put("descripcion", "Consulta Médica Veterinaria - " + cita.getMotivoPrincipal());
            itemConsulta.put("precio", 35.00);
            itemConsulta.put("cantidad", 1);
            itemConsulta.put("tipo", "SERVICIO");
            detallesCesta.add(itemConsulta);

            Optional<ConsultaClinica> clinicaOpt = consultaRepository.findByCitaId(cita.getId());
            if(clinicaOpt.isPresent()){
                List<ConsultaInsumo> insumos = insumoRepository.findByConsultaClinicaId(clinicaOpt.get().getId());
                for(ConsultaInsumo ins : insumos) {
                    Map<String, Object> itemIns = new HashMap<>();
                    itemIns.put("codProducto", ins.getProducto().getCodigo());
                    itemIns.put("descripcion", ins.getProducto().getNombre() + " (" + ins.getCantidadUsada() + " " + ins.getUnidadMedida() + ")");
                    itemIns.put("precio", ins.getPrecioCobrado());
                    // --- CAMBIO 1: Garantizado el uso dinámico de getCantidadUsada() ---
                    itemIns.put("cantidad", ins.getCantidadUsada()); 
                    itemIns.put("tipo", "INSUMO");
                    detallesCesta.add(itemIns);
                }
                
                List<ServicioTercero> terceros = terceroRepository.findByConsultaClinicaId(clinicaOpt.get().getId());
                for(ServicioTercero ter : terceros) {
                    Map<String, Object> itemTer = new HashMap<>();
                    itemTer.put("descripcion", "Laboratorio Externo: " + ter.getTipoExamen());
                    itemTer.put("precio", ter.getPrecioCliente());
                    itemTer.put("cantidad", 1);
                    itemTer.put("tipo", "TERCERO");
                    detallesCesta.add(itemTer);
                }
            }
            
            map.put("detalles", detallesCesta);
            double total = detallesCesta.stream().mapToDouble(d -> Double.parseDouble(d.get("precio").toString())).sum();
            map.put("total", total);
            
            return map;
        }).toList();
    }
}