$(document).ready(function() {
    const API_URL = '/inventario/api';
    const modalIngreso = new bootstrap.Modal(document.getElementById('modalIngreso'));
    const modalSalida = new bootstrap.Modal(document.getElementById('modalSalida'));
    const modalKardex = new bootstrap.Modal(document.getElementById('modalKardex'));

    let dataTable = $('#tablaInventario').DataTable({
        ajax: { url: `${API_URL}/productos`, dataSrc: 'data' },
        columns: [
            { data: 'codigo', render: data => `<code>${data}</code>` },
            { data: 'nombre', className: 'fw-bold' },
            {
                data: 'stock',
                className: 'text-center align-middle',
                render: stock => {
                    let badgeClass = stock <= 5 ? 'bg-danger' : 'bg-info';
                    return `<span class="badge ${badgeClass} fs-6 px-3">${stock}</span>`;
                }
            },
            {
                data: null,
                className: 'text-center',
                render: row => `
                    <button class="btn btn-sm btn-success me-1" onclick="abrirModalIngreso('${row.id}', '${row.nombre}')">
                        <i class="bi bi-patch-plus me-1"></i> Registrar Ingreso
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="abrirModalSalida('${row.id}', '${row.nombre}', ${row.stock})">
                        <i class="bi bi-patch-minus me-1"></i> Registrar Salida
                    </button>
                `
            },
            {
                data: 'id',
                className: 'text-center',
                render: id => `
                    <button class="btn btn-sm btn-dark" onclick="abrirModalKardex('${id}')">
                        <i class="bi bi-eye-fill me-1"></i> Ver Kardex
                    </button>
                `
            }
        ],
        language: { url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json" }
    });

    window.abrirModalIngreso = function(idProd, nombreProd) {
        $('#formIngreso')[0].reset();
        $('#ingresoIdProd').val(idProd);
        $('#ingresoNombreProd').text(nombreProd);
        $('#ingresoVencimiento').addClass('d-none').prop('required', false);
        modalIngreso.show();
    };

    window.abrirModalSalida = function(idProd, nombreProd, stockActual) {
        $('#formSalida')[0].reset();
        $('#salidaIdProd').val(idProd);
        $('#salidaNombreProd').text(nombreProd);
        $('#salidaStockActual').text(stockActual);
        modalSalida.show();
    };

    $('#checkVencimiento').change(function() {
        if(this.checked) {
            $('#ingresoVencimiento').removeClass('d-none').prop('required', true);
        } else {
            $('#ingresoVencimiento').addClass('d-none').prop('required', false);
        }
    });

    // --- ENVIAR INGRESO (VERDE) ---
    $('#formIngreso').submit(e => {
        e.preventDefault();

        // Validación de fecha si el checkbox está activo
        if ($('#checkVencimiento').is(':checked') && !$('#ingresoVencimiento').val()) {
            Swal.fire('Atención', 'Seleccione la fecha de vencimiento.', 'warning');
            return;
        }

        const btn = $('#btnSubmitIngreso');
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Registrando...');

        const idProducto = $('#ingresoIdProd').val();
        const data = {
            tipoMovimiento: $('#ingresoTipo').val(), // Ahora toma el valor del select
            cantidad: parseInt($('#ingresoCantidad').val()),
            motivo: $('#ingresoMotivo').val(),
            proveedor: $('#ingresoProveedor').val(),
            numeroLote: $('#ingresoLote').val(),
            fechaVencimiento: $('#checkVencimiento').is(':checked') ? $('#ingresoVencimiento').val() : null
        };

        enviarMovimiento(idProducto, data, modalIngreso, btn, "Registrar Ingreso");
    });

    // --- ENVIAR SALIDA (ROJO) ---
    $('#formSalida').submit(e => {
        e.preventDefault();

        const btn = $('#btnSubmitSalida');
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Registrando...');

        const idProducto = $('#salidaIdProd').val();
        const data = {
            tipoMovimiento: $('#salidaTipo').val(),
            cantidad: parseInt($('#salidaCantidad').val()),
            motivo: $('#salidaMotivo').val()
        };
        enviarMovimiento(idProducto, data, modalSalida, btn, "Registrar Salida");
    });

    function enviarMovimiento(idProducto, data, modal, btnElement, originalText) {
        fetch(`${API_URL}/registrar?idProducto=${idProducto}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(r => r.json())
        .then(res => {
            if(res.success) {
                modal.hide();
                dataTable.ajax.reload();
                Swal.fire('Éxito', res.message, 'success');
            } else {
                Swal.fire('Atención', res.message, 'warning');
            }
        })
        .catch(() => Swal.fire('Error', 'Fallo de conexión con el servidor', 'error'))
        .finally(() => btnElement.prop('disabled', false).html(originalText));
    }

    // --- RENDERIZAR KARDEX ---
    window.abrirModalKardex = function(idProducto) {
        const tbody = $('#tablaKardex tbody');
        tbody.html('<tr><td colspan="5" class="text-center py-4"><span class="spinner-border text-primary"></span> Cargando Kardex...</td></tr>');
        modalKardex.show();

        fetch(`${API_URL}/kardex/${idProducto}`)
            .then(r => r.json())
            .then(res => {
                tbody.empty();
                if(res.success && res.data.length > 0) {
                    res.data.forEach(mov => {
                        let f = new Date(mov.fechaRegistro);
                        let fechaStr = `${f.toLocaleDateString('es-PE')} <br><small class="text-muted">${f.toLocaleTimeString('es-PE', {hour: '2-digit', minute:'2-digit'})}</small>`;

                        let cantClass = mov.cantidad > 0 ? 'text-success fw-bold' : 'text-danger fw-bold';
                        let cantSign = mov.cantidad > 0 ? `+${mov.cantidad}` : `${mov.cantidad}`;

                        tbody.append(`
                            <tr>
                                <td class="align-middle">${fechaStr}</td>
                                <td class="align-middle fw-bold small">${mov.tipoMovimiento}</td>
                                <td class="align-middle text-center ${cantClass}">${cantSign}</td>
                                <td class="align-middle small text-muted">${mov.motivo || '-'}</td>
                                <td class="align-middle small text-muted">${mov.responsable}</td>
                            </tr>
                        `);
                    });
                } else {
                    tbody.html('<tr><td colspan="5" class="text-center text-muted py-4">No hay movimientos registrados.</td></tr>');
                }
            });
    };
});