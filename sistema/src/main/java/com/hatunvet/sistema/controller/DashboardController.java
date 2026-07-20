package com.hatunvet.sistema.controller;

import com.hatunvet.sistema.model.Cita;
import com.hatunvet.sistema.repository.BanoCorteRepository;
import com.hatunvet.sistema.repository.ProductoRepository;
import com.hatunvet.sistema.repository.VentaRepository;
import com.hatunvet.sistema.service.CajaService;
import com.hatunvet.sistema.service.CitaService;
import com.hatunvet.sistema.service.MascotaService;
import com.hatunvet.sistema.service.UsuarioService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
public class DashboardController {

    private final UsuarioService usuarioService;
    private final CitaService citaService;
    private final MascotaService mascotaService;
    private final VentaRepository ventaRepository;
    private final BanoCorteRepository banoCorteRepository;
    private final ProductoRepository productoRepository;
    private final CajaService cajaService;

    public DashboardController(UsuarioService usuarioService, CitaService citaService, MascotaService mascotaService,
                                VentaRepository ventaRepository, BanoCorteRepository banoCorteRepository,
                                ProductoRepository productoRepository, CajaService cajaService) {
        this.usuarioService = usuarioService;
        this.citaService = citaService;
        this.mascotaService = mascotaService;
        this.ventaRepository = ventaRepository;
        this.banoCorteRepository = banoCorteRepository;
        this.productoRepository = productoRepository;
        this.cajaService = cajaService;
    }

    @GetMapping("/dashboard")
    public String mostrarDashboard(Model model) {
        model.addAttribute("totalUsuarios", usuarioService.contarUsuarios());

        try {
            model.addAttribute("totalMascotas", mascotaService.listarTodas().size());
        } catch (Exception e) {
            model.addAttribute("totalMascotas", 0);
        }

        List<Cita> citasDeHoy = List.of();
        try {
            citasDeHoy = citaService.obtenerTodasLasCitas().stream()
                    .filter(c -> c.getFechaHoraProgramada() != null &&
                                 c.getFechaHoraProgramada().toLocalDate().equals(LocalDate.now()))
                    .sorted((a, b) -> a.getFechaHoraProgramada().compareTo(b.getFechaHoraProgramada()))
                    .collect(Collectors.toList());
            model.addAttribute("citasHoy", citasDeHoy.size());
        } catch (Exception e) {
            model.addAttribute("citasHoy", 0);
        }
        // NUEVO: Agenda de Hoy (listado completo del día, para verlo de un vistazo)
        model.addAttribute("agendaHoy", citasDeHoy);

        model.addAttribute("alertas", citaService.obtenerAlertasVigentes());

        // NUEVO: Ingresos de hoy y del mes (ventas POS + grooming)
        try {
            BigDecimal ventasHoy = ventaRepository.sumVentasHoy();
            BigDecimal peluqueriaHoy = banoCorteRepository.sumIngresosHoy();
            model.addAttribute("ingresosHoy", ventasHoy.add(peluqueriaHoy));

            BigDecimal ventasMes = ventaRepository.sumVentasMes();
            BigDecimal peluqueriaMes = banoCorteRepository.sumIngresosMes();
            model.addAttribute("ingresosMes", ventasMes.add(peluqueriaMes));
        } catch (Exception e) {
            model.addAttribute("ingresosHoy", BigDecimal.ZERO);
            model.addAttribute("ingresosMes", BigDecimal.ZERO);
        }

        // NUEVO: Stock crítico (top 5 para no saturar el panel)
        try {
            List<?> stockCritico = productoRepository.findByStockLessThanEqualAndEstadoTrueOrderByStockAsc(5);
            model.addAttribute("stockCritico", stockCritico.size() > 5 ? stockCritico.subList(0, 5) : stockCritico);
            model.addAttribute("totalStockCritico", stockCritico.size());
        } catch (Exception e) {
            model.addAttribute("stockCritico", List.of());
            model.addAttribute("totalStockCritico", 0);
        }

        // NUEVO: Estado de Caja (abierta con su balance esperado, o cerrada)
        Map<String, Object> estadoCaja = new HashMap<>();
        try {
            cajaService.obtenerSesionActiva().ifPresentOrElse(sesion -> {
                estadoCaja.put("abierta", true);
                estadoCaja.put("usuarioApertura", sesion.getUsuarioApertura());
                estadoCaja.put("fechaApertura", sesion.getFechaApertura());

                BigDecimal ingresos = BigDecimal.ZERO;
                BigDecimal egresos = BigDecimal.ZERO;
                for (var mov : cajaService.listarMovimientosDeSesion(sesion.getId())) {
                    if ("INGRESO".equals(mov.getTipo())) {
                        ingresos = ingresos.add(mov.getMonto());
                    } else {
                        egresos = egresos.add(mov.getMonto());
                    }
                }
                BigDecimal esperado = sesion.getMontoApertura().add(ingresos).subtract(egresos);
                estadoCaja.put("montoEsperado", esperado);
            }, () -> estadoCaja.put("abierta", false));
        } catch (Exception e) {
            estadoCaja.put("abierta", false);
        }
        model.addAttribute("estadoCaja", estadoCaja);

        return "dashboard";
    }
}