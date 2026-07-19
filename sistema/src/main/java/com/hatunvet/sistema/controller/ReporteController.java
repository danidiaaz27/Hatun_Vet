package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.Venta;
import com.hatunvet.sistema.repository.BanoCorteRepository;
import com.hatunvet.sistema.repository.ConsultaInsumoRepository;
import com.hatunvet.sistema.repository.ProductoRepository;
import com.hatunvet.sistema.repository.VentaDetalleRepository;
import com.hatunvet.sistema.repository.VentaRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/reportes")
public class ReporteController {

    private final VentaRepository ventaRepository;
    private final BanoCorteRepository banoCorteRepository;
    private final ProductoRepository productoRepository;
    private final ConsultaInsumoRepository consultaInsumoRepository;
    private final VentaDetalleRepository ventaDetalleRepository;

    public ReporteController(VentaRepository ventaRepository,
                             BanoCorteRepository banoCorteRepository,
                             ProductoRepository productoRepository,
                             ConsultaInsumoRepository consultaInsumoRepository,
                             VentaDetalleRepository ventaDetalleRepository) {
        this.ventaRepository = ventaRepository;
        this.banoCorteRepository = banoCorteRepository;
        this.productoRepository = productoRepository;
        this.consultaInsumoRepository = consultaInsumoRepository;
        this.ventaDetalleRepository = ventaDetalleRepository;
    }

    @GetMapping
    public String index() {
        return "reportes";
    }

    @GetMapping("/ventas")
    public String vistaReporteVentas() {
        return "reportes-ventas";
    }

    @GetMapping("/api/dashboard")
    @ResponseBody
    public Map<String, Object> obtenerDatosDashboard() {
        Map<String, Object> response = new HashMap<>();
        try {
            BigDecimal ventasHoy = ventaRepository.sumVentasHoy();
            BigDecimal ventasMes = ventaRepository.sumVentasMes();
            Long cantVentasMes = ventaRepository.countVentasMes();

            BigDecimal peluqueriaHoy = banoCorteRepository.sumIngresosHoy();
            BigDecimal peluqueriaMes = banoCorteRepository.sumIngresosMes();
            Long cantServiciosMes = banoCorteRepository.countServiciosMes();

            Map<String, Object> kpis = new HashMap<>();
            kpis.put("ingresosHoy", ventasHoy.add(peluqueriaHoy));
            kpis.put("ingresosMes", ventasMes.add(peluqueriaMes));
            kpis.put("totalVentasMes", cantVentasMes);
            kpis.put("totalServiciosMes", cantServiciosMes);

            Map<String, Object> petshop = new HashMap<>();
            petshop.put("stockCritico", productoRepository.findByStockLessThanEqualAndEstadoTrueOrderByStockAsc(5));

            Map<String, Object> peluqueria = new HashMap<>();
            peluqueria.put("porEspecie", banoCorteRepository.countAtencionesPorEspecie());
            peluqueria.put("porServicio", banoCorteRepository.countAtencionesPorServicio());

            List<Object[]> top = ventaDetalleRepository.topProductosVendidos(PageRequest.of(0, 5));

            response.put("success", true);
            response.put("kpis", kpis);
            response.put("petshop", petshop);
            response.put("peluqueria", peluqueria);
            response.put("topProductos", top);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al cargar dashboard: " + e.getMessage());
        }
        return response;
    }

    @GetMapping("/api/rentabilidad-clinica")
    @ResponseBody
    public Map<String, Object> obtenerRentabilidadClinica() {
        Map<String, Object> response = new HashMap<>();
        try {
            BigDecimal ingresosInsumos = consultaInsumoRepository.sumTotalVendidoInsumos();
            if (ingresosInsumos == null) ingresosInsumos = BigDecimal.ZERO;

            BigDecimal cogsInsumos = consultaInsumoRepository.sumCostoTotalInsumos();
            if (cogsInsumos == null) cogsInsumos = BigDecimal.ZERO;

            BigDecimal utilidadBruta = ingresosInsumos.subtract(cogsInsumos);

            BigDecimal margenPorcentaje = BigDecimal.ZERO;
            if (ingresosInsumos.compareTo(BigDecimal.ZERO) > 0) {
                margenPorcentaje = utilidadBruta.multiply(new BigDecimal("100"))
                        .divide(ingresosInsumos, 2, RoundingMode.HALF_UP);
            }

            Map<String, Object> datosRentabilidad = new HashMap<>();
            datosRentabilidad.put("ingresosInsumos", ingresosInsumos);
            datosRentabilidad.put("cogsInsumos", cogsInsumos);
            datosRentabilidad.put("utilidadBruta", utilidadBruta);
            datosRentabilidad.put("margenPorcentaje", margenPorcentaje);

            response.put("success", true);
            response.put("data", datosRentabilidad);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al calcular rentabilidad clínica: " + e.getMessage());
        }
        return response;
    }

    // NUEVO: paginado (10 por página por defecto) + agregados sobre TODO el filtro.
    // Usado por la tabla visible del Reporte de Ventas (DataTables serverSide).
    @GetMapping("/api/ventas-filtrado")
    @ResponseBody
    public Map<String, Object> filtrarReporteVentas(
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta,
            @RequestParam(required = false) String tipoComprobante,
            @RequestParam(required = false) String estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Map<String, Object> res = new HashMap<>();
        try {
            LocalDateTime inicio = (fechaDesde != null && !fechaDesde.isEmpty()) ? LocalDateTime.parse(fechaDesde + "T00:00:00") : null;
            LocalDateTime fin = (fechaHasta != null && !fechaHasta.isEmpty()) ? LocalDateTime.parse(fechaHasta + "T23:59:59") : null;

            Pageable pageable = PageRequest.of(page, size);
            List<Venta> ventas = ventaRepository.filtrarReporteVentasPaginado(inicio, fin, tipoComprobante, estado, pageable);
            long total = ventaRepository.contarReporteVentas(inicio, fin, tipoComprobante, estado);
            BigDecimal montoTotal = ventaRepository.sumTotalReporteVentas(inicio, fin, tipoComprobante, estado);
            BigDecimal igvTotal = ventaRepository.sumIgvReporteVentas(inicio, fin, tipoComprobante, estado);

            res.put("success", true);
            res.put("data", ventas);
            res.put("totalRegistros", total);
            res.put("montoTotal", montoTotal != null ? montoTotal : BigDecimal.ZERO);
            res.put("igvTotal", igvTotal != null ? igvTotal : BigDecimal.ZERO);
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "Error al filtrar el reporte de ventas: " + e.getMessage());
        }
        return res;
    }

    // NUEVO: SOLO para exportar Excel/PDF (trae todo lo filtrado, sin paginar).
    @GetMapping("/api/ventas-filtrado-todos")
    @ResponseBody
    public Map<String, Object> filtrarReporteVentasTodos(
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta,
            @RequestParam(required = false) String tipoComprobante,
            @RequestParam(required = false) String estado) {

        Map<String, Object> res = new HashMap<>();
        try {
            LocalDateTime inicio = (fechaDesde != null && !fechaDesde.isEmpty()) ? LocalDateTime.parse(fechaDesde + "T00:00:00") : null;
            LocalDateTime fin = (fechaHasta != null && !fechaHasta.isEmpty()) ? LocalDateTime.parse(fechaHasta + "T23:59:59") : null;

            List<Venta> ventas = ventaRepository.filtrarReporteVentas(inicio, fin, tipoComprobante, estado);

            res.put("success", true);
            res.put("data", ventas);
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "Error al exportar el reporte de ventas: " + e.getMessage());
        }
        return res;
    }
}