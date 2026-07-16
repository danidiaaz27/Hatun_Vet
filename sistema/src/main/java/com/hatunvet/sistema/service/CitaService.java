package com.hatunvet.sistema.service;

import com.hatunvet.sistema.model.*;
import com.hatunvet.sistema.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class CitaService {

    private final CitaRepository citaRepository;
    private final ConsultaClinicaRepository consultaRepository;
    private final ConsultaInsumoRepository insumoRepository;
    private final ServicioTerceroRepository terceroRepository;
    private final HorarioVeterinarioRepository horarioRepository;
    private final PermisoVeterinarioRepository permisoRepository;
    private final ProductoRepository productoRepository;

    public CitaService(CitaRepository citaRepository, ConsultaClinicaRepository consultaRepository, 
                       ConsultaInsumoRepository insumoRepository, ServicioTerceroRepository terceroRepository,
                       HorarioVeterinarioRepository horarioRepository, PermisoVeterinarioRepository permisoRepository,
                       ProductoRepository productoRepository) {
        this.citaRepository = citaRepository;
        this.consultaRepository = consultaRepository;
        this.insumoRepository = insumoRepository;
        this.terceroRepository = terceroRepository;
        this.horarioRepository = horarioRepository;
        this.permisoRepository = permisoRepository;
        this.productoRepository = productoRepository;
    }

    // Estados que se consideran "activos" (bloquean horario / cuentan en agenda)
    private static final List<String> ESTADOS_ACTIVOS = List.of("AGENDADA", "EN_ESPERA", "EN_ATENCION");

    public List<Cita> obtenerTodasLasCitas() {
        return citaRepository.findAll();
    }

    @Transactional
    public Cita guardarCita(Cita cita) {
        if (cita.getVeterinario() == null || cita.getVeterinario().getId() == null) {
            throw new IllegalArgumentException("Debe seleccionar un médico.");
        }
        if (cita.getFechaHoraProgramada() == null) {
            throw new IllegalArgumentException("La fecha y hora programada es obligatoria.");
        }

        String vetId = cita.getVeterinario().getId();
        LocalDateTime fechaHora = cita.getFechaHoraProgramada();

        // 1. Validar Horario Laboral Semanal (solo si el médico tiene algún horario configurado en BD)
        int diaSemanaJava = fechaHora.getDayOfWeek().getValue(); // 1 = Lunes, 7 = Domingo
        java.time.LocalTime horaCita = fechaHora.toLocalTime();

        List<HorarioVeterinario> todosLosHorarios = horarioRepository.findByVeterinarioId(vetId);
        if (!todosLosHorarios.isEmpty()) {
            List<HorarioVeterinario> horariosHoy = horarioRepository.findByVeterinarioIdAndDiaSemana(vetId, diaSemanaJava);
            if (horariosHoy.isEmpty()) {
                throw new IllegalArgumentException("El médico seleccionado no labora el día de la semana programado.");
            }
            boolean cumpleHorario = false;
            for (HorarioVeterinario h : horariosHoy) {
                if (!horaCita.isBefore(h.getHoraInicio()) && !horaCita.isAfter(h.getHoraFin())) {
                    cumpleHorario = true;
                    break;
                }
            }
            if (!cumpleHorario) {
                throw new IllegalArgumentException("La hora seleccionada (" + horaCita + ") está fuera del horario laboral del médico para este día.");
            }
        }

        // 2. Validar Permisos / Inasistencias activas
        List<PermisoVeterinario> permisosActivos = permisoRepository.findActivePermissionsOverlapping(vetId, fechaHora);
        if (!permisosActivos.isEmpty()) {
            PermisoVeterinario p = permisosActivos.get(0);
            throw new IllegalArgumentException("El médico seleccionado no está disponible en esta fecha debido a un permiso: " + p.getMotivo() + ".");
        }

        // 3. Validar Cruces / Conflictos de Cita en la misma hora (bloques idénticos)
        List<Cita> citasCoincidentes = citaRepository.findAll().stream()
                .filter(c -> c.getVeterinario() != null && c.getVeterinario().getId().equals(vetId))
                .filter(c -> cita.getId() == null || !c.getId().equals(cita.getId())) // Ignorar si es la misma al editar
                .filter(c -> c.getFechaHoraProgramada().equals(fechaHora))
                .filter(c -> ESTADOS_ACTIVOS.contains(c.getEstado()))
                .toList();

        if (!citasCoincidentes.isEmpty()) {
            throw new IllegalArgumentException("El médico ya tiene otra cita programada para esta misma hora.");
        }

        return citaRepository.save(cita);
    }

    @Transactional
    public Cita registrarLlegadaPaciente(String citaId) {
        Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada"));
        
        if (!cita.getEstado().equals("AGENDADA") && !cita.getEstado().equals("PAGO_PARCIAL")) {
            throw new IllegalStateException("Solo se puede hacer check-in a citas en estado AGENDADA o PAGO_PARCIAL. Estado actual: " + cita.getEstado());
        }
        cita.setEstado("EN_ESPERA");
        cita.setFechaHoraLlegada(LocalDateTime.now());
        cita.setCostoBaseInformado(true); 
        return citaRepository.save(cita);
    }

    @Transactional
    public Cita iniciarAtencionMedica(String citaId) {
        Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada"));

        if (!cita.getEstado().equals("EN_ESPERA")) {
            throw new IllegalStateException("Solo se puede iniciar atención a pacientes en estado EN_ESPERA. Estado actual: " + cita.getEstado());
        }

        cita.setEstado("EN_ATENCION");
        return citaRepository.save(cita);
    }

    @Transactional
    public ConsultaClinica guardarAnamnesis(String citaId, ConsultaClinica datosClinicos) {
        if (datosClinicos.getPesoKg() == null || datosClinicos.getTemperaturaC() == null || 
            datosClinicos.getSintomas().trim().isEmpty() || datosClinicos.getDiagnosticoPresuntivo().trim().isEmpty()) {
            throw new IllegalArgumentException("El peso, temperatura, síntomas y diagnóstico son obligatorios.");
        }
        Cita cita = citaRepository.findById(citaId).orElseThrow(() -> new IllegalArgumentException("Cita no encontrada"));

        if (!cita.getEstado().equals("EN_ATENCION")) {
            throw new IllegalStateException("Solo se puede registrar la anamnesis mientras la cita está EN_ATENCION. Estado actual: " + cita.getEstado());
        }
        
        Optional<ConsultaClinica> consultaOpt = consultaRepository.findByCitaId(citaId);
        ConsultaClinica consulta;
        if (consultaOpt.isPresent()) {
            consulta = consultaOpt.get();
        } else {
            consulta = new ConsultaClinica();
            consulta.setCita(cita);
        }
        
        consulta.setPesoKg(datosClinicos.getPesoKg());
        consulta.setTemperaturaC(datosClinicos.getTemperaturaC());
        consulta.setFrecuenciaCardiaca(datosClinicos.getFrecuenciaCardiaca());
        consulta.setSintomas(datosClinicos.getSintomas());
        consulta.setDiagnosticoPresuntivo(datosClinicos.getDiagnosticoPresuntivo());
        consulta.setTratamientoIndicado(datosClinicos.getTratamientoIndicado());
        consulta.setFechaProximaCita(datosClinicos.getFechaProximaCita());
        consulta.setNombreProximaVacuna(datosClinicos.getNombreProximaVacuna());
        consulta.setFechaProximaVacuna(datosClinicos.getFechaProximaVacuna());
        consulta.setNombreProximoDesparasitante(datosClinicos.getNombreProximoDesparasitante());
        consulta.setFechaProximaDesparasitacion(datosClinicos.getFechaProximaDesparasitacion());
        
        return consultaRepository.save(consulta);
    }

    public Optional<ConsultaClinica> obtenerConsultaPorCita(String citaId) {
        return consultaRepository.findByCitaId(citaId);
    }

    @Transactional
    public ConsultaInsumo registrarInsumo(String consultaId, String productoId, BigDecimal cantidadUsada) {
        ConsultaClinica consulta = consultaRepository.findById(consultaId)
                .orElseThrow(() -> new IllegalArgumentException("Consulta no encontrada"));

        if (!consulta.getCita().getEstado().equals("EN_ATENCION")) {
            throw new IllegalStateException("Solo se pueden registrar insumos mientras la consulta está en curso (EN_ATENCION).");
        }

        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        if (!producto.isEstado()) {
            throw new IllegalArgumentException("El producto seleccionado está inactivo.");
        }

        if (cantidadUsada == null || cantidadUsada.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("La cantidad usada debe ser mayor a 0.");
        }

        ConsultaInsumo insumo = new ConsultaInsumo();
        insumo.setConsultaClinica(consulta);
        insumo.setProducto(producto);
        insumo.setCantidadUsada(cantidadUsada);

        if (producto.isFraccionable()) {
            // Lógica de fraccionamiento
            BigDecimal stockFracc = producto.getStockFraccionado();
            if (stockFracc == null) {
                stockFracc = BigDecimal.ZERO;
            }

            if (stockFracc.compareTo(cantidadUsada) >= 0) {
                // Hay suficiente en el envase ya abierto
                producto.setStockFraccionado(stockFracc.subtract(cantidadUsada));
            } else {
                // Se debe abrir un nuevo envase
                if (producto.getStock() <= 0) {
                    throw new IllegalArgumentException("Stock insuficiente en farmacia para abrir un nuevo envase de " + producto.getNombre());
                }
                // Decrementar 1 del stock general
                producto.setStock(producto.getStock() - 1);
                // Sumar la capacidad total del nuevo envase al stock fraccionado
                BigDecimal capacidad = producto.getCapacidadTotal();
                if (capacidad == null || capacidad.compareTo(BigDecimal.ZERO) <= 0) {
                    throw new IllegalStateException("El producto fraccionable no tiene configurada una capacidad total válida.");
                }
                BigDecimal nuevoStockFracc = stockFracc.add(capacidad);
                if (nuevoStockFracc.compareTo(cantidadUsada) < 0) {
                    throw new IllegalArgumentException("La cantidad solicitada supera la capacidad de una unidad completa del producto.");
                }
                producto.setStockFraccionado(nuevoStockFracc.subtract(cantidadUsada));
            }

            insumo.setUnidadMedida(producto.getUnidadMedida());
            insumo.setPrecioCobrado(producto.getPrecioFraccionado().multiply(cantidadUsada).setScale(2, RoundingMode.HALF_UP));

            // Calcular costo proporcional
            BigDecimal costoBase = producto.getPrecio().multiply(new BigDecimal("0.40"));
            BigDecimal capacidad = producto.getCapacidadTotal();
            BigDecimal costoProporcional = costoBase.multiply(cantidadUsada).divide(capacidad, 4, RoundingMode.HALF_UP);
            insumo.setCostoUnitario(costoProporcional.setScale(2, RoundingMode.HALF_UP));
        } else {
            // Producto no fraccionable (unidad completa)
            int cantEntera = cantidadUsada.intValue();
            if (producto.getStock() < cantEntera) {
                throw new IllegalArgumentException("Stock insuficiente para el producto: " + producto.getNombre());
            }
            producto.setStock(producto.getStock() - cantEntera);

            insumo.setUnidadMedida("unidad");
            insumo.setPrecioCobrado(producto.getPrecio().multiply(cantidadUsada).setScale(2, RoundingMode.HALF_UP));
            insumo.setCostoUnitario(producto.getPrecio().multiply(new BigDecimal("0.40")).setScale(2, RoundingMode.HALF_UP));
        }

        productoRepository.save(producto);
        return insumoRepository.save(insumo);
    }

    @Transactional
    public void revertirInsumo(Long insumoId) {
        ConsultaInsumo insumo = insumoRepository.findById(insumoId)
                .orElseThrow(() -> new IllegalArgumentException("Registro de insumo no encontrado"));

        if (!insumo.getConsultaClinica().getCita().getEstado().equals("EN_ATENCION")) {
            throw new IllegalStateException("Solo se pueden retirar insumos mientras la consulta está en curso (EN_ATENCION).");
        }

        Producto producto = insumo.getProducto();
        BigDecimal cantUsada = insumo.getCantidadUsada();

        if (producto.isFraccionable()) {
            BigDecimal stockFracc = producto.getStockFraccionado();
            if (stockFracc == null) {
                stockFracc = BigDecimal.ZERO;
            }
            BigDecimal nuevoStockFracc = stockFracc.add(cantUsada);
            BigDecimal capacidad = producto.getCapacidadTotal();

            if (capacidad != null && capacidad.compareTo(BigDecimal.ZERO) > 0) {
                // Si el stock fraccionado excede la capacidad de un envase, podemos "cerrar" el envase excedente
                if (nuevoStockFracc.compareTo(capacidad) >= 0) {
                    int envasesCerrados = nuevoStockFracc.divide(capacidad, 0, RoundingMode.DOWN).intValue();
                    producto.setStock(producto.getStock() + envasesCerrados);
                    nuevoStockFracc = nuevoStockFracc.subtract(capacidad.multiply(new BigDecimal(envasesCerrados)));
                }
            }
            producto.setStockFraccionado(nuevoStockFracc);
        } else {
            producto.setStock(producto.getStock() + cantUsada.intValue());
        }

        productoRepository.save(producto);
        insumoRepository.delete(insumo);
    }

    public List<ConsultaInsumo> obtenerInsumosConsulta(String consultaId) {
        return insumoRepository.findByConsultaClinicaId(consultaId);
    }

    @Transactional
    public Cita finalizarCita(String citaId) {
        Cita cita = citaRepository.findById(citaId).orElseThrow(() -> new IllegalArgumentException("Cita no encontrada"));

        if (!cita.getEstado().equals("EN_ATENCION")) {
            throw new IllegalStateException("Solo se puede finalizar una cita que está EN_ATENCION. Estado actual: " + cita.getEstado());
        }

        consultaRepository.findByCitaId(citaId).orElseThrow(() -> new IllegalStateException("No se puede finalizar sin anamnesis."));
        cita.setEstado("FINALIZADA");
        return citaRepository.save(cita);
    }

    // --- NUEVO: CANCELACIÓN DE CITA ---
    @Transactional
    public Cita cancelarCita(String citaId) {
        Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada"));

        List<String> estadosCancelables = List.of("AGENDADA", "EN_ESPERA");
        if (!estadosCancelables.contains(cita.getEstado())) {
            throw new IllegalStateException("No se puede cancelar una cita en estado " + cita.getEstado() + ".");
        }

        cita.setEstado("CANCELADA");
        return citaRepository.save(cita);
    }

    // --- NUEVO: MARCAR NO ASISTIÓ (NO-SHOW) ---
    @Transactional
    public Cita marcarNoShow(String citaId) {
        Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada"));

        if (!cita.getEstado().equals("AGENDADA")) {
            throw new IllegalStateException("Solo se puede marcar 'No Asistió' a citas en estado AGENDADA. Estado actual: " + cita.getEstado());
        }

        cita.setEstado("NO_ASISTIO");
        return citaRepository.save(cita);
    }

    // --- HISTORIAL PERPETUO ---
    @Transactional(readOnly = true)
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
    @Transactional(readOnly = true)
    public List<Map<String, Object>> obtenerCitasParaFacturacion() {
        List<Cita> citasFinalizadas = citaRepository.findByEstadoIn(List.of("FINALIZADA", "PAGO_PARCIAL"));
        
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
                    itemIns.put("idProducto", ins.getProducto().getId());
                    itemIns.put("descripcion", ins.getProducto().getNombre() + " (" + ins.getCantidadUsada() + " " + ins.getUnidadMedida() + ")");
                    itemIns.put("precio", ins.getPrecioCobrado());
                    itemIns.put("cantidad", 1);
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
            
            // Restar abonos anteriores de los precios de los ítems secuencialmente
            BigDecimal abonoRestante = cita.getTotalCobrado() != null ? cita.getTotalCobrado() : BigDecimal.ZERO;
            for (Map<String, Object> item : detallesCesta) {
                if (abonoRestante.compareTo(BigDecimal.ZERO) <= 0) {
                    break;
                }
                BigDecimal precioItem = new BigDecimal(item.get("precio").toString());
                if (abonoRestante.compareTo(precioItem) >= 0) {
                    abonoRestante = abonoRestante.subtract(precioItem);
                    item.put("precio", 0.00);
                } else {
                    precioItem = precioItem.subtract(abonoRestante);
                    abonoRestante = BigDecimal.ZERO;
                    item.put("precio", precioItem.doubleValue());
                }
            }

            map.put("detalles", detallesCesta);
            double total = detallesCesta.stream().mapToDouble(d -> Double.parseDouble(d.get("precio").toString())).sum();
            map.put("total", total);
            map.put("totalCobrado", cita.getTotalCobrado() != null ? cita.getTotalCobrado() : BigDecimal.ZERO);
            map.put("costoTotalOriginal", calcularCostoTotalCita(cita.getId()));
            
            return map;
        })
        .filter(m -> Double.parseDouble(m.get("total").toString()) > 0.01) // Solo mostrar si queda saldo pendiente
        .toList();
    }

    public List<ConsultaClinica> obtenerAlertasVigentes() {
        return consultaRepository.findAlertasVigentes(java.time.LocalDate.now());
    }

    @Transactional(readOnly = true)
    public BigDecimal calcularCostoTotalCita(String citaId) {
        BigDecimal totalEsperado = new BigDecimal("35.00");
        Optional<ConsultaClinica> clinicaOpt = consultaRepository.findByCitaId(citaId);
        if (clinicaOpt.isPresent()) {
            List<ConsultaInsumo> insumos = insumoRepository.findByConsultaClinicaId(clinicaOpt.get().getId());
            for (ConsultaInsumo ins : insumos) {
                totalEsperado = totalEsperado.add(ins.getPrecioCobrado());
            }
            List<ServicioTercero> terceros = terceroRepository.findByConsultaClinicaId(clinicaOpt.get().getId());
            for (ServicioTercero ter : terceros) {
                totalEsperado = totalEsperado.add(ter.getPrecioCliente());
            }
        }
        return totalEsperado;
    }
}