function cargarCategorias() {
    fetch(`${API_BASE}/categorias`)
        .then(r => r.json())
        .then(res => {
            if (!res.success) return;

            const select = $('#id_categoria');
            select.find('option:not(:first)').remove();

            res.data
                .filter(c => c.estado)
                .forEach(c => {
                    select.append(`<option value="${c.id}">${c.nombre}</option>`);
                });
        });
}

function cargarProveedores() {
    fetch('/proveedores/api/listar')
        .then(r => r.json())
        .then(res => {
            if (!res.data) return;

            const select = $('#proveedor_id');
            select.find('option:not(:first)').remove();

            res.data
                .filter(p => p.estado)
                .forEach(p => {
                    select.append(`<option value="${p.id}">${p.nombre}</option>`);
                });
        });
}