function cargarPerfiles() {
    fetch(`${API_BASE}/perfiles`)
        .then(r => r.json())
        .then(res => {
            if (!res.success) return;

            const select = $('#id_perfil');
            select.find('option:not(:first)').remove();

            res.data.forEach(perfil => {
                select.append(`
                    <option value="${perfil.id}">
                        ${perfil.nombre}
                    </option>
                `);
            });
        });
}