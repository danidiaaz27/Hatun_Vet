function obtenerColumnasMascotas() {
    return [
        { data: null, render: renderMascotaPrincipal },
        { data: null, render: renderEspecieRaza },
        { data: null, render: renderDuenoMascota },
        { data: null, render: renderContactoDueno },
        { data: 'estado', render: renderEstadoMascota },
        { data: 'fechaRegistro', render: value =>
            `<small class="text-muted">${formatDate(value)}</small>`
        },
        {
            data: 'id',
            className: 'text-center',
            render: renderAccionesMascota
        }
    ];
}

function renderMascotaPrincipal(row) {
    return `
        <div class="d-flex align-items-center gap-3">
            <div class="avatar-pill">
                ${(row.nombre || '?').charAt(0).toUpperCase()}
            </div>
            <div>
                <div class="fw-bold">${row.nombre || ''}</div>
                <small class="text-muted">ID #${row.id}</small>
            </div>
        </div>
    `;
}

function renderEspecieRaza(row) {
    const especie = row.especie || 'Sin especie';
    const raza = row.raza || 'Sin raza';

    return `
        <div>
            <span class="badge bg-light text-dark border">${especie}</span>
            <div class="small text-muted mt-1">${raza}</div>
        </div>
    `;
}

function renderDuenoMascota(row) {
    const cliente = row.cliente;

    if (!cliente) {
        return '<span class="text-muted small">Sin dueño vinculado</span>';
    }

    return `
        <div>
            <div class="fw-bold">${cliente.nombreCompleto || ''}</div>
            <small class="text-muted">${cliente.numeroDocumento || ''}</small>
        </div>
    `;
}

function renderContactoDueno(row) {
    const cliente = row.cliente;

    if (!cliente) {
        return '<span class="text-muted small">Sin contacto</span>';
    }

    let html = '';

    if (cliente.telefono) {
        html += `<div class="small">
            <i class="bi bi-whatsapp text-success me-1"></i>${cliente.telefono}
        </div>`;
    }

    if (cliente.correo) {
        html += `<div class="small">
            <i class="bi bi-envelope me-1"></i>${cliente.correo}
        </div>`;
    }

    return html || '<span class="text-muted small">Sin contacto</span>';
}

function renderEstadoMascota(estado) {
    const value = (estado || 'ACTIVA').toUpperCase();
    const cls = value === 'ACTIVA' ? 'bg-success' : 'bg-secondary';

    return `<span class="badge ${cls}">${value}</span>`;
}

function renderAccionesMascota(id) {
    return `
        <div class="btn-group btn-group-sm">
            <button type="button"
                class="btn btn-outline-primary btn-editar"
                data-id="${id}" title="Editar">
                <i class="bi bi-pencil-fill"></i>
            </button>

            <button type="button"
                class="btn btn-outline-danger btn-eliminar"
                data-id="${id}" title="Eliminar">
                <i class="bi bi-trash3-fill"></i>
            </button>
        </div>
    `;
}

function renderClientesSelect() {
    const select = $('#clienteId');

    select.empty();
    select.append('<option value="">Sin seleccionar</option>');

    clientesCache.forEach(cliente => {
        const label =
            `${cliente.nombreCompleto || ''} - ${cliente.numeroDocumento || ''}`
                .trim();

        select.append(`<option value="${cliente.id}">${label}</option>`);
    });
}

function renderEspeciesFiltro() {
    const select = $('#filtroEspecie');

    const especies = [
        ...new Set(
            mascotasCache
                .map(m => normalizarTexto(m.especie))
                .filter(Boolean)
        )
    ].sort();

    select.find('option:not(:first)').remove();

    especies.forEach(especie => {
        select.append(`<option value="${especie}">${especie}</option>`);
    });
}