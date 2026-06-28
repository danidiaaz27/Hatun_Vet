package com.hatunvet.sistema.service;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

// Importaciones de tus Entidades y Repositorios
import com.hatunvet.sistema.model.*;
import com.hatunvet.sistema.repository.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    // Declaración de repositorios
    private final PerfilRepository perfilRepository;
    private final UsuarioRepository usuarioRepository;
    private final ConfiguracionRepository configuracionRepository;
    private final CategoriaProductoRepository categoriaRepository;
    private final ProveedorRepository proveedorRepository;
    private final ProductoRepository productoRepository;
    private final ClienteRepository clienteRepository;
    private final OpcionRepository opcionRepository;

    // Inyección de dependencias por constructor
    public DataInitializer(
            PerfilRepository perfilRepository,
            UsuarioRepository usuarioRepository,
            ConfiguracionRepository configuracionRepository,
            CategoriaProductoRepository categoriaRepository,
            ProveedorRepository proveedorRepository,
            ProductoRepository productoRepository,
            ClienteRepository clienteRepository,
            OpcionRepository opcionRepository) {
        this.perfilRepository = perfilRepository;
        this.usuarioRepository = usuarioRepository;
        this.configuracionRepository = configuracionRepository;
        this.categoriaRepository = categoriaRepository;
        this.proveedorRepository = proveedorRepository;
        this.productoRepository = productoRepository;
        this.clienteRepository = clienteRepository;
        this.opcionRepository = opcionRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("⏳ Iniciando la carga de datos maestros para HatunVet...");
        
        initPerfiles();
        initOpciones(); 
        initUsuarios(); 
        initConfiguracion();
        initCategorias();
        initProveedores();
        initClientes();
        initServiciosFijos();
        
        System.out.println("✅ Carga de datos maestros completada con éxito.");
    }

    private void initPerfiles() {
        if (perfilRepository.count() == 0) {
            Perfil admin = new Perfil();
            admin.setNombre("Administrador");
            admin.setDescripcion("Acceso total a todos los módulos del sistema");
            admin.setEstado(true);

            Perfil vendedor = new Perfil();
            vendedor.setNombre("Vendedor");
            vendedor.setDescripcion("Encargado de Ventas");
            vendedor.setEstado(true);

            Perfil veterinario = new Perfil();
            veterinario.setNombre("Veterinario");
            veterinario.setDescripcion("Personal médico encargado de la atención clínica y consultas");
            veterinario.setEstado(true);

            perfilRepository.save(admin);
            perfilRepository.save(vendedor);
            perfilRepository.save(veterinario);
            System.out.println(" -> Perfiles registrados.");
        }
    }

    private void initOpciones() {
        if (opcionRepository.count() == 0) {
            List<Opcion> lista = new ArrayList<>();
            lista.add(crearOpcion("Dashboard", "/dashboard", "bi bi-speedometer2"));
            lista.add(crearOpcion("Ventas (POS)", "/ventas/pos", "bi bi-cart-fill"));
            lista.add(crearOpcion("Historial Ventas", "/ventas/historial", "bi bi-receipt-cutoff"));
            lista.add(crearOpcion("Baños y Cortes", "/banos-cortes", "bi bi-scissors"));
            lista.add(crearOpcion("Mascotas", "/mascotas", "bi bi-paw"));
            lista.add(crearOpcion("Inventario", "/inventario", "bi bi-box-seam"));
            lista.add(crearOpcion("Categorías", "/categorias", "bi bi-tags"));
            lista.add(crearOpcion("Productos", "/productos/listar", "bi bi-bag-plus"));
            lista.add(crearOpcion("Proveedores", "/proveedores/listar", "bi bi-truck"));
            lista.add(crearOpcion("Clientes", "/clientes", "bi bi-people"));
            lista.add(crearOpcion("Perfiles", "/perfiles/listar", "bi bi-shield-lock"));
            lista.add(crearOpcion("Usuarios", "/usuarios/listar", "bi bi-person-gear"));
            lista.add(crearOpcion("Horarios y Permisos", "/medicos/horarios", "bi bi-clock-history"));
            lista.add(crearOpcion("Reportes", "/reportes", "bi bi-graph-up-arrow"));
            lista.add(crearOpcion("Configuración", "/configuracion", "bi bi-gear"));

            List<Opcion> guardadas = opcionRepository.saveAll(lista);

            // Vinculamos todas las opciones al Administrador buscando por nombre
            Perfil admin = perfilRepository.findAll().stream()
                    .filter(p -> "Administrador".equals(p.getNombre()))
                    .findFirst().orElse(null);
            if (admin != null) {
                admin.getOpciones().addAll(guardadas);
                perfilRepository.save(admin);
                System.out.println(" -> 15 módulos del sistema vinculados al Administrador.");
            }
        }
    }

    private Opcion crearOpcion(String nombre, String ruta, String icono) {
        Opcion o = new Opcion();
        o.setNombre(nombre);
        o.setRuta(ruta);
        o.setIcono(icono);
        return o;
    }

    private void initUsuarios() {
        if (usuarioRepository.count() == 0) {
            List<Perfil> perfiles = perfilRepository.findAll();
            Perfil perfilAdmin = perfiles.stream()
                    .filter(p -> "Administrador".equals(p.getNombre()))
                    .findFirst()
                    .orElse(null);

            Perfil perfilVendedor = perfiles.stream()
                    .filter(p -> "Vendedor".equals(p.getNombre()))
                    .findFirst()
                    .orElse(null);

            // Crear Usuario Administrador
            Usuario admin = new Usuario();
            admin.setNombre("Administrador HatunVet");
            admin.setUsuario("admin");
            admin.setPasswordHash("$2a$10$ifojdEQ.cHInJoDazhbvu.Ou2cb4ewKjLoqOZnghY1gPR4Rkykx4i");
            admin.setActivo(true);
            admin.setPerfil(perfilAdmin); 

            // Crear Usuario Vendedor
            Usuario vendedor = new Usuario();
            vendedor.setNombre("Mateo Sanchez");
            vendedor.setUsuario("mateo");
            vendedor.setPasswordHash("$2a$10$1zZAfBNRu0D0oJuiZQkE3eQTpHBr/ApUSwDlsO/JTUA77mLjXbvc6");
            vendedor.setActivo(true);
            vendedor.setPerfil(perfilVendedor); 

            usuarioRepository.save(admin);
            usuarioRepository.save(vendedor);
            System.out.println(" -> Usuarios registrados correctamente con sus perfiles.");
        }
    }

    private void initConfiguracion() {
        if (configuracionRepository.count() == 0) {
            Configuracion config = new Configuracion();
            config.setNombreVeterinaria("HatunVet");
            config.setLogo("11fcb9db-7eee-483e-b1eb-ce6f33b4c0fc.png");
            config.setTelefono("+51 987 654 321");
            config.setDireccion("AV. Zarumilla 130, Chiclayo");
            config.setCorreo("hatunvet.cix@gmail.com");
            config.setFacebook("https://www.facebook.com/profile.php?id=61584284166856");
            config.setInstagram("https://www.instagram.com/hatunvet.cix/");
            config.setWhatsapp("https://w.app/md2tiz");
            config.setTextoHero("Bienvenidos a HatunVet");
            config.setSubtituloHero("Tu clínica veterinaria de confianza. Ofrecemos atención profesional y amorosa para el bienestar de tus compañeros más fieles.");
            config.setMision("Ofrecer servicios de salud veterinaria de calidad...");
            config.setVision("Ser una clínica veterinaria de referencia...");

            configuracionRepository.save(config);
            System.out.println(" -> Configuración registrada.");
        }
    }

    private void initCategorias() {
        if (categoriaRepository.count() == 0) {
            CategoriaProducto cat1 = new CategoriaProducto();
            cat1.setNombre("Medicamentos");
            cat1.setDescripcion("Pastillas, jarabes, inyectables");
            cat1.setEstado(true);

            CategoriaProducto cat2 = new CategoriaProducto();
            cat2.setNombre("Accesorios");
            cat2.setDescripcion("Correas, platos, juguetes");
            cat2.setEstado(true);

            CategoriaProducto cat3 = new CategoriaProducto();
            cat3.setNombre("Alimentos");
            cat3.setDescripcion("Croquetas y comida húmeda");
            cat3.setEstado(true);

            categoriaRepository.save(cat1);
            categoriaRepository.save(cat2);
            categoriaRepository.save(cat3);
            System.out.println(" -> Categorías de productos registradas.");
        }

        // Asegurar la categoría de Servicios
        if (categoriaRepository.findAll().stream().noneMatch(c -> "Servicios".equalsIgnoreCase(c.getNombre()))) {
            CategoriaProducto catServ = new CategoriaProducto();
            catServ.setNombre("Servicios");
            catServ.setDescripcion("Servicios generales de la veterinaria (consulta, grooming, etc.)");
            catServ.setEstado(true);
            categoriaRepository.save(catServ);
            System.out.println(" -> Categoría 'Servicios' registrada.");
        }
    }

    private void initProveedores() {
        if (proveedorRepository.count() == 0) {
            Proveedor prov1 = new Proveedor();
            prov1.setNombre("DISTRIBUIDORA DE PRODUCTOS AGRO VETERINARIOS S.A.C.");
            prov1.setRuc("20602461824");
            prov1.setTelefono("975184139");
            prov1.setCorreo("authok20260426124147@mail.com");
            prov1.setDireccion("Avenida la chiclayo");
            prov1.setContacto("Maria Gonzales");
            prov1.setEstado(true);

            Proveedor prov2 = new Proveedor();
            prov2.setNombre("DISTRIBUIDORA Y COMERCIALIZADORA VETERINARIA S.A.C.");
            prov2.setRuc("20600067886");
            prov2.setTelefono("952145127");
            prov2.setCorreo("authok202@mail.com");
            prov2.setDireccion("Avenida la victoria");
            prov2.setContacto("Carmencita Lara");
            prov2.setEstado(true);

            proveedorRepository.save(prov1);
            proveedorRepository.save(prov2);
            System.out.println(" -> Proveedores registrados.");
        }
    }

    private void initClientes() {
        if (clienteRepository.count() == 0) {
            Cliente cli1 = new Cliente();
            cli1.setNombreCompleto("WILLIAM MIGUEL TABOADA BURGOS");
            cli1.setTelefono("970519291");
            cli1.setCorreo("leo12@gmail.com");
            cli1.setTipoDocumento("1");
            cli1.setNumeroDocumento("71348052");

            Cliente cli2 = new Cliente();
            cli2.setNombreCompleto("CRISTIAN OMAR CHILON VARGAS");
            cli2.setTelefono("928371231");
            cli2.setCorreo("miguel123@gmail.com");
            cli2.setTipoDocumento("1");
            cli2.setNumeroDocumento("72938192");

            clienteRepository.save(cli1);
            clienteRepository.save(cli2);
            System.out.println(" -> Clientes registrados.");
        }
    }

    private void initServiciosFijos() {
        CategoriaProducto catServ = categoriaRepository.findAll().stream()
                .filter(c -> "Servicios".equalsIgnoreCase(c.getNombre()))
                .findFirst()
                .orElseGet(() -> {
                    CategoriaProducto newCat = new CategoriaProducto();
                    newCat.setNombre("Servicios");
                    newCat.setDescripcion("Servicios generales de la veterinaria (consulta, grooming, etc.)");
                    newCat.setEstado(true);
                    return categoriaRepository.save(newCat);
                });

        if (productoRepository.findByCodigoIgnoreCase("CM-001").isEmpty()) {
            Producto cm = new Producto();
            cm.setCodigo("CM-001");
            cm.setNombre("Consulta Médica");
            cm.setDescripcion("Consulta Médica General");
            cm.setPrecio(new BigDecimal("35.00"));
            cm.setStock(0);
            cm.setEsServicio(true);
            cm.setCategoria(catServ);
            productoRepository.save(cm);
            System.out.println(" -> Servicio CM-001 (Consulta Médica) inicializado.");
        }

        if (productoRepository.findByCodigoIgnoreCase("INS-001").isEmpty()) {
            Producto ins = new Producto();
            ins.setCodigo("INS-001");
            ins.setNombre("Insumos Clínicos");
            ins.setDescripcion("Consumo consolidado de insumos médicos de la consulta");
            ins.setPrecio(BigDecimal.ZERO);
            ins.setStock(0);
            ins.setEsServicio(true);
            ins.setCategoria(catServ);
            productoRepository.save(ins);
            System.out.println(" -> Servicio INS-001 (Insumos Clínicos) inicializado.");
        }

        if (productoRepository.findByCodigoIgnoreCase("GR-001").isEmpty()) {
            Producto gr = new Producto();
            gr.setCodigo("GR-001");
            gr.setNombre("Servicio de Grooming");
            gr.setDescripcion("Servicio estético de baño y corte");
            gr.setPrecio(BigDecimal.ZERO);
            gr.setStock(0);
            gr.setEsServicio(true);
            gr.setCategoria(catServ);
            productoRepository.save(gr);
            System.out.println(" -> Servicio GR-001 (Grooming) inicializado.");
        }
    }
}