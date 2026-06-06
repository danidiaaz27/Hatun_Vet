package com.hatunvet.sistema.service;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

// Importaciones de tus Entidades y Repositorios
import com.hatunvet.sistema.model.*;
import com.hatunvet.sistema.repository.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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

    // Inyección de dependencias por constructor
    public DataInitializer(
            PerfilRepository perfilRepository,
            UsuarioRepository usuarioRepository,
            ConfiguracionRepository configuracionRepository,
            CategoriaProductoRepository categoriaRepository,
            ProveedorRepository proveedorRepository,
            ProductoRepository productoRepository,
            ClienteRepository clienteRepository) {
        this.perfilRepository = perfilRepository;
        this.usuarioRepository = usuarioRepository;
        this.configuracionRepository = configuracionRepository;
        this.categoriaRepository = categoriaRepository;
        this.proveedorRepository = proveedorRepository;
        this.productoRepository = productoRepository;
        this.clienteRepository = clienteRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("⏳ Iniciando la carga de datos maestros para HatunVet...");
        
        initPerfiles();
        initUsuarios(); // <- Ahora creará los usuarios con sus perfiles asignados
        initConfiguracion();
        initCategorias();
        initProveedores();
        initClientes();
        
        System.out.println("✅ Carga de datos maestros completada con éxito.");
    }

    private void initPerfiles() {
        if (perfilRepository.count() == 0) {
            Perfil admin = new Perfil();
            admin.setId("32b655d7-3c3d-11f1-adc7-50ebf6d2c599");
            admin.setNombre("Administrador");
            admin.setDescripcion("Acceso total a todos los módulos del sistema");
            admin.setEstado(true);

            Perfil vendedor = new Perfil();
            vendedor.setId("21781535-5a0a-4e3c-a268-a7624bfcb09f");
            vendedor.setNombre("Vendedor");
            vendedor.setDescripcion("Encargado de Ventas");
            vendedor.setEstado(true);

            perfilRepository.save(admin);
            perfilRepository.save(vendedor);
            System.out.println(" -> Perfiles registrados.");
        }
    }

    private void initUsuarios() {
        if (usuarioRepository.count() == 0) {
            // Buscamos los perfiles que acabamos de asegurar que existen en la BD
            Perfil perfilAdmin = perfilRepository.findById("32b655d7-3c3d-11f1-adc7-50ebf6d2c599").orElse(null);
            Perfil perfilVendedor = perfilRepository.findById("21781535-5a0a-4e3c-a268-a7624bfcb09f").orElse(null);

            // Crear Usuario Administrador
            Usuario admin = new Usuario();
            admin.setId("32d68284-3c3d-11f1-adc7-50ebf6d2c599");
            admin.setNombre("Administrador HatunVet");
            admin.setUsuario("admin");
            admin.setPasswordHash("$2a$10$ifojdEQ.cHInJoDazhbvu.Ou2cb4ewKjLoqOZnghY1gPR4Rkykx4i");
            admin.setActivo(true);
            admin.setPerfil(perfilAdmin); // 👈 Vinculación corregida

            // Crear Usuario Vendedor
            Usuario vendedor = new Usuario();
            vendedor.setId("c53798d5-fb81-4bcd-872e-fdd108844563");
            vendedor.setNombre("Mateo Sanchez");
            vendedor.setUsuario("mateo");
            vendedor.setPasswordHash("$2a$10$1zZAfBNRu0D0oJuiZQkE3eQTpHBr/ApUSwDlsO/JTUA77mLjXbvc6");
            vendedor.setActivo(true);
            vendedor.setPerfil(perfilVendedor); // 👈 Vinculación corregida

            usuarioRepository.save(admin);
            usuarioRepository.save(vendedor);
            System.out.println(" -> Usuarios registrados correctamente con sus perfiles.");
        }
    }

    private void initConfiguracion() {
        if (configuracionRepository.count() == 0) {
            Configuracion config = new Configuracion();
            config.setId("7d14d75d-edad-4a41-9321-8e69a1d67c6f");
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
            cat1.setId("287bb28b-3c77-11f1-b50c-50ebf6d2c599");
            cat1.setNombre("Medicamentos");
            cat1.setDescripcion("Pastillas, jarabes, inyectables");
            cat1.setEstado(true);

            CategoriaProducto cat2 = new CategoriaProducto();
            cat2.setId("287bb6fe-3c77-11f1-b50c-50ebf6d2c599");
            cat2.setNombre("Accesorios");
            cat2.setDescripcion("Correas, platos, juguetes");
            cat2.setEstado(true);

            CategoriaProducto cat3 = new CategoriaProducto();
            cat3.setId("287bb7db-3c77-11f1-b50c-50ebf6d2c599");
            cat3.setNombre("Alimentos");
            cat3.setDescripcion("Croquetas y comida húmeda");
            cat3.setEstado(true);

            categoriaRepository.save(cat1);
            categoriaRepository.save(cat2);
            categoriaRepository.save(cat3);
            System.out.println(" -> Categorías de productos registradas.");
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
}