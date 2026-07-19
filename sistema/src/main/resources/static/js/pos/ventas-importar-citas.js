function abrirModalCitasCobro() {
    fetch('/api/citas/por-cobrar')
        .then(r => r.json())
        .then(citas => renderCitasPorCobrar(citas));
}

function renderCitasPorCobrar(citas) {
    const lista = $('#listaCitasPorCobrar');
    lista.empty();

    if (citas.length === 0) {
        lista.html('<div class="text-center text-muted p-4">No hay citas finalizadas pendientes de cobro.</div>');
        modalCitasCobro.show();
        return;
    }

    citas.forEach(c => lista.append(crearCardCitaCobro(c)));
    modalCitasCobro.show();
}

function crearCardCitaCobro(c) {
    const card = $(`
        <div class="card-custom mb-2 p-3" style="cursor:pointer;background:#fff;border-radius:12px;border:1.5px solid rgba(10,61,145,.10);">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <div class="fw-bold">🐾 ${c.mascota}
                        <span class="badge" style="background:#fce8e8;color:#b71c1c;border-radius:50px;padding:3px 10px;font-size:11px;">
                            S/ ${c.total.toFixed(2)}
                        </span>
                    </div>
                    <small class="text-muted">${c.clienteNombre} · ${c.clienteDocumento}</small>
                    <small class="d-block" style="color:var(--vet-blue)">
                        ${c.detalles.length} ítems en la cuenta médica
                    </small>
                </div>
                <i class="bi bi-box-arrow-in-right fs-4 text-muted"></i>
            </div>
        </div>
    `);

    card.click(() => {
        importarCitaDirecta(c);
        modalCitasCobro.hide();
    });

    return card;
}

function importarCitaDirecta(citaData) {
    // Se marca la importación ANTES de disparar el 'change' de tipoDoc, para que
    // configurarTipoDocumento() detecte que hay datos ya validados y no los borre.
    importCitaId = citaData.citaId;
    const isRuc = citaData.clienteDocumento.length === 11;

    $('#tipoDoc').val(isRuc ? '6' : '1').trigger('change');

    // Los datos de cliente ya vienen validados desde la cita médica: se cargan y se
    // bloquean para que no se puedan editar ni se pierdan al cambiar el tipo de
    // documento (por ejemplo, al pasar a Nota de Venta).
    $('#numDoc').val(citaData.clienteDocumento).prop('readOnly', true);
    $('#nombreCliente').val(citaData.clienteNombre).prop('readOnly', true);

    citaData.detalles.forEach((item, index) => {
        agregarServicioCitaAlCarrito(item, citaData, index);
    });

    renderizarCarrito();

    Swal.fire({
        icon: 'success',
        title: 'Cuenta Médica Importada',
        text: `Gastos de ${citaData.mascota} transferidos al carrito.`,
        timer: 2000,
        showConfirmButton: false
    });
}

function agregarServicioCitaAlCarrito(item, citaData, index) {
    carrito.push({
        id: item.idProducto || `CITA-${citaData.citaId}-${index}`,
        codigo: item.tipo === 'SERVICIO' ? 'CM-001' : 'INS-001',
        nombre: item.descripcion,
        precio: parseFloat(item.precio),
        cantidad: parseInt(item.cantidad),
        stock: 9999,
        imagen: null,
        esServicio: true,
        isCitaImported: true,
        citaId: citaData.citaId
    });
}