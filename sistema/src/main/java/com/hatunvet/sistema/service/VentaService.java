package com.hatunvet.sistema.service;

import com.hatunvet.sistema.model.Producto;
import com.hatunvet.sistema.model.Venta;
import com.hatunvet.sistema.model.VentaDetalle;
import com.hatunvet.sistema.repository.ProductoRepository;
import com.hatunvet.sistema.repository.VentaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final FacturacionService facturacionService;
    private final CajaService cajaService; // NUEVA CONEXIÓN

    public VentaService(VentaRepository ventaRepository, ProductoRepository productoRepository, 
                        FacturacionService facturacionService, CajaService cajaService) {
        this.ventaRepository = ventaRepository;
        this.productoRepository = productoRepository;
        this.facturacionService = facturacionService;
        this.cajaService = cajaService;
    }

    @Transactional
    public Map<String, Object> procesarVentaYFacturar(Map<String, Object> payload) {
        Map<String, Object> comprobante = (Map<String, Object>) payload.get("comprobante");
        Map<String, Object> cliente = (Map<String, Object>) payload.get("cliente");
        List<Map<String, Object>> items = (List<Map<String, Object>>) payload.get("items");

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

            if (p.getStock() < cantidad) {
                throw new RuntimeException("Stock insuficiente para: " + p.getNombre() + ". Stock actual: " + p.getStock());
            }

            BigDecimal precioReal = p.getPrecio();
            BigDecimal cantidadBd = new BigDecimal(cantidad);

            BigDecimal valorUnitarioReal = precioReal.divide(new BigDecimal("1.18"), 2, RoundingMode.HALF_UP);
            BigDecimal importeTotal = precioReal.multiply(cantidadBd);
            BigDecimal baseItem = valorUnitarioReal.multiply(cantidadBd);
            BigDecimal igvItem = importeTotal.subtract(baseItem);

            p.setStock(p.getStock() - cantidad);

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
                null
        );

        Map<String, Object> respuestaApi = facturacionService.enviarAMiapicloud(payload);

        if (respuestaApi != null) {
            if (respuestaApi.containsKey("success") && Boolean.FALSE.equals(respuestaApi.get("success"))) {
                throw new RuntimeException("Error en facturación electrónica: " + respuestaApi.get("message"));
            }
            if (respuestaApi.containsKey("respuesta")) {
                Map<String, Object> interna = (Map<String, Object>) respuestaApi.get("respuesta");
                if (interna.containsKey("success") && Boolean.FALSE.equals(interna.get("success"))) {
                    throw new RuntimeException("SUNAT rechazó el comprobante: " + interna.get("message"));
                }
            }
        }

        return respuestaApi;
    }
}