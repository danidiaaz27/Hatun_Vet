package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.repository.BanoCorteRepository;
import com.hatunvet.sistema.repository.ProductoRepository;
import com.hatunvet.sistema.repository.VentaRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/reportes")
public class ReporteController {

    private final VentaRepository ventaRepository;
    private final BanoCorteRepository banoCorteRepository;
    private final ProductoRepository productoRepository;

    public ReporteController(VentaRepository ventaRepository, BanoCorteRepository banoCorteRepository, ProductoRepository productoRepository) {
        this.ventaRepository = ventaRepository;
        this.banoCorteRepository = banoCorteRepository;
        this.productoRepository = productoRepository;
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
            // ¡Todo en estándar financiero (BigDecimal y Long)!
            // Gracias al COALESCE en el repositorio, esto nunca será nulo.
            BigDecimal ventasHoy = ventaRepository.sumVentasHoy();
            BigDecimal ventasMes = ventaRepository.sumVentasMes();
            Long cantVentasMes = ventaRepository.countVentasMes();

            BigDecimal peluqueriaHoy = banoCorteRepository.sumIngresosHoy();
            BigDecimal peluqueriaMes = banoCorteRepository.sumIngresosMes();
            Long cantServiciosMes = banoCorteRepository.countServiciosMes();

            // BLOQUE 1: KPIs Generales (Sumamos de forma segura con .add())
            Map<String, Object> kpis = new HashMap<>();
            kpis.put("ingresosHoy", ventasHoy.add(peluqueriaHoy));
            kpis.put("ingresosMes", ventasMes.add(peluqueriaMes));
            kpis.put("totalVentasMes", cantVentasMes);
            kpis.put("totalServiciosMes", cantServiciosMes);

            // BLOQUE 2: Datos de Petshop
            Map<String, Object> petshop = new HashMap<>();
            petshop.put("stockCritico", productoRepository.findByStockLessThanEqualAndEstadoTrueOrderByStockAsc(5));

            // BLOQUE 3: Datos de Peluquería
            Map<String, Object> peluqueria = new HashMap<>();
            peluqueria.put("porEspecie", banoCorteRepository.countAtencionesPorEspecie());
            peluqueria.put("porServicio", banoCorteRepository.countAtencionesPorServicio());

            // Empaquetar todo
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
}