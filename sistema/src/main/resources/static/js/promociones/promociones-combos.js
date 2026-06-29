function cargarCombos() {
    cargarProductosPromo();
    cargarCategoriasPromo();
}

function cargarProductosPromo() {
    fetch('/productos/api/listar')
        .then(r => r.json())
        .then(res => {
            if (!res.data) return;

            res.data.forEach(p => {
                const opt = `
                    <option value="${p.id}">
                        ${p.nombre} (S/ ${parseFloat(p.precio).toFixed(2)})
                    </option>`;

                $('#productoId').append(opt);
                $('#productoRegaloId').append(opt);
            });
        });
}

function cargarCategoriasPromo() {
    fetch('/categorias/api/listar')
        .then(r => r.json())
        .then(res => {
            if (!res.data) return;

            res.data.forEach(c => {
                $('#categoriaId').append(`
                    <option value="${c.id}">
                        ${c.nombre}
                    </option>
                `);
            });
        });
}