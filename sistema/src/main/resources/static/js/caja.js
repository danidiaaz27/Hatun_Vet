$(document).ready(function() {
    const API_URL = '/caja/api';
    const modalMovimiento = new bootstrap.Modal(document.getElementById('modalMovimiento'));
    const modalCierre = new bootstrap.Modal(document.getElementById('modalCierre'));
    let usuarioActivo = "Recepcionista"; // Aquí puedes vincularlo al usuario de tu sesión de Spring Security

    function verificarEstadoCaja() {
        fetch(`${API_URL}/estado`)
            .then(r => r.json())
            .then(res => {
                if (res.success) {
                    if (res.activo) {
                        $('#seccionCerrada').hide();
                        $('#seccionAbierta').show();
                        calcularMétricasYTabla(res.sesion, res.movimientos);
                    } else {
                        $('#seccionAbierta').hide();
                        $('#seccionCerrada').show();
                        $('#txtMontoApertura').val('0.00');
                    }
                }
            });
    }

    function calcularMétricasYTabla(sesion, movimientos) {
        let ingresos = 0;
        let egresos = 0;
        const tbody = $('#tbodyMovimientos').empty();

        if (movimientos.length === 0) {
            tbody.append('<tr><td colspan="5" class="text-center text-muted py-3">No hay movimientos registrados en esta sesión</td></tr>');
        } else {
            movimientos.forEach(m => {
                const montoNum = parseFloat(m.monto);
                const esIngreso = m.tipo === 'INGRESO';
                
                if (esIngreso) ingresos += montoNum;
                else egresos += montoNum;

                const badgeTipo = esIngreso ? '<span class="badge bg-success-subtle text-success">Ingreso</span>' : '<span class="badge bg-danger-subtle text-danger">Egreso</span>';
                const f = new Date(m.fechaMovimiento).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

                tbody.append(`
                    <tr>
                        <td><small class="text-muted">${f}</small></td>
                        <td>${badgeTipo}</td>
                        <td class="fw-bold ${esIngreso ? 'text-success' : 'text-danger'}">S/ ${montoNum.toFixed(2)}</td>
                        <td><small>${m.descripcion}</small></td>
                        <td><span class="badge bg-secondary">${m.medioPago}</span></td>
                    </tr>
                `);
            });
        }

        const apertura = parseFloat(sesion.montoApertura);
        const esperado = apertura + ingresos - egresos;

        $('#lblMontoApertura').text(`S/ ${apertura.toFixed(2)}`);
        $('#lblTotalIngresos').text(`S/ ${ingresos.toFixed(2)}`);
        $('#lblTotalEgresos').text(`S/ ${egresos.toFixed(2)}`);
        $('#lblMontoEsperado').text(`S/ ${esperado.toFixed(2)}`);
        $('#lblMontoEsperadoModal').text(`S/ ${esperado.toFixed(2)}`);
    }

    $('#btnAbrirCaja').click(function() {
        const btn = $(this);
        const monto = $('#txtMontoApertura').val();

        btn.prop('disabled', true).text('Abriendo...');

        fetch(`${API_URL}/abrir?montoApertura=${monto}&usuario=${usuarioActivo}`, { method: 'POST' })
            .then(r => r.json())
            .then(data => {
                btn.prop('disabled', false).text('Confirmar Apertura');
                if (data.success) {
                    Swal.fire('Éxito', data.message, 'success');
                    verificarEstadoCaja();
                } else {
                    Swal.fire('Atención', data.message, 'warning');
                }
            });
    });

    $('#formMovimiento').submit(function(e) {
        e.preventDefault();
        const btn = $('#btnGuardarMovimiento');
        btn.prop('disabled', true).text('Registrando...');

        const tipo = $('#tipoMovimiento').val();
        const monto = $('#montoManual').val();
        const descripcion = $('#descripcionManual').val();
        const medioPago = $('#medioPagoManual').val();

        fetch(`${API_URL}/movimiento-manual?tipo=${tipo}&monto=${monto}&descripcion=${encodeURIComponent(descripcion)}&medioPago=${medioPago}`, { method: 'POST' })
            .then(r => r.json())
            .then(data => {
                btn.prop('disabled', false).text('Registrar Movimiento');
                if (data.success) {
                    modalMovimiento.hide();
                    $('#formMovimiento')[0].reset();
                    verificarEstadoCaja();
                    Swal.fire('Éxito', data.message, 'success');
                } else {
                    Swal.fire('Error', data.message, 'error');
                }
            });
    });

    $('#formCierre').submit(function(e) {
        e.preventDefault();
        const btn = $('#btnConfirmarCierre');
        btn.prop('disabled', true).text('Procesando Arqueo...');

        const montoReal = $('#montoCierreReal').val();

        fetch(`${API_URL}/cerrar?montoCierreReal=${montoReal}&usuario=${usuarioActivo}`, { method: 'POST' })
            .then(r => r.json())
            .then(data => {
                btn.prop('disabled', false).text('Efectuar Cierre de Caja');
                if (data.success) {
                    modalCierre.hide();
                    $('#formCierre')[0].reset();
                    verificarEstadoCaja();
                    
                    const dif = parseFloat(data.sesion.montoCierreReal) - parseFloat(data.sesion.montoCierreEsperado);
                    let msgResumen = `Caja cerrada.\nEsperado: S/ ${parseFloat(data.sesion.montoCierreEsperado).toFixed(2)}\nFísico: S/ ${parseFloat(data.sesion.montoCierreReal).toFixed(2)}`;
                    
                    if (dif === 0) {
                        Swal.fire('Caja Cuadrada Perfecta', msgResumen, 'success');
                    } else if (dif > 0) {
                        Swal.fire('Cierre con Sobrante', `${msgResumen}\nSobrante: S/ ${dif.toFixed(2)}`, 'warning');
                    } else {
                        Swal.fire('Cierre con Faltante', `${msgResumen}\nFaltante: S/ ${Math.abs(dif).toFixed(2)}`, 'error');
                    }
                } else {
                    Swal.fire('Error', data.message, 'error');
                }
            });
    });

    verificarEstadoCaja();
});