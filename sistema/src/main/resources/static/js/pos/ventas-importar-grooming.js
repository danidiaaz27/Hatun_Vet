function abrirModalGroomingCobro() {
    fetch('/banos-cortes/api/por-cobrar')
        .then(r => r.json())
        .then(servicios => renderGroomingPorCobrar(servicios));
}

function renderGroomingPorCobrar(servicios) {
    const lista = $('#listaGroomingPorCobrar');
    lista.empty();

    if (servicios.length === 0) {
        lista.html('<div class="text-center text-muted p-4">No hay servicios de grooming finalizados pendientes de cobro.</div>');
        modalGroomingCobro.show();
        return;
    }

    servicios.forEach(s => lista.append(crearCardGroomingCobro(s)));
    modalGroomingCobro.show();
}

function crearCardGroomingCobro(s) {
    const card = $(`
        <div class="card-custom mb-2 p-3" style="cursor:pointer;background:#fff;border-radius:12px;border:1.5px solid rgba(10,61,145,.10);">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <div class="fw-bold">✂️ ${s.tipoServicio} (${s.mascota})
                        <span class="badge" style="background:#e8f5ee;color:#1a6e40;border-radius:50px;padding:3px 10px;font-size:11px;">
                            S/ ${parseFloat(s.precio).toFixed(2)}
                        </span>
                    </div>
                    <small class="text-muted">${s.clienteNombre} · ${s.clienteDocumento}</small>
                </div>
                <i class="bi bi-box-arrow-in-right fs-4 text-muted"></i>
            </div>
        </div>
    `);

    card.click(() => {
        importarGroomingDirecto(s);
        modalGroomingCobro.hide();
    });

    return card;
}

function importarGroomingDirecto(groomingData) {
    importBanoCorteId = groomingData.id;
    const isRuc = groomingData.clienteDocumento.length === 11;

    $('#tipoDoc').val(isRuc ? '6' : '1').trigger('change');
    $('#numDoc').val(groomingData.clienteDocumento);
    $('#nombreCliente').val(groomingData.clienteNombre);

    agregarGroomingAlCarrito(groomingData);
    renderizarCarrito();

    Swal.fire({
        icon: 'success',
        title: 'Servicio de Grooming Importado',
        text: `Cargo de ${groomingData.mascota} transferido al carrito.`,
        timer: 2000,
        showConfirmButton: false
    });
}

function agregarGroomingAlCarrito(groomingData) {
    carrito.push({
        id: groomingData.productoId || `GROOMING-${groomingData.id}`,
        codigo: groomingData.productoCodigo || 'GR-001',
        nombre: groomingData.tipoServicio,
        precio: parseFloat(groomingData.precio),
        cantidad: 1,
        stock: 9999,
        imagen: null,
        esServicio: true,
        isGroomingImported: true,
        banoCorteId: groomingData.id
    });
}