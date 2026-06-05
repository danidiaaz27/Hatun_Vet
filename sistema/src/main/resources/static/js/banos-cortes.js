$(document).ready(function() {
    const API_URL = '/banos-cortes/api';
    const MASCOTAS_API_URL = '/mascotas/api';
    const modalServicio = new bootstrap.Modal(document.getElementById('modalServicio'));

    const serviciosBase = ['Baño Estándar', 'Baño Medicado', 'Solo Corte', 'Baño y Corte', 'Corte de Uñas'];
    let modoNuevoServicio = false;
    let mascotaSeleccionada = null;

    function normalizarTexto(texto) {
        return (texto || '').toString().trim();
    }

    function formatDate(value) {
        if (!value) return '';
        return new Date(value).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    function formatDateTime(value) {
        if (!value) return '';
        return new Date(value).toLocaleString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function nombreMascotaFila(row) {
        if (row.mascota && row.mascota.nombre) return row.mascota.nombre;
        return row.nombreMascota || '—';
    }

    function especieMascotaFila(row) {
        if (row.mascota && row.mascota.especie) return row.mascota.especie;
        return row.especie || '';
    }

    function limpiarSeleccionMascota() {
        mascotaSeleccionada = null;
        $('#mascotaId').val('');
        $('#panelMascotaSeleccionada').addClass('d-none');
        $('#panelResultadosMascota').addClass('d-none').empty();
        $('#txtBuscarMascota').val('').prop('disabled', false);
        $('#btnBuscarMascota').prop('disabled', false);
    }

    function seleccionarMascota(mascota) {
        mascotaSeleccionada = mascota;
        $('#mascotaId').val(mascota.id);
        $('#panelResultadosMascota').addClass('d-none').empty();

        const inicial = (mascota.nombre || '?').charAt(0).toUpperCase();
        $('#lblMascotaInicial').text(inicial);
        $('#lblMascotaNombre').text(`${mascota.nombre || ''} (ID #${mascota.id})`);
        $('#lblMascotaDetalle').text(`${mascota.especie || 'Sin especie'} · ${mascota.raza || 'Sin raza'}`);

        const cliente = mascota.cliente;
        if (cliente) {
            $('#lblDuenoDetalle').html(
                `<i class="bi bi-person-badge me-1"></i>${cliente.nombreCompleto || 'Sin nombre'} · ${cliente.numeroDocumento || 'Sin documento'}`
            );
        } else {
            $('#lblDuenoDetalle').html('<span class="text-warning"><i class="bi bi-exclamation-triangle me-1"></i>Sin dueño vinculado en el padrón</span>');
        }

        const registro = mascota.fechaRegistro
            ? `Registrada: ${formatDateTime(mascota.fechaRegistro)}`
            : '';
        $('#lblFechaRegistroMascota').text(registro);

        $('#panelMascotaSeleccionada').removeClass('d-none');
        $('#txtBuscarMascota').prop('disabled', true);
        $('#btnBuscarMascota').prop('disabled', true);
    }

    function renderResultadosMascota(lista) {
        const panel = $('#panelResultadosMascota');
        panel.empty();

        if (!lista.length) {
            panel.append(
                '<div class="list-group-item text-muted small text-center py-3">No se encontraron mascotas activas</div>'
            );
            panel.removeClass('d-none');
            return;
        }

        lista.forEach(m => {
            const cliente = m.cliente;
            const dueno = cliente
                ? `${cliente.nombreCompleto || ''} · ${cliente.numeroDocumento || ''}`
                : 'Sin dueño vinculado';
            const registro = m.fechaRegistro ? formatDate(m.fechaRegistro) : '—';

            panel.append(`
                <button type="button" class="list-group-item list-group-item-action mascota-result-item" data-id="${m.id}">
                    <div class="d-flex align-items-center gap-3">
                        <div class="avatar-pill-sm">${(m.nombre || '?').charAt(0).toUpperCase()}</div>
                        <div class="text-start">
                            <div class="fw-bold">${m.nombre || ''} <span class="text-muted fw-normal">#${m.id}</span></div>
                            <small class="text-muted">${m.especie || 'Sin especie'} · ${m.raza || 'Sin raza'}</small>
                            <div class="small">${dueno}</div>
                            <div class="small text-muted">Registro: ${registro}</div>
                        </div>
                    </div>
                </button>
            `);
        });

        panel.removeClass('d-none');
    }

    function buscarMascotas() {
        const valor = normalizarTexto($('#txtBuscarMascota').val());
        if (!valor) {
            Swal.fire('Atención', 'Ingrese el ID o nombre de la mascota', 'warning');
            return;
        }

        const btn = $('#btnBuscarMascota');
        const icon = btn.html();
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span>');

        fetch(`${MASCOTAS_API_URL}/buscar/${encodeURIComponent(valor)}`)
            .then(r => r.json())
            .then(res => {
                const activas = (res.data || []).filter(m => (m.estado || 'ACTIVA').toUpperCase() === 'ACTIVA');
                renderResultadosMascota(activas);
                if (activas.length === 1) {
                    seleccionarMascota(activas[0]);
                }
            })
            .catch(() => Swal.fire('Error', 'No se pudo buscar en el padrón de mascotas', 'error'))
            .finally(() => btn.prop('disabled', false).html(icon));
    }

    let dataTable = $('#tablaServicios').DataTable({
        ajax: { url: `${API_URL}/listar`, dataSrc: 'data' },
        columns: [
            {
                data: 'fechaServicio',
                render: data => formatDateTime(data)
            },
            {
                data: null,
                render: row => {
                    const nombre = nombreMascotaFila(row);
                    const especie = especieMascotaFila(row);
                    const idMascota = row.mascota && row.mascota.id ? ` <span class="badge bg-light text-dark border">#${row.mascota.id}</span>` : '';
                    return `<strong>${nombre}</strong>${idMascota} <br><small class="text-muted">${especie}</small>`;
                }
            },
            {
                data: null,
                render: row => `<span>${row.nombreDueno}</span><br><small class="text-muted">Doc: ${row.dniDueno || '---'}</small>`
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

    $('#btnBuscarMascota').click(() => buscarMascotas());
    $('#txtBuscarMascota').on('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            buscarMascotas();
        }
    });

    $('#panelResultadosMascota').on('click', '.mascota-result-item', function() {
        const id = Number($(this).data('id'));
        fetch(`${MASCOTAS_API_URL}/${id}`)
            .then(r => r.json())
            .then(res => {
                if (res.success && res.data) {
                    seleccionarMascota(res.data);
                } else {
                    Swal.fire('Error', 'No se pudo cargar la mascota seleccionada', 'error');
                }
            })
            .catch(() => Swal.fire('Error', 'No se pudo cargar la mascota seleccionada', 'error'));
    });

    $('#btnLimpiarMascota').click(() => limpiarSeleccionMascota());

    $('#btnNuevoServicio').click(() => {
        $('#formServicio')[0].reset();
        limpiarSeleccionMascota();
        cargarTiposServicio();
        if (modoNuevoServicio) $('#btnAlternarTipo').click();
        $('#btnGuardarServicio').prop('disabled', false).html('Guardar Registro');
        modalServicio.show();
    });

    $('#formServicio').submit(e => {
        e.preventDefault();

        const mascotaId = normalizarTexto($('#mascotaId').val());
        if (!mascotaId) {
            Swal.fire('Atención', 'Debe seleccionar una mascota del padrón', 'warning');
            return;
        }

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

        const btnGuardar = $('#btnGuardarServicio');
        btnGuardar.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Guardando...');

        const data = {
            mascotaId: Number(mascotaId),
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
            if (res.success) {
                modalServicio.hide();
                dataTable.ajax.reload();
                Swal.fire('Éxito', res.message, 'success');
            } else {
                Swal.fire('Error', res.message, 'error');
                btnGuardar.prop('disabled', false).html('Guardar Registro');
            }
        })
        .catch(() => {
            Swal.fire('Error', 'No se pudo guardar el servicio', 'error');
            btnGuardar.prop('disabled', false).html('Guardar Registro');
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
                        if (res.success) dataTable.ajax.reload();
                        else Swal.fire('Error', res.message, 'error');
                    });
            }
        });
    };
});
