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
            'PENDIENTE':    '<span class="badge-estado badge-pendiente">⏳ Pendiente</span>',
            'EN_PROCESO':   '<span class="badge-estado" style="background:#f3e5f5; color:#4a148c; border-radius:50px; padding:4px 13px; font-size:12px; font-weight:600; border:1px solid #e1bee7;">✂️ En Proceso</span>',
            'TERMINADO':    '<span class="badge-estado badge-terminado">✅ Terminado</span>',
            'PAGO_PARCIAL': '<span class="badge-estado" style="background:#e3f2fd; color:#0d47a1; border-radius:50px; padding:4px 13px; font-size:12px; font-weight:600; border:1px solid #90caf9;">💳 Pago Parcial</span>',
            'PAGADO':       '<span class="badge-estado" style="background:#e2f0d9; color:#385723; border-radius:50px; padding:4px 13px; font-size:12px; font-weight:600; border:1.5px solid #385723;">💰 PAGADO</span>',
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
            if (row.estado === 'PAGADO') {
                acciones = `
                    <div class="grooming-card-actions">
                        <button class="btn btn-outline-secondary" disabled>
                            <i class="bi bi-check2-all me-1"></i> Cobrado
                        </button>
                    </div>`;
            } else if (row.estado === 'TERMINADO') {
                acciones = `
                    <div class="grooming-card-actions">
                        <button class="btn btn-outline-primary w-100" style="border-color: var(--vet-blue); color: var(--vet-blue);" onclick="Swal.fire('En Caja', 'Este servicio ya está disponible en la lista de cobranza del Punto de Venta (POS).', 'info')">
                            <i class="bi bi-cash-coin me-1"></i> Enviar a Caja
                        </button>
                    </div>`;
            } else if (row.estado === 'EN_PROCESO') {
                const btnFinalizar = `
                    <button class="btn text-white btn-cambiar-estado w-100"
                        style="background:#1a6e40;"
                        data-id="${row.id}" data-estado="TERMINADO">
                        <i class="bi bi-check-circle me-1"></i> Finalizar
                    </button>`;
                acciones = `<div class="grooming-card-actions">${btnFinalizar}</div>`;
            } else { // PENDIENTE o PAGO_PARCIAL
                const btnIniciar = `
                    <button class="btn btn-outline-secondary btn-cambiar-estado" data-id="${row.id}" data-estado="EN_PROCESO">
                        <i class="bi bi-play-fill me-1"></i> Iniciar
                    </button>`;
                const btnFinalizar = `
                    <button class="btn text-white btn-cambiar-estado"
                        style="background:#1a6e40;"
                        data-id="${row.id}" data-estado="TERMINADO">
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

    $('#groomingGrid').on('click', '.btn-cambiar-estado', function () {
        const id = $(this).data('id');
        const nuevoEstado = $(this).data('estado');
        let label = '¿Cambiar estado?';
        let confirmText = 'Sí, cambiar';

        if (nuevoEstado === 'EN_PROCESO') {
            label = '¿Iniciar el servicio de grooming?';
            confirmText = 'Sí, iniciar';
        } else if (nuevoEstado === 'TERMINADO') {
            label = '¿Finalizar servicio de grooming?';
            confirmText = 'Sí, finalizar';
        }

        Swal.fire({
            title: label,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1a6e40',
            cancelButtonColor: '#6b7a99',
            confirmButtonText: confirmText,
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
    let serviciosCatalogo = [];

    function cargarTiposServicio() {
        fetch('/productos/api/servicios-activos')
            .then(r => r.json())
            .then(res => {
                const select = $('#tipoServicioSelect');
                select.empty();
                select.append('<option value="">-- Seleccione un Servicio --</option>');
                serviciosCatalogo = res.data || [];
                serviciosCatalogo.forEach(s => {
                    select.append(`<option value="${s.id}" data-precio="${s.precio}">${s.nombre} (S/ ${parseFloat(s.precio).toFixed(2)})</option>`);
                });
            });
    }

    $('#tipoServicioSelect').change(function () {
        const option = $(this).find('option:selected');
        const price = parseFloat(option.data('precio')) || 0;
        $('#precio').val(price > 0 ? price.toFixed(2) : '');
    });

    // ──────────────────────────────────────────
    // ABRIR MODAL
    // ──────────────────────────────────────────
    $('#btnNuevoServicio').click(() => {
        $('#formServicio')[0].reset();
        limpiarSeleccionMascota();
        cargarTiposServicio();
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
        const productoId = $('#tipoServicioSelect').val();
        if (!productoId) { Swal.fire('Atención', 'Debes seleccionar un tipo de servicio del catálogo', 'warning'); return; }
        const precio = parseFloat($('#precio').val());
        if (precio <= 0) { Swal.fire('Atención', 'El precio debe ser mayor a cero.', 'warning'); return; }

        const btnGuardar = $('#btnGuardarServicio');
        btnGuardar.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Guardando...');

        fetch(`${API_URL}/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mascotaId: Number(mascotaId),
                productoId: productoId,
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