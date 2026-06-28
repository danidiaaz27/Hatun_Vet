package com.hatunvet.sistema.service;

import com.hatunvet.sistema.model.Producto;
import com.hatunvet.sistema.model.Venta;
import com.hatunvet.sistema.model.VentaDetalle;
import com.hatunvet.sistema.model.Cita;
import com.hatunvet.sistema.model.BanoCorte;
import com.hatunvet.sistema.repository.ProductoRepository;
import com.hatunvet.sistema.repository.VentaRepository;
import com.hatunvet.sistema.repository.CitaRepository;
import com.hatunvet.sistema.repository.BanoCorteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final FacturacionService facturacionService;
    private final CajaService cajaService; // NUEVA CONEXIÓN
    private final CitaRepository citaRepository;
    private final BanoCorteRepository banoCorteRepository;
    private final CitaService citaService;

    public VentaService(VentaRepository ventaRepository, ProductoRepository productoRepository, 
                        FacturacionService facturacionService, CajaService cajaService,
                        CitaRepository citaRepository, BanoCorteRepository banoCorteRepository,
                        CitaService citaService) {
        this.ventaRepository = ventaRepository;
        this.productoRepository = productoRepository;
        this.facturacionService = facturacionService;
        this.cajaService = cajaService;
        this.citaRepository = citaRepository;
        this.banoCorteRepository = banoCorteRepository;
        this.citaService = citaService;
    }

    @Transactional
    public Map<String, Object> procesarVentaYFacturar(Map<String, Object> payload) {
        Map<String, Object> comprobante = (Map<String, Object>) payload.get("comprobante");
        Map<String, Object> cliente = (Map<String, Object>) payload.get("cliente");
        List<Map<String, Object>> items = (List<Map<String, Object>>) payload.get("items");

        // Si se envió un citaId (cuenta médica importada), acumulamos el pago parcial o marcamos como COBRADA
        String citaId = (String) payload.get("citaId");
        if (citaId != null && !citaId.isEmpty()) {
            Cita cita = citaRepository.findById(citaId)
                    .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada: " + citaId));
            
            BigDecimal abonoCita = BigDecimal.ZERO;
            Object abonoCitaObj = payload.get("abonoCita");
            if (abonoCitaObj != null) {
                abonoCita = new BigDecimal(abonoCitaObj.toString());
            }
            
            BigDecimal nuevoTotalCobrado = (cita.getTotalCobrado() != null ? cita.getTotalCobrado() : BigDecimal.ZERO).add(abonoCita);
            cita.setTotalCobrado(nuevoTotalCobrado);
            
            BigDecimal costoTotal = citaService.calcularCostoTotalCita(citaId);
            if ("FINALIZADA".equals(cita.getEstado())) {
                cita.setEstado("COBRADA");
            } else {
                if (nuevoTotalCobrado.compareTo(costoTotal) >= 0) {
                    cita.setEstado("COBRADA");
                } else {
                    cita.setEstado("PAGO_PARCIAL");
                }
            }
            citaRepository.save(cita);
        }

        // Si se envió un banoCorteId (grooming importado), acumulamos el pago parcial o marcamos como PAGADO
        Object banoCorteIdObj = payload.get("banoCorteId");
        BanoCorte banoCorteAsociado = null;
        if (banoCorteIdObj != null) {
            Long banoCorteId = null;
            if (banoCorteIdObj instanceof Number) {
                banoCorteId = ((Number) banoCorteIdObj).longValue();
            } else if (banoCorteIdObj instanceof String && !((String) banoCorteIdObj).isEmpty()) {
                try {
                    banoCorteId = Long.parseLong((String) banoCorteIdObj);
                } catch (NumberFormatException e) {
                    // Ignorar
                }
            }
            if (banoCorteId != null) {
                BanoCorte banoCorte = banoCorteRepository.findById(banoCorteId)
                        .orElseThrow(() -> new IllegalArgumentException("Servicio de grooming no encontrado: " + banoCorteIdObj));
                
                BigDecimal abonoGrooming = BigDecimal.ZERO;
                Object abonoGroomingObj = payload.get("abonoGrooming");
                if (abonoGroomingObj != null) {
                    abonoGrooming = new BigDecimal(abonoGroomingObj.toString());
                }
                
                BigDecimal nuevoTotalCobrado = (banoCorte.getTotalCobrado() != null ? banoCorte.getTotalCobrado() : BigDecimal.ZERO).add(abonoGrooming);
                banoCorte.setTotalCobrado(nuevoTotalCobrado);
                
                if ("TERMINADO".equals(banoCorte.getEstado())) {
                    banoCorte.setEstado("PAGADO");
                } else {
                    if (nuevoTotalCobrado.compareTo(banoCorte.getPrecio()) >= 0) {
                        banoCorte.setEstado("PAGADO");
                    } else {
                        if (!"TERMINADO".equals(banoCorte.getEstado()) && !"EN_PROCESO".equals(banoCorte.getEstado())) {
                            banoCorte.setEstado("PAGO_PARCIAL");
                        }
                    }
                }
                banoCorteAsociado = banoCorteRepository.save(banoCorte);
            }
        }

        String tipoDoc = (String) comprobante.get("tipoDoc");
        String serie = tipoDoc.equals("01") ? "F001" : "B001";
        int correlativo = (int) ventaRepository.count() + 1;

        comprobante.put("serie", serie);
        comprobante.put("correlativo", String.valueOf(correlativo));
        comprobante.put("fechaEmision", LocalDate.now().toString());
        comprobante.put("horaEmision", LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));

        Venta venta = new Venta();
        venta.setTipoComprobante(tipoDoc);
        venta.setSerie(serie);
        venta.setCorrelativo(correlativo);
        venta.setClienteDocumento((String) cliente.get("numDoc"));
        venta.setClienteNombre((String) cliente.get("rznSocial"));
        
        // Se asume la obtención de la forma de pago enviada por el front (ej. "EFECTIVO", "TARJETA")
        String medioPago = comprobante.get("medioPago") != null ? (String) comprobante.get("medioPago") : "EFECTIVO";
        venta.setMedioPago(medioPago);

        BigDecimal totalVenta = BigDecimal.ZERO;
        BigDecimal totalIgv = BigDecimal.ZERO;
        BigDecimal totalBase = BigDecimal.ZERO;

        for (Map<String, Object> itemData : items) {
            String codProd = (String) itemData.get("codProducto");
            Producto p = productoRepository.findByCodigo(codProd)
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + codProd));

            int cantidad = (Integer) itemData.get("cantidad");

            if (!p.isEsServicio()) {
                if (p.getStock() < cantidad) {
                    throw new RuntimeException("Stock insuficiente para: " + p.getNombre() + ". Stock actual: " + p.getStock());
                }
                p.setStock(p.getStock() - cantidad);
            }

            BigDecimal precioReal;
            Object precioObj = itemData.get("mtoPrecioUnitario");
            if (precioObj != null) {
                precioReal = new BigDecimal(precioObj.toString());
            } else {
                precioReal = p.getPrecio();
            }

            BigDecimal cantidadBd = new BigDecimal(cantidad);

            BigDecimal valorUnitarioReal = precioReal.divide(new BigDecimal("1.18"), 2, RoundingMode.HALF_UP);
            BigDecimal importeTotal = precioReal.multiply(cantidadBd);
            BigDecimal baseItem = valorUnitarioReal.multiply(cantidadBd);
            BigDecimal igvItem = importeTotal.subtract(baseItem);

            VentaDetalle detalle = new VentaDetalle();
            detalle.setProducto(p);
            detalle.setCantidad(cantidad);
            detalle.setPrecioUnitario(precioReal);
            detalle.setValorUnitario(valorUnitarioReal);
            detalle.setIgv(igvItem);
            detalle.setImporteTotal(importeTotal);

            totalVenta = totalVenta.add(importeTotal);
            totalIgv = totalIgv.add(igvItem);
            totalBase = totalBase.add(baseItem);

            venta.addDetalle(detalle);
        }

        venta.setOpGravadas(totalBase);
        venta.setIgv(totalIgv);
        venta.setTotal(totalVenta);
        venta.setEstado("FACTURADO");

        ventaRepository.save(venta);

        // CONEXIÓN AUTOMÁTICA A CAJA: Se registra el ingreso del total de la venta
        cajaService.registrarIngresoAutomatizado(
                venta.getTotal(),
                "Venta POS N° " + venta.getSerie() + "-" + venta.getCorrelativo(),
                venta.getMedioPago(),
                venta,
                banoCorteAsociado
        );

        Map<String, Object> respuestaApi = new HashMap<>();
        try {
            respuestaApi = facturacionService.enviarAMiapicloud(payload);
            if (respuestaApi != null) {
                if (respuestaApi.containsKey("success") && Boolean.FALSE.equals(respuestaApi.get("success"))) {
                    venta.setEstado("ERROR_FACTURACION");
                    ventaRepository.save(venta);
                    throw new RuntimeException("Error en facturación electrónica: " + respuestaApi.get("message"));
                }
                if (respuestaApi.containsKey("respuesta")) {
                    Map<String, Object> interna = (Map<String, Object>) respuestaApi.get("respuesta");
                    if (interna.containsKey("success") && Boolean.FALSE.equals(interna.get("success"))) {
                        venta.setEstado("RECHAZADO_SUNAT");
                        ventaRepository.save(venta);
                        throw new RuntimeException("SUNAT rechazó el comprobante: " + interna.get("message"));
                    }
                }
            }
        } catch (Exception e) {
            // El API de facturación falló por red/timeout, pero la venta local es válida y debe quedar persistida.
            venta.setEstado("PENDIENTE_ENVIO");
            ventaRepository.save(venta);
            
            // Construimos una respuesta de fallback simulada para que el frontend del POS no aborte la transacción
            respuestaApi = new HashMap<>();
            respuestaApi.put("success", true);
            
            Map<String, Object> respuestaSimulada = new HashMap<>();
            respuestaSimulada.put("success", true);
            respuestaSimulada.put("pdf-ticket", "#");
            respuestaSimulada.put("pdf-a4", "#");
            respuestaSimulada.put("message", "Guardado localmente. Error de conexión con servidor de facturación: " + e.getMessage());
            
            respuestaApi.put("respuesta", respuestaSimulada);
        }

        return respuestaApi;
    }
}