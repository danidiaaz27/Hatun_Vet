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
    return row.mascota && row.mascota.nombre
        ? row.mascota.nombre
        : row.nombreMascota || '—';
}

function especieMascotaFila(row) {
    return row.mascota && row.mascota.especie
        ? row.mascota.especie
        : row.especie || '';
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
        PENDIENTE:
            '<span class="badge-estado badge-pendiente">⏳ Pendiente</span>',
        EN_PROCESO:
            '<span class="badge-estado" style="background:#f3e5f5; color:#4a148c; border-radius:50px; padding:4px 13px; font-size:12px; font-weight:600; border:1px solid #e1bee7;">✂️ En Proceso</span>',
        TERMINADO:
            '<span class="badge-estado badge-terminado">✅ Terminado</span>',
        PAGO_PARCIAL:
            '<span class="badge-estado" style="background:#e3f2fd; color:#0d47a1; border-radius:50px; padding:4px 13px; font-size:12px; font-weight:600; border:1px solid #90caf9;">💳 Pago Parcial</span>',
        PAGADO:
            '<span class="badge-estado" style="background:#e2f0d9; color:#385723; border-radius:50px; padding:4px 13px; font-size:12px; font-weight:600; border:1.5px solid #385723;">💰 PAGADO</span>'
    };

    return mapa[estado] ||
        `<span class="badge-estado badge-pendiente">${estado}</span>`;
}

function colorEspecie(especie) {
    const e = (especie || '').toLowerCase();

    if (e.includes('gato')) return '#e8f4fd';
    if (e.includes('perro')) return '#fdf6e8';

    return '#f0f4fa';
}