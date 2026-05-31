# 🐾 Sistema de Gestión Veterinaria e Inventario Fraccionado - LUSOVET (HatunVet)

¡Bienvenido al repositorio oficial del sistema de gestión integral para **LUSOVET**! Este software ha sido desarrollado a medida para optimizar, centralizar y automatizar las operaciones clínicas, estéticas y comerciales de una veterinaria especializada de forma exclusiva en la atención de **perros y gatos**.

El sistema combina la rigurosidad inmutable del historial clínico con un potente Punto de Venta (POS) express, control de caja diario, gestión de campañas de marketing y un avanzado algoritmo de control de inventario fraccionado para evitar mermas.

---

## 🏢 Protocolo de Atención en Mostrador (Flujo del Counter)

El sistema emula y organiza el flujo real de recepción en clínica de la siguiente manera:

1. **Recepción del Tutor:** El usuario con rol `Counter` recibe al cliente (tutor), quien puede acudir acompañado de su mascota (perro o gato) o solo (para compras rápidas de petshop).
2. **Calificación del Servicio:** El Counter define el destino del cliente seleccionando una de las 3 unidades principales en la interfaz.
3. **Derivación y Alertas:** 
   * **Si es Atención Médica:** El sistema lanza un recordatorio visual obligatorio indicando que *toda consulta médica tiene un costo base*. Procede a abrir o buscar el registro del tutor y la ficha médica perenne de la mascota.
   * **Si es Pet Shop / Venta Flash:** Deriva al Punto de Venta ágil sin forzar registros在新nnecesarios.

---

## 📌 Arquitectura del Sistema por Unidades de Negocio

### 1. 🩺 Unidad de Atención Médica (SERV.VETERINARIO)
Módulo clínico donde los datos clínicos de las mascotas **quedan guardados de forma permanente en su historial médico perpetuo** (nunca se pierden).
* **Ficha de Anamnesis Obligatoria:** Captura de constantes vitales en cada visita: Peso, Edad, Temperatura y Raza.
* **Antecedentes:** Registro histórico de alergias, cirugías previas, patologías crónicas o condiciones preexistentes.
* **Tratamiento Clínico:** Registro de recetas, fármacos inyectados en consulta y dosis exactas.
* **Seguimiento y Cirugías:** Control de la evolución del paciente y programación de operaciones complejas (ej. esterilizaciones, profilaxis) con visualización directa de pendientes en el Dashboard.

### 2. ✂️ Unidad de Grooming (BAÑOS Y CORTES)
Gestión de citas y registros específicos para el cuidado y estética de caninos y felinos:
* **Baños Especializados:** División en el sistema entre **Baño Medicado** (asociado a una orden o indicación dermatológica) y **Baño Estético**.
* **Baños y Cortes:** Parametrización de estilos de corte y tarifas diferenciadas según la especie y la raza del paciente.

### 3. 💊 Unidad de Pet Shop & Farmacia (VENTAS)
Punto de venta integrado con control de inventarios automatizado en tiempo real:
* Venta de fármacos de mostrador y medicamentos bajo receta médica.
* Venta de productos de higiene, accesorios y juguetes.
* Venta de alimentos balanceados (líneas de mantenimiento y dietas prescriptivas/medicadas).

---

## ⚡ Módulos Críticos y Flujos de Operación Avanzados

### A. Punto de Venta (POS) y Flujo de "Ventas Flash"
Diseñado para maximizar la velocidad de atención a clientes de paso que no disponen de tiempo para registros detallados o que solo realizan compras rápidas:
* El cajero solo solicita el número de **DNI o RUC** para la emisión automatizada de la boleta o factura electrónica.
* **Consistencia Interna:** El sistema procesa la transacción asociándola a una entidad genérica (`Cliente Flash / Venta Mostrador`), reteniendo de manera estricta el detalle de los ítems, importes y métodos de pago en el historial de auditoría de caja sin alterar la base de datos de pacientes.

