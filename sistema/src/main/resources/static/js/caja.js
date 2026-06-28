$(document).ready(function() {
    const API_URL = '/caja/api';
    const modalMovimiento = new bootstrap.Modal(document.getElementById('modalMovimiento'));
    const modalCierre = new bootstrap.Modal(document.getElementById('modalCierre'));
    let usuarioActivo = "Administrador"; // Asume el rol de tu sesión
    let montoAperturaSesion = 0.00;

    function parsearFecha(fechaInput) {
        if (!fechaInput) return new Date();
        if (Array.isArray(fechaInput)) {
            return new Date(fechaInput[0], fechaInput[1] - 1, fechaInput[2], fechaInput[3] || 0, fechaInput[4] || 0, fechaInput[5] || 0);
        }
        return new Date(fechaInput);
    }
    
    // Inicializar DataTable con botones de Exportación
    let tablaCaja = $('#tablaCaja').DataTable({
        dom: 'rt', // Quitamos barra de búsqueda propia, usaremos nuestros filtros
        language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' },
        paging: false,
        ordering: false,
        buttons: [
            { extend: 'excelHtml5', text: '<i class="bi bi-file-earmark-excel"></i> Excel', className: 'btn btn-sm btn-success border-0 shadow-sm mx-1' },
            { extend: 'pdfHtml5', text: '<i class="bi bi-file-earmark-pdf"></i> PDF', className: 'btn btn-sm btn-danger border-0 shadow-sm' }
        ]
    });
    // Inyectar botones en nuestro contenedor personalizado
    tablaCaja.buttons().container().appendTo('#botonesExportar');

    // Carga inicial (Estado de sesión actual)
    function verificarEstadoCaja() {
        fetch(`${API_URL}/estado`)
            .then(r => r.json())
            .then(res => {
                if (res.success) {
                    if (res.activo) {
                        $('#seccionCerrada').hide();
                        $('#seccionAbierta').show();
                        montoAperturaSesion = parseFloat(res.sesion.montoApertura);
                        procesarYRenderizar(res.movimientos);
                    } else {
                        $('#seccionAbierta').hide();
                        $('#seccionCerrada').show();
                        $('#txtMontoApertura').val('0.00');
                    }
                }
            });
    }

    // El motor de cálculo del Dashboard
    function procesarYRenderizar(movimientos) {
        let ingresos = 0, egresos = 0, ingresosEfectivo = 0, ingresosOnline = 0;
        let cIngresos = 0, cEgresos = 0, cEfectivo = 0, cOnline = 0;

        tablaCaja.clear(); // Limpiar tabla

        movimientos.forEach(m => {
            const monto = parseFloat(m.monto);
            const esIngreso = m.tipo === 'INGRESO';
            
            // Lógica de contadores matemáticos
            if (esIngreso) {
                ingresos += monto;
                cIngresos++;
                if (m.medioPago === 'EFECTIVO') {
                    ingresosEfectivo += monto;
                    cEfectivo++;
                } else {
                    ingresosOnline += monto;
                    cOnline++;
                }
            } else {
                egresos += monto;
                cEgresos++;
            }

            // Diseño visual de la fila
            const badgeTipo = esIngreso ? '<span class="text-success fw-bold"><i class="bi bi-caret-up-fill"></i> INGRESO</span>' : '<span class="text-danger fw-bold"><i class="bi bi-caret-down-fill"></i> EGRESO</span>';
            const f = parsearFecha(m.fechaMovimiento).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
            const badgeCanal = `<span class="badge ${m.medioPago === 'EFECTIVO' ? 'bg-primary-subtle text-primary' : 'bg-info-subtle text-info'}"><i class="bi bi-cash"></i> ${m.medioPago}</span>`;

            tablaCaja.row.add([
                `<small class="text-muted">${f}</small>`,
                badgeTipo,
                `<span class="fw-semibold text-dark">${m.descripcion}</span>`,
                badgeCanal,
                `<div class="text-end fw-bold ${esIngreso ? 'text-success' : 'text-danger'}">S/ ${monto.toFixed(2)}</div>`
            ]);
        });

        tablaCaja.draw();

        // 1. Actualizar Tarjetas (KPIs)
        $('#lblTotalIngresos').text(`S/ ${ingresos.toFixed(2)}`);
        $('#lblIngresosEfectivo').text(`S/ ${ingresosEfectivo.toFixed(2)}`);
        $('#lblIngresosOnline').text(`S/ ${ingresosOnline.toFixed(2)}`);
        $('#lblTotalEgresos').text(`S/ ${egresos.toFixed(2)}`);
        
        // Contadores
        $('#countIngresos').text(`${cIngresos} operaciones`);
        $('#countIngresosEfectivo').text(`${cEfectivo} cobros`);
        $('#countIngresosOnline').text(`${cOnline} cobros`);
        $('#countEgresos').text(`${cEgresos} operaciones`);
        $('#badgeRegistros').text(`${movimientos.length} registros`);

        // 2. Actualizar Ecuación Matemática
        const esperado = montoAperturaSesion + ingresos - egresos;
        $('#eqApertura').text(`S/ ${montoAperturaSesion.toFixed(2)}`);
        $('#eqIngresos').text(`S/ ${ingresos.toFixed(2)}`);
        $('#eqEgresos').text(`S/ ${egresos.toFixed(2)}`);
        $('#eqBalance').text(`S/ ${esperado.toFixed(2)}`);
        
        $('#lblMontoEsperado').text(`S/ ${esperado.toFixed(2)}`);
        $('#lblMontoEsperadoModal').text(`S/ ${esperado.toFixed(2)}`);

        // Hora de actualización
        $('#lblHoraActualizacion').text(new Date().toLocaleTimeString('es-PE'));
    }

    // Funcionalidad de Búsqueda (Filtros)
    $('#btnBuscar').click(function() {
        const desde = $('#filtroDesde').val();
        const hasta = $('#filtroHasta').val();
        const tipo = $('#filtroTipo').val();
        const medio = $('#filtroMedio').val();

        fetch(`${API_URL}/filtrar?fechaDesde=${desde}&fechaHasta=${hasta}&tipo=${tipo}&medioPago=${medio}`)
            .then(r => r.json())
            .then(res => {
                if(res.success) procesarYRenderizar(res.data);
                else Swal.fire('Error', res.message, 'error');
            });
    });

    $('#btnLimpiar, #btnActualizar').click(function() {
        $('#filtroDesde, #filtroHasta, #filtroTipo, #filtroMedio').val('');
        verificarEstadoCaja();
    });

    // Peticiones de Apertura, Cierre y Gasto Manual
    $('#btnAbrirCaja').click(function() {
        const btn = $(this);
        const monto = $('#txtMontoApertura').val();
        btn.prop('disabled', true).text('Abriendo...');
        fetch(`${API_URL}/abrir?montoApertura=${monto}&usuario=${usuarioActivo}`, { method: 'POST' })
            .then(r => r.json()).then(data => {
                btn.prop('disabled', false).text('Confirmar Apertura');
                if (data.success) { Swal.fire('Éxito', data.message, 'success'); verificarEstadoCaja(); }
                else Swal.fire('Atención', data.message, 'warning');
            });
    });

    $('#formMovimiento').submit(function(e) {
        e.preventDefault();
        const btn = $('#btnGuardarMovimiento');
        btn.prop('disabled', true).text('Registrando...');
        const params = new URLSearchParams({
            tipo: $('#tipoMovimiento').val(), monto: $('#montoManual').val(),
            descripcion: $('#descripcionManual').val(), medioPago: $('#medioPagoManual').val()
        });
        fetch(`${API_URL}/movimiento-manual?${params.toString()}`, { method: 'POST' })
            .then(r => r.json()).then(data => {
                btn.prop('disabled', false).text('Registrar Movimiento');
                if (data.success) {
                    modalMovimiento.hide(); $('#formMovimiento')[0].reset();
                    verificarEstadoCaja(); Swal.fire('Éxito', data.message, 'success');
                } else Swal.fire('Error', data.message, 'error');
            });
    });

    $('#formCierre').submit(function(e) {
        e.preventDefault();
        const btn = $('#btnConfirmarCierre');
        btn.prop('disabled', true).text('Procesando Arqueo...');
        fetch(`${API_URL}/cerrar?montoCierreReal=${$('#montoCierreReal').val()}&usuario=${usuarioActivo}`, { method: 'POST' })
            .then(r => r.json()).then(data => {
                btn.prop('disabled', false).text('Efectuar Cierre');
                if (data.success) {
                    modalCierre.hide(); $('#formCierre')[0].reset();
                    verificarEstadoCaja();
                    const dif = parseFloat(data.sesion.montoCierreReal) - parseFloat(data.sesion.montoCierreEsperado);
                    let msg = `Esperado: S/ ${parseFloat(data.sesion.montoCierreEsperado).toFixed(2)}\nFísico: S/ ${parseFloat(data.sesion.montoCierreReal).toFixed(2)}`;
                    if (dif === 0) Swal.fire('Caja Cuadrada', msg, 'success');
                    else if (dif > 0) Swal.fire('Cierre con Sobrante', `${msg}\nSobrante: S/ ${dif.toFixed(2)}`, 'warning');
                    else Swal.fire('Cierre con Faltante', `${msg}\nFaltante: S/ ${Math.abs(dif).toFixed(2)}`, 'error');
                } else Swal.fire('Error', data.message, 'error');
            });
    });

    verificarEstadoCaja();
});