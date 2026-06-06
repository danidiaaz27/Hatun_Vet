package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.repository.BanoCorteRepository;
import com.hatunvet.sistema.repository.ConsultaInsumoRepository; // INYECTADO
import com.hatunvet.sistema.repository.ProductoRepository;
import com.hatunvet.sistema.repository.VentaRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/reportes")
public class ReporteController {

    private final VentaRepository ventaRepository;
    private final BanoCorteRepository banoCorteRepository;
    private final ProductoRepository productoRepository;
    private final ConsultaInsumoRepository consultaInsumoRepository; // INYECTADO

    // Constructor actualizado con la nueva dependencia
    public ReporteController(VentaRepository ventaRepository, 
                             BanoCorteRepository banoCorteRepository, 
                             ProductoRepository productoRepository,
                             ConsultaInsumoRepository consultaInsumoRepository) {
        this.ventaRepository = ventaRepository;
        this.banoCorteRepository = banoCorteRepository;
        this.productoRepository = productoRepository;
        this.consultaInsumoRepository = consultaInsumoRepository;
    }

    // 1. Mostrar la pantalla del Dashboard (HTML)
    @GetMapping
    public String index() {
        return "reportes";
    }

    // 2. API Centralizada para abastecer todos los gráficos y tarjetas
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

            response.put("success", true);
            response.put("kpis", kpis);
            response.put("petshop", petshop);
            response.put("peluqueria", peluqueria);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al cargar dashboard: " + e.getMessage());
        }

        return response;
    }

    // --- NUEVO ENDPOINT: Rentabilidad y Análisis de COGS Clínico ---
    @GetMapping("/api/rentabilidad-clinica")
    @ResponseBody
    public Map<String, Object> obtenerRentabilidadClinica() {
        Map<String, Object> response = new HashMap<>();

        try {
            // 1. Totalizar los ingresos brutos facturados por los insumos usados
            // Se asume un método en el repositorio que use SUM(i.precioCobrado * i.cantidadUsada) con COALESCE
            BigDecimal ingresosInsumos = consultaInsumoRepository.sumTotalVendidoInsumos();
            if (ingresosInsumos == null) ingresosInsumos = BigDecimal.ZERO;

            // 2. Calcular el COGS (Costo de ventas). Si manejas precio de compra/costo base de adquisición 
            // en tu entidad o un porcentaje estándar, lo calculas aquí. 
            // Como aproximación matemática limpia, calcularemos el costo real del inventario comercial sacrificado.
            BigDecimal cogsInsumos = consultaInsumoRepository.sumCostoTotalInsumos();
            if (cogsInsumos == null) cogsInsumos = BigDecimal.ZERO;

            // 3. Cálculo dinámico de Utilidad Bruta
            BigDecimal utilidadBruta = ingresosInsumos.subtract(cogsInsumos);

            // 4. Cálculo seguro del Margen de Utilidad evitando divisiones por cero
            BigDecimal margenPorcentaje = BigDecimal.ZERO;
            if (ingresosInsumos.compareTo(BigDecimal.ZERO) > 0) {
                margenPorcentaje = utilidadBruta.multiply(new BigDecimal("100"))
                        .divide(ingresosInsumos, 2, RoundingMode.HALF_UP);
            }

            // Estructurar respuesta limpia para los gráficos del Frontend
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
}