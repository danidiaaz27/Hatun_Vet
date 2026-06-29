function iniciarHistorialClientes() {
    window.verHistorial = verHistorial;
}
function verHistorial(numDocumento, nombre) {
    $('#lblHistorialNombre').text(nombre);
    mostrarCargandoHistorial();
    modalHistorial.show();
    fetch(`${API_URL}/historial/${numDocumento}`)
        .then(r => r.json())
        .then(res => {
            if (res.success) renderHistorialCliente(res);
        });
}
function mostrarCargandoHistorial() {
    $('#tablaHistorialPetshop tbody').html(`
        <tr>
            <td colspan="4" class="text-center py-4">
                <span class="spinner-border text-primary"></span>
            </td>
        </tr>
    `);
    $('#tablaHistorialPeluqueria tbody').html(`
        <tr>
            <td colspan="5" class="text-center py-4">
                <span class="spinner-border text-primary"></span>
            </td>
        </tr>
    `);
}
function renderHistorialCliente(res) {
    renderHistorialPetshop(res.compras || []);
    renderHistorialPeluqueria(res.peluqueria || []);
}
function renderHistorialPetshop(compras) {
    const tbodyPet = $('#tablaHistorialPetshop tbody');
    tbodyPet.empty();

    if (compras.length === 0) {
        tbodyPet.html(`
            <tr>
                <td colspan="4" class="text-center text-muted py-3">
                    No hay compras registradas
                </td>
            </tr>
        `);
        return;
    }
    compras.forEach(v => {
        const f = new Date(v.fechaEmision).toLocaleString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        tbodyPet.append(`
            <tr>
                <td><small>${f}</small></td>
                <td>
                    <span class="badge bg-secondary">
                        ${v.serie || 'TICK'}-${v.correlativo || '000'}
                    </span>
                </td>
                <td class="fw-bold text-success">
                    S/ ${v.total.toFixed(2)}
                </td>
                <td>
                    <span class="badge ${v.estado === 'FACTURADO' ? 'bg-success' : 'bg-danger'}">
                        ${v.estado}
                    </span>
                </td>
            </tr>
        `);
    });
}
function renderHistorialPeluqueria(peluqueria) {
    const tbodyPel = $('#tablaHistorialPeluqueria tbody');
    tbodyPel.empty();
    if (peluqueria.length === 0) {
        tbodyPel.html(`
            <tr>
                <td colspan="5" class="text-center text-muted py-3">
                    No hay atenciones de peluquería registradas
                </td>
            </tr>
        `);
        return;
    }
    peluqueria.forEach(b => {
        const f = new Date(b.fechaServicio).toLocaleString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        tbodyPel.append(`
            <tr>
                <td><small>${f}</small></td>
                <td class="fw-bold">${b.nombreMascota}</td>
                <td>${b.tipoServicio}</td>
                <td class="text-primary fw-bold">S/ ${b.precio.toFixed(2)}</td>
                <td>
                    <span class="badge ${b.estado === 'TERMINADO' ? 'bg-success' : 'bg-info'}">
                        ${b.estado}
                    </span>
                </td>
            </tr>
        `);
    });
}