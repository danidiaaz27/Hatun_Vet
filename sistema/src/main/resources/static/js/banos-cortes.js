$(document).ready(function () {
    const API_URL = '/banos-cortes/api';
    const MASCOTAS_API_URL = '/mascotas/api';
    const modalServicio = new bootstrap.Modal(document.getElementById('modalServicio'));

    const serviciosBase = ['Baño Estándar', 'Baño Medicado', 'Solo Corte', 'Baño y Corte', 'Corte de Uñas'];
    let modoNuevoServicio = false;
    let mascotaSeleccionada = null;

    // Paginación y datos
    let todosLosServicios = [];
    let serviciosFiltrados = [];
    let paginaActual = 1;
    const POR_PAGINA = 6;

    // ──────────────────────────────────────────
    // UTILIDADES
    // ──────────────────────────────────────────
    function normalizarTexto(texto) {
        return (texto || '').toString().trim();
    }

    function formatDate(value) {
        if (!value) return '';
        return new Date(value).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    function formatDateTime(value) {
        if (!value) return '';
        return new Date(value).toLocaleString('es-PE', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    function nombreMascotaFila(row) {
        return (row.mascota && row.mascota.nombre) ? row.mascota.nombre : (row.nombreMascota || '—');
    }

    function especieMascotaFila(row) {
        return (row.mascota && row.mascota.especie) ? row.mascota.especie : (row.especie || '');
    }

    function iconoEspecie(especie) {
        const e = (especie || '').toLowerCase();
        if (e.includes('gato') || e.includes('felino')) return '🐱';
        if (e.includes('perro') || e.includes('canino')) return '🐶';
        if (e.includes('conejo')) return '🐰';
        if (e.includes('ave') || e.includes('loro')) return '🦜';
        return '🐾';
    }

    function badgeEstado(estado) {
        const mapa = {
            'PENDIENTE': '<span class="badge-estado badge-pendiente">⏳ Pendiente</span>',
            'TERMINADO': '<span class="badge-estado badge-terminado">✅ Terminado</span>',
            'PAGADO':    '<span class="badge-estado badge-pagado">💰 PAGADO</span>',
        };
        return mapa[estado] || `<span class="badge-estado badge-pendiente">${estado}</span>`;
    }

    function colorEspecie(especie) {
        const e = (especie || '').toLowerCase();
        if (e.includes('gato')) return '#e8f4fd';
        if (e.includes('perro')) return '#fdf6e8';
        return '#f0f4fa';
    }

    // ──────────────────────────────────────────
    // RENDER CARDS
    // ──────────────────────────────────────────
    function renderCards() {
        const grid = $('#groomingGrid');
        grid.empty();

        const filtro = $('#filtroEstado').val();
        serviciosFiltrados = filtro
            ? todosLosServicios.filter(s => s.estado === filtro)
            : [...todosLosServicios];

        const total = serviciosFiltrados.length;
        const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));
        if (paginaActual > totalPaginas) paginaActual = totalPaginas;

        const inicio = (paginaActual - 1) * POR_PAGINA;
        const pagina = serviciosFiltrados.slice(inicio, inicio + POR_PAGINA);

        // Contador
        const fin = Math.min(inicio + POR_PAGINA, total);
        $('#lblConteo').text(total > 0 ? `Mostrando ${inicio + 1} a ${fin} de ${total} registros` : 'Sin registros');
        $('#btnPagActual').text(paginaActual);
        $('#btnPrev').prop('disabled', paginaActual <= 1);
        $('#btnNext').prop('disabled', paginaActual >= totalPaginas);

        if (pagina.length === 0) {
            grid.append(`
                <div class="grooming-empty">
                    <i class="bi bi-scissors"></i>
                    No hay servicios registrados
                </div>
            `);
            return;
        }

        pagina.forEach(row => {
            const nombre = nombreMascotaFila(row);
            const especie = especieMascotaFila(row);
            const icono = iconoEspecie(especie);
            const avatarBg = colorEspecie(especie);
            const esPagado = row.estado === 'PAGADO';

            let acciones = '';
            if (esPagado) {
                acciones = `
                    <div class="grooming-card-actions">
                        <button class="btn btn-outline-secondary" disabled>
                            <i class="bi bi-check2-all me-1"></i> Finalizado
                        </button>
                    </div>`;
            } else {
                const btnIniciar = row.estado === 'PENDIENTE'
                    ? `<button class="btn btn-outline-secondary btn-cambiar-estado" data-id="${row.id}" data-estado="TERMINADO">
                           <i class="bi bi-play-fill me-1"></i> Iniciar
                       </button>`
                    : '';
                const btnFinalizar = `
                    <button class="btn text-white btn-cambiar-estado"
                        style="background:#1a6e40;"
                        data-id="${row.id}" data-estado="PAGADO">
                        <i class="bi bi-check-circle me-1"></i> Finalizar
                    </button>`;
                acciones = `<div class="grooming-card-actions">${btnIniciar}${btnFinalizar}</div>`;
            }

            grid.append(`
                <div class="grooming-card">
                    <div class="grooming-card-header">
                        <div class="mascota-avatar" style="background:${avatarBg};">${icono}</div>
                        <div class="mascota-info">
                            <div class="mascota-nombre">${nombre}</div>
                            <div class="mascota-especie" style="color:${esPagado ? '#b45309' : '#1a6e40'};">${especie}</div>
                        </div>
                        <div class="d-flex flex-column align-items-end gap-1">
                            <span class="grooming-fecha">${formatDateTime(row.fechaServicio)}</span>
                            ${badgeEstado(row.estado)}
                        </div>
                    </div>
                    <div class="grooming-info-row">
                        <span><i class="bi bi-person-badge"></i> Dueño: <strong>${row.nombreDueno || '—'}</strong></span>
                        <span><i class="bi bi-card-text"></i> Doc: ${row.dniDueno || '—'}</span>
                        <span><i class="bi bi-scissors"></i> Servicio: ${row.tipoServicio || '—'}</span>
                    </div>
                    ${acciones}
                </div>
            `);
        });
    }

    // ──────────────────────────────────────────
    // CARGAR DATOS
    // ──────────────────────────────────────────
    function cargarServicios() {
        fetch(`${API_URL}/listar`)
            .then(r => r.json())
            .then(res => {
                todosLosServicios = (res.data || []).sort((a, b) =>
                    new Date(b.fechaServicio) - new Date(a.fechaServicio)
                );
                paginaActual = 1;
                renderCards();
            })
            .catch(() => {
                $('#groomingGrid').html(`
                    <div class="grooming-empty">
                        <i class="bi bi-exclamation-triangle text-danger"></i>
                        Error al cargar los servicios
                    </div>`);
            });
    }

    cargarServicios();

    // ──────────────────────────────────────────
    // PAGINACIÓN Y FILTRO
    // ──────────────────────────────────────────
    $('#btnPrev').click(() => { if (paginaActual > 1) { paginaActual--; renderCards(); } });
    $('#btnNext').click(() => { paginaActual++; renderCards(); });
    $('#filtroEstado').on('change', () => { paginaActual = 1; renderCards(); });

    // ──────────────────────────────────────────
    // CAMBIAR ESTADO (delegado en grid)
    // ──────────────────────────────────────────
    $('#groomingGrid').on('click', '.btn-cambiar-estado', function () {
        const id = $(this).data('id');
        const nuevoEstado = $(this).data('estado');
        const label = nuevoEstado === 'PAGADO' ? 'Finalizar y marcar como Pagado' : 'Marcar como Terminado';

        Swal.fire({
            title: label,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1a6e40',
            cancelButtonColor: '#6b7a99',
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        }).then(result => {
            if (result.isConfirmed) {
                fetch(`${API_URL}/cambiar-estado/${id}?nuevoEstado=${nuevoEstado}`, { method: 'POST' })
                    .then(r => r.json())
                    .then(res => {
                        if (res.success) cargarServicios();
                        else Swal.fire('Error', res.message, 'error');
                    });
            }
        });
    });

    // ──────────────────────────────────────────
    // MODAL — BÚSQUEDA DE MASCOTAS
    // ──────────────────────────────────────────
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
                `<i class="bi bi-person-badge me-1"></i>${cliente.nombreCompleto || 'Sin nombre'} · ${cliente.numeroDocumento || 'Sin doc'}`
            );
        } else {
            $('#lblDuenoDetalle').html('<span class="text-warning"><i class="bi bi-exclamation-triangle me-1"></i>Sin dueño vinculado</span>');
        }
        $('#lblFechaRegistroMascota').text(mascota.fechaRegistro ? `Registrada: ${formatDateTime(mascota.fechaRegistro)}` : '');
        $('#panelMascotaSeleccionada').removeClass('d-none');
        $('#txtBuscarMascota').prop('disabled', true);
        $('#btnBuscarMascota').prop('disabled', true);
    }

    function renderResultadosMascota(lista) {
        const panel = $('#panelResultadosMascota');
        panel.empty();
        if (!lista.length) {
            panel.append('<div class="list-group-item text-muted small text-center py-3">No se encontraron mascotas activas</div>');
            panel.removeClass('d-none');
            return;
        }
        lista.forEach(m => {
            const cliente = m.cliente;
            const dueno = cliente ? `${cliente.nombreCompleto || ''} · ${cliente.numeroDocumento || ''}` : 'Sin dueño vinculado';
            panel.append(`
                <button type="button" class="list-group-item list-group-item-action mascota-result-item" data-id="${m.id}">
                    <div class="d-flex align-items-center gap-3">
                        <div class="avatar-pill-sm">${(m.nombre || '?').charAt(0).toUpperCase()}</div>
                        <div class="text-start">
                            <div class="fw-bold">${m.nombre || ''} <span class="text-muted fw-normal">#${m.id}</span></div>
                            <small class="text-muted">${m.especie || 'Sin especie'} · ${m.raza || 'Sin raza'}</small>
                            <div class="small">${dueno}</div>
                        </div>
                    </div>
                </button>
            `);
        });
        panel.removeClass('d-none');
    }

    function buscarMascotas() {
        const valor = normalizarTexto($('#txtBuscarMascota').val());
        if (!valor) { Swal.fire('Atención', 'Ingrese el ID o nombre de la mascota', 'warning'); return; }
        const btn = $('#btnBuscarMascota');
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span>');
        fetch(`${MASCOTAS_API_URL}/buscar/${encodeURIComponent(valor)}`)
            .then(r => r.json())
            .then(res => {
                const activas = (res.data || []).filter(m => (m.estado || 'ACTIVA').toUpperCase() === 'ACTIVA');
                renderResultadosMascota(activas);
                if (activas.length === 1) seleccionarMascota(activas[0]);
            })
            .catch(() => Swal.fire('Error', 'No se pudo buscar en el padrón', 'error'))
            .finally(() => btn.prop('disabled', false).html('Buscar'));
    }

    $('#btnBuscarMascota').click(() => buscarMascotas());
    $('#txtBuscarMascota').on('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); buscarMascotas(); } });
    $('#panelResultadosMascota').on('click', '.mascota-result-item', function () {
        const id = Number($(this).data('id'));
        fetch(`${MASCOTAS_API_URL}/${id}`)
            .then(r => r.json())
            .then(res => { if (res.success && res.data) seleccionarMascota(res.data); })
            .catch(() => Swal.fire('Error', 'No se pudo cargar la mascota', 'error'));
    });
    $('#btnLimpiarMascota').click(() => limpiarSeleccionMascota());

    // ──────────────────────────────────────────
    // MODAL — TIPOS DE SERVICIO
    // ──────────────────────────────────────────
    function cargarTiposServicio() {
        fetch(`${API_URL}/tipos-servicio`)
            .then(r => r.json())
            .then(tiposDB => {
                const select = $('#tipoServicioSelect');
                select.empty();
                const tiposFinales = [...new Set([...serviciosBase, ...tiposDB])];
                tiposFinales.forEach(t => select.append(`<option value="${t}">${t}</option>`));
            });
    }

    $('#btnAlternarTipo').click(function () {
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

    // ──────────────────────────────────────────
    // ABRIR MODAL
    // ──────────────────────────────────────────
    $('#btnNuevoServicio').click(() => {
        $('#formServicio')[0].reset();
        limpiarSeleccionMascota();
        cargarTiposServicio();
        if (modoNuevoServicio) $('#btnAlternarTipo').click();
        $('#btnGuardarServicio').prop('disabled', false).html('Guardar Registro');
        modalServicio.show();
    });

    // ──────────────────────────────────────────
    // GUARDAR
    // ──────────────────────────────────────────
    $('#formServicio').submit(e => {
        e.preventDefault();
        const mascotaId = normalizarTexto($('#mascotaId').val());
        if (!mascotaId) { Swal.fire('Atención', 'Debe seleccionar una mascota del padrón', 'warning'); return; }
        const tipoElegido = modoNuevoServicio ? $('#tipoServicioInput').val().trim() : $('#tipoServicioSelect').val();
        if (!tipoElegido) { Swal.fire('Atención', 'Debes ingresar un tipo de servicio', 'warning'); return; }
        const precio = parseFloat($('#precio').val());
        if (precio <= 0) { Swal.fire('Atención', 'El precio debe ser mayor a cero.', 'warning'); return; }

        const btnGuardar = $('#btnGuardarServicio');
        btnGuardar.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Guardando...');

        fetch(`${API_URL}/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mascotaId: Number(mascotaId),
                tipoServicio: tipoElegido,
                detallesExtra: $('#detallesExtra').val(),
                precio: precio
            })
        })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                modalServicio.hide();
                cargarServicios();
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
});