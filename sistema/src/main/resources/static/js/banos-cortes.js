$(document).ready(function() {
    const API_URL = '/banos-cortes/api';
    const modalServicio = new bootstrap.Modal(document.getElementById('modalServicio'));

    const serviciosBase = ['Baño Estándar', 'Baño Medicado', 'Solo Corte', 'Baño y Corte', 'Corte de Uñas'];
    let modoNuevoServicio = false;

    let dataTable = $('#tablaServicios').DataTable({
        ajax: { url: `${API_URL}/listar`, dataSrc: 'data' },
        columns: [
            {
                data: 'fechaServicio',
                render: data => new Date(data).toLocaleString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
            },
            {
                data: null,
                render: row => `<strong>${row.nombreMascota}</strong> <br><small class="text-muted">${row.especie}</small>`
            },
            {
                data: null,
                render: row => `<span>${row.nombreDueno}</span><br><small class="text-muted">DNI: ${row.dniDueno || '---'}</small>`
            },
            { data: 'tipoServicio' },
            {
                data: 'precio',
                className: 'text-end fw-bold text-primary',
                render: data => `S/ ${parseFloat(data).toFixed(2)}`
            },
            {
                data: 'estado',
                render: data => {
                    let color = data === 'PENDIENTE' ? 'bg-warning text-dark' : (data === 'TERMINADO' ? 'bg-success' : 'bg-info');
                    return `<span class="badge ${color}">${data}</span>`;
                }
            },
            {
                data: null,
                render: row => {
                    // VALIDACIÓN VISUAL: Si ya está pagado, no mostramos botones de acción
                    if (row.estado === 'PAGADO') {
                        return `<span class="text-muted small"><i class="bi bi-check2-all"></i> Finalizado</span>`;
                    }

                    let btnTerminado = row.estado === 'PENDIENTE'
                        ? `<button class="btn btn-outline-success" onclick="cambiarEstado(${row.id}, 'TERMINADO')" title="Terminar"><i class="bi bi-check-circle"></i></button>`
                        : '';

                    return `
                    <div class="btn-group btn-group-sm">
                        ${btnTerminado}
                        <button class="btn btn-outline-info" onclick="cambiarEstado(${row.id}, 'PAGADO')" title="Marcar como Pagado"><i class="bi bi-cash"></i></button>
                    </div>`;
                }
            }
        ],
        language: { url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json" },
        order: [[0, 'desc']]
    });

    function cargarTiposServicio() {
        fetch(`${API_URL}/tipos-servicio`)
            .then(r => r.json())
            .then(tiposDB => {
                const select = $('#tipoServicioSelect');
                select.empty();
                let tiposFinales = [...new Set([...serviciosBase, ...tiposDB])];
                tiposFinales.forEach(t => select.append(`<option value="${t}">${t}</option>`));
            });
    }

    $('#btnAlternarTipo').click(function() {
        modoNuevoServicio = !modoNuevoServicio;
        if (modoNuevoServicio) {
            $('#tipoServicioSelect').addClass('d-none');
            $('#tipoServicioInput').removeClass('d-none').focus();
            $(this).html('<i class="bi bi-list"></i> Ver Lista').removeClass('btn-outline-secondary').addClass('btn-outline-primary');
        } else {
            $('#tipoServicioSelect').removeClass('d-none');
            $('#tipoServicioInput').addClass('d-none').val('');
            $(this).html('<i class="bi bi-plus-lg"></i> Nuevo').removeClass('btn-outline-primary').addClass('btn-outline-secondary');
        }
    });

    $('#dniDueno').on('input', function() { this.value = this.value.replace(/[^0-9]/g, ''); });

    $('#btnBuscarDni').click(function() {
        const dni = $('#dniDueno').val().trim();
        if (dni.length !== 8) {
            Swal.fire('Atención', 'El DNI debe tener 8 dígitos', 'warning');
            return;
        }

        const btn = $(this);
        const icon = btn.html();
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span>');

        fetch(`/ventas/api/consultar-cliente?tipoDoc=1&numero=${dni}`)
            .then(r => r.json())
            .then(res => {
                const info = res.datos || res.data;
                if (res.success && info) {
                    let nombre = info.nombre_completo || `${info.nombres || ''} ${info.ape_paterno || ''} ${info.ape_materno || ''}`.trim();
                    $('#nombreDueno').val(nombre);
                } else {
                    Swal.fire('No encontrado', 'No se hallaron datos en RENIEC', 'info');
                }
            })
            .catch(() => Swal.fire('Error', 'Fallo al conectar con la API', 'error'))
            .finally(() => btn.prop('disabled', false).html(icon));
    });

    $('#btnNuevoServicio').click(() => {
        $('#formServicio')[0].reset();
        cargarTiposServicio();
        if(modoNuevoServicio) $('#btnAlternarTipo').click();

        // Habilitar el botón de guardado si estaba bloqueado
        $('#btnGuardarServicio').prop('disabled', false).html('Guardar Registro');
        modalServicio.show();
    });

    $('#formServicio').submit(e => {
        e.preventDefault();

        let tipoElegido = modoNuevoServicio ? $('#tipoServicioInput').val().trim() : $('#tipoServicioSelect').val();
        if (!tipoElegido) {
            Swal.fire('Atención', 'Debes ingresar un tipo de servicio', 'warning');
            return;
        }

        const precio = parseFloat($('#precio').val());
        if (precio <= 0) {
            Swal.fire('Atención', 'El precio debe ser mayor a cero.', 'warning');
            return;
        }

        // VALIDACIÓN ANTI-DOBLE CLIC
        const btnGuardar = $('#btnGuardarServicio');
        btnGuardar.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Guardando...');

        const data = {
            nombreMascota: $('#nombreMascota').val(),
            dniDueno: $('#dniDueno').val(),
            nombreDueno: $('#nombreDueno').val(),
            especie: $('#especie').val(),
            tipoServicio: tipoElegido,
            detallesExtra: $('#detallesExtra').val(),
            precio: precio
        };

        fetch(`${API_URL}/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(r => r.json())
        .then(res => {
            if(res.success) {
                modalServicio.hide();
                dataTable.ajax.reload();
                Swal.fire('Éxito', res.message, 'success');
            } else {
                Swal.fire('Error', res.message, 'error');
                btnGuardar.prop('disabled', false).html('Guardar Registro');
            }
        });
    });

    window.cambiarEstado = function(id, nuevoEstado) {
        Swal.fire({
            title: `¿Marcar como ${nuevoEstado}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, continuar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${API_URL}/cambiar-estado/${id}?nuevoEstado=${nuevoEstado}`, { method: 'POST' })
                    .then(r => r.json())
                    .then(res => {
                        if(res.success) dataTable.ajax.reload();
                        else Swal.fire('Error', res.message, 'error');
                    });
            }
        });
    };
});