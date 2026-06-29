function cargarImagenes() {
    fetch(`${API_BASE}/imagenes`)
        .then(r => r.json())
        .then(res => {
            const tbody = $('#landingImagesBody');
            tbody.empty();

            if (!res.success || !res.data || res.data.length === 0) {
                tbody.append(`
                    <tr>
                        <td colspan="4" class="text-center text-muted py-4">
                            No hay imágenes
                        </td>
                    </tr>
                `);
                return;
            }

            res.data.forEach(img => renderFilaImagen(img, tbody));
        });
}

function renderFilaImagen(img, tbody) {
    tbody.append(`
        <tr>
            <td>
                <img src="/uploads/${img.imagen}"
                    style="width:44px;height:44px;object-fit:cover;border-radius:8px;">
            </td>
            <td style="font-size:13px;">${img.tipo}</td>
            <td>${renderEstadoImagen(img.estado)}</td>
            <td>
                <div class="action-group">
                    <button class="btn-action btn-action-edit action-edit-img"
                        data-id="${img.id}" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>

                    <button class="btn-action btn-action-delete action-delete-img"
                        data-id="${img.id}" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `);
}

function renderEstadoImagen(estado) {
    if (estado) {
        return `
            <span style="background:#e8f5ee;color:#1a6e40;border-radius:50px;padding:3px 10px;font-size:11px;font-weight:700;">
                Activo
            </span>`;
    }

    return `
        <span style="background:#f0f4fa;color:#8a9bc0;border-radius:50px;padding:3px 10px;font-size:11px;font-weight:700;">
            Inactivo
        </span>`;
}