### B. Control de Caja Diaria y Arqueo (Finanzas)
Monitoreo riguroso del flujo de dinero físico y digital basado en la contabilidad del negocio (ref: `CAJA LUSOVET ENERO 2026.xlsx`):
* **Apertura de Caja:** Declaración obligatoria del monto inicial (sencillo) al comenzar el turno.
* **Trazabilidad de Medios de Pago:** Registro y separación automatizada de transacciones según el canal (Efectivo, Yape, Plin, Tarjeta de Crédito/Débito).
* **Cierre de Caja:** Módulo de conciliación (Arqueo) al finalizar el día para mitigar descuadres entre los reportes del sistema y los saldos reales de caja y pasarelas digitales.

### C. Calendario y Gestión de Horarios Flexibles
* **Horarios Dinámicos:** Permite al administrador reconfigurar los horarios de apertura, cierre y turnos de atención directamente desde el panel, adaptándose a contingencias o decisiones del dueño de la veterinaria.
* **Bloqueo Operativo:** Capacidad de inhabilitar bloques de tiempo para cirugías complejas de emergencia, reuniones de personal o mantenimiento del local.

---

## 🧪 Módulo de Fraccionamiento de Inventario e Insumos Clínicos

Para mitigar el descontrol en mermas y deducir el **costo de venta real (COGS) por procedimiento**, el sistema cuenta con un inventario bidimensional conectado en tiempo real (Unidad de Lote vs. Unidad de Consumo):

              ┌────────────────────────┐
              │ INGRESO DE MERCANCÍA   │ ──► Entrada de Lote (Ej. 100 frascos cerrados)
              └────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   STOCK COMERCIAL      │ ──► Disponibles en Tienda: 100 frascos enteros
              └────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        ▼                                     ▼
┌─────────────────────┐               ┌─────────────────────┐
│ A. VENTA DIRECTA    │               │ B. USO EN CONSULTA  │
│    (Petshop / POS)  │               │    (Fraccionado)    │
└─────────────────────┘               └─────────────────────┘
│                                     │
▼                                     ▼
Se vende 1 frasco                  Se "abre" 1 frasco para la clínica.
cerrado entero.                    * El Stock Comercial baja a 99 frascos.
│                         * El Frasco Abierto pasa a "Sub-Stock".
│                                     │
│                                     ▼
│                         El médico aplica 5 ml o 3 gotas en un paciente.
│                         * Sistema calcula: Frasco de 100 ml - 5 ml.
│                         * Estado en BD: 99 frascos cerrados +
│                           1 frasco abierto con 95 ml restantes.
└──────────────────┬──────────────────┘
▼
┌────────────────────────┐
│ REPORTES Y DASHBOARD   │ ──► Muestra utilidades reales netas
└────────────────────────┘     restando el costo de insumos usados.


### Reglas de Negocio del Inventario Relacionado:
1. **Apertura Automatizada de Frasco:** En el momento en que un veterinario registra en el tratamiento el uso de un fármaco fraccionable (ej. antibióticos, gotas para infección de oídos) y **no hay un frasco abierto previo**, el sistema descuenta automáticamente 1 unidad del stock comercial y crea un registro hijo con la capacidad total en mililitros/dosis.
2. **Consumo Progresivo:** Las siguientes aplicaciones (ej. 10ml de antibiótico, 1 gota, uso de un par de guantes) se descuentan estrictamente de la unidad abierta. El sistema bloquea la apertura de nuevos frascos del mismo producto hasta que el saldo del frasco activo llegue a cero ($0$).
3. **Costo de Venta Real (Márgenes Netos):** Si una consulta médica tiene un costo de S/. 20.00, el sistema calcula de forma interna el valor del par de guantes, jeringas y mililitros de medicamento inyectado (ej. S/. 3.50 de costo interno). En el módulo de reportes, reflejará una utilidad clínica neta de S/. 16.50, impidiendo la falsa percepción de que el costo total de la consulta es ganancia limpia.

---

## 🏷️ Módulo de Campañas, Promociones y CMS (Landing Page)

El sistema integra un módulo de marketing conectado directamente con la **Landing Page (Página Web Pública)** de la veterinaria para atraer y fidelizar clientes.

