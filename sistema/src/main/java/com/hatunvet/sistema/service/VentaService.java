package com.hatunvet.sistema.service;

import com.hatunvet.sistema.model.Producto;
import com.hatunvet.sistema.model.Venta;
import com.hatunvet.sistema.model.VentaDetalle;
import com.hatunvet.sistema.repository.ProductoRepository;
import com.hatunvet.sistema.repository.VentaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public VentaService(VentaRepository ventaRepository, ProductoRepository productoRepository, FacturacionService facturacionService) {
        this.ventaRepository = ventaRepository;
        this.productoRepository = productoRepository;
        this.facturacionService = facturacionService;
    }

    // El @Transactional asegura que si algo falla (como Miapicloud),
    // la base de datos no guarde nada a medias y el stock regrese a su lugar.
    @Transactional
    public Map<String, Object> procesarVentaYFacturar(Map<String, Object> payload) {
        Map<String, Object> comprobante = (Map<String, Object>) payload.get("comprobante");
        Map<String, Object> cliente = (Map<String, Object>) payload.get("cliente");
        List<Map<String, Object>> items = (List<Map<String, Object>>) payload.get("items");

        String tipoDoc = (String) comprobante.get("tipoDoc");
        String serie = tipoDoc.equals("01") ? "F001" : "B001";

        int correlativo = (int) ventaRepository.count() + 1;

        // 1. Completar JSON para Miapicloud
        comprobante.put("serie", serie);
        comprobante.put("correlativo", String.valueOf(correlativo));
        comprobante.put("fechaEmision", LocalDate.now().toString());
        comprobante.put("horaEmision", LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));

        // 2. Preparar la Venta
        Venta venta = new Venta();
        venta.setTipoComprobante(tipoDoc);
        venta.setSerie(serie);
        venta.setCorrelativo(correlativo);
        venta.setClienteDocumento((String) cliente.get("numDoc"));
        venta.setClienteNombre((String) cliente.get("rznSocial"));

        double totalVenta = 0, totalIgv = 0, totalBase = 0;

        // 3. Preparar los Detalles
        for (Map<String, Object> itemData : items) {
            String codProd = (String) itemData.get("codProducto");
            Producto p = productoRepository.findByCodigo(codProd)
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + codProd));

            int cantidad = (Integer) itemData.get("cantidad");

            // ¡EL CAMBIO ESTÁ AQUÍ! Solo actualizamos en memoria.
            // Quitamos el save() manual. Hibernate lo guardará solo al final.
            p.setStock(p.getStock() - cantidad);

            VentaDetalle detalle = new VentaDetalle();
            detalle.setProducto(p); // Java mantiene el enlace fuerte con la BD
            detalle.setCantidad(cantidad);

            // Convertimos los números de forma segura
            detalle.setPrecioUnitario(Double.parseDouble(itemData.get("mtoPrecioUnitario").toString()));
            detalle.setValorUnitario(Double.parseDouble(itemData.get("mtoValorUnitario").toString()));
            detalle.setIgv(Double.parseDouble(itemData.get("igv").toString()));
            detalle.setImporteTotal(detalle.getPrecioUnitario() * cantidad);

            totalVenta += detalle.getImporteTotal();
            totalIgv += detalle.getIgv();
            totalBase += (detalle.getValorUnitario() * cantidad);

            venta.addDetalle(detalle);
        }

        venta.setOpGravadas(totalBase);
        venta.setIgv(totalIgv);
        venta.setTotal(totalVenta);
        venta.setEstado("FACTURADO");

        // 4. ¡El Golpe Final! Guarda la Venta, los Detalles y actualiza el Stock, todo a la vez.
        ventaRepository.save(venta);

        // 5. Enviamos la orden a la SUNAT a través de Miapicloud
        return facturacionService.enviarAMiapicloud(payload);
    }
}