### 1. 📢 Gestión de Promociones Temporales y Campañas de Salud
Desde el panel administrativo se programan eventos con vigencia automatizada:
* **Promociones Estacionales:** Descuentos porcentuales o fijos en categorías del Pet Shop o Farmacia (ej. *15% de descuento en abrigos en temporada de invierno* o *promoción en higiene dental*).
* **Campañas Clínicas de Alto Volumen:** Configuración de tarifas planas temporales para procedimientos masivos como **Campañas de Esterilización a bajo costo** o **Campañas de Vacunación**.

### 2. 🌐 Integración y Control del CMS (Landing Page Principal)
A través de la sección de **Configuración** del menú administrativo, el usuario puede gestionar la información pública de la Landing Page sin necesidad de modificar código:
* **Banner de Campañas:** Activación/Desactivación visual en la web de las campañas de esterilización o vacunación vigentes.
* **Vitrina de Promociones:** Sincronización automática de los productos o accesorios con descuento del Petshop para que aparezcan destacados en la página principal informativa de los tutores.
* **Información del Negocio:** Modificación de horarios de atención al público, teléfonos de emergencia y ubicación que se renderizan dinámicamente en el pie de página de la web.

---

## 📊 Dashboard y Torre de Control Operativa

La pantalla principal del sistema actúa como el panel de control del día:
* **Línea de Tiempo de Pendientes:** Visualización cronológica de las citas médicas y de grooming agendadas por el Counter en tiempo real.
* **Alerta de Operaciones:** Monitor de cirugías programadas, destacando el paciente, procedimiento (especialmente crítico en días de campaña de esterilización) y estado clínico.
* **Resumen Financiero y de Campañas:** Gráficos del estado de la caja diaria (ingresos totales separados por métodos de pago) y métricas de rendimiento sobre cuántos servicios se han vendido bajo las promociones del mes.

---

## ⚙️ Estructura de la Interfaz y Menú Lateral (UI)

El sistema adopta y expande la estructura visual base (ref: `image_bf2c88.jpg`) distribuyendo los módulos de la siguiente manera:

* **VENTAS (POS):** Dashboard | Punto de Venta (Con soporte Venta Flash) | Historial de Ventas | **Caja Diaria (Apertura / Cierre e Insumos)**
* **GROOMING:** Baños y Cortes (Gestión de Citas y Tipo de Baño)
* **CLÍNICA:** Agenda Médica | Programación de Cirugías | Historias Clínicas (Anamnesis Perpetua, Antecedentes, Tratamientos)
* **MARKETING:** **Módulo de Campañas y Promociones**
* **ADMINISTRACIÓN:** 
  * Inventario (Fármacos, Alimentos, Accesorios)
  * **Recetas e Insumos de Uso Interno (Fraccionamiento)**
  * Categorías | Productos | Proveedores
  * Clientes y Mascotas (Historial de Pacientes)
  * Perfiles | Usuarios
  * Reportes y Dashboard (Análisis de Mermas, Rentabilidad neta y Métodos de Pago)
  * **Configuración (Horarios del Local / Administrador de la Landing Page Pública)**

  ### 🛒 4. Logística de Entrada: Recepción por Empaque Mayorista (Cajas / Blísters)
Para evitar errores de digitación en el almacén, el módulo de **Ingreso de Mercancía** permite registrar las compras utilizando las unidades de empaque del proveedor, realizando la conversión a unidades comerciales de forma interna:

* **Configuración de Equivalencias:** Cada producto cuenta con un factor de empaque mayorista. 
  > *Ejemplo:* 1 Caja de Antibiótico X = 24 Frascos. / 1 Caja de Jeringas = 100 Unidades.
* **Flujo en el Registro de Compra:** Cuando llega el pedido del proveedor, el usuario simplemente digita: `Cantidad: 2` | `Unidad: Caja`.
* **Multiplicación Automatizada en el Kardex:** El sistema detecta la equivalencia y, al guardar la compra, no ingresa "2 unidades" al estante; de manera automática calcula ($2 \times 24$) e inyecta **48 frascos** al *Stock Comercial* disponible para la venta o uso clínico.
