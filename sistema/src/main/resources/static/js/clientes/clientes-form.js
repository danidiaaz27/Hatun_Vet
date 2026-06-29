function iniciarFormularioClientes() {
    $('#btnNuevoCliente').click(abrirModalNuevoCliente);
    $('#btnBuscarDoc').click(buscarDocumentoCliente);
    $('#formCliente').submit(guardarCliente);
    $('#tablaClientes tbody').on('click', '.action-edit', editarCliente);
}
function abrirModalNuevoCliente() {
    $('#formCliente')[0].reset();
    $('#id').val('');
    modalCliente.show();
}
function buscarDocumentoCliente() {
    const tipoDoc = $('#tipoDocumento').val();
    const numDoc = $('#numeroDocumento').val().trim();

    if (!validarDocumentoConsulta(tipoDoc, numDoc)) return;

    fetch(`/ventas/api/consultar-cliente?tipoDoc=${tipoDoc}&numero=${numDoc}`)
        .then(r => r.json())
        .then(res => manejarRespuestaDocumento(res, tipoDoc))
        .catch(() =>
            Swal.fire('Error', 'Fallo al conectar con la API', 'error')
        );
}
function validarDocumentoConsulta(tipoDoc, numDoc) {
    if (tipoDoc === '1' && numDoc.length !== 8) {
        Swal.fire('Aviso', 'El DNI debe tener 8 dígitos', 'warning');
        return false;
    }
    if (tipoDoc === '6' && numDoc.length !== 11) {
        Swal.fire('Aviso', 'El RUC debe tener 11 dígitos', 'warning');
        return false;
    }
    return true;
}
function manejarRespuestaDocumento(res, tipoDoc) {
    const info = res.datos || res.data;
    if (res.success && info) {
        $('#nombreCompleto').val(obtenerNombreDocumento(info, tipoDoc));
        return;
    }
    Swal.fire(
        'No encontrado',
        'Verifique el número ingresado en SUNAT/RENIEC.',
        'info'
    );
}
function obtenerNombreDocumento(info, tipoDoc) {
    if (tipoDoc === '1') {
        return (
            info.nombre_completo ||
            `${info.nombres} ${info.ape_paterno} ${info.ape_materno}`
        ).trim();
    }
    return info.nombre_o_razon_social || info.razon_social;
}
function editarCliente() {
    const id = $(this).data('id');
    fetch(`${API_URL}/${id}`)
        .then(r => r.json())
        .then(res => {
            if (res.success) cargarClienteEnModal(res.data);
        });
}
function cargarClienteEnModal(cliente) {
    $('#id').val(cliente.id);
    $('#tipoDocumento').val(cliente.tipoDocumento);
    $('#numeroDocumento').val(cliente.numeroDocumento);
    $('#nombreCompleto').val(cliente.nombreCompleto);
    $('#telefono').val(cliente.telefono || '');
    $('#correo').val(cliente.correo || '');
    modalCliente.show();
}
function guardarCliente(e) {
    e.preventDefault();
    if (!validarFormularioCliente()) return;
    fetch(`${API_URL}/guardar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crearPayloadCliente())
    })
        .then(r => r.json())
        .then(res => manejarRespuestaGuardarCliente(res));
}
function crearPayloadCliente() {
    return {
        id: $('#id').val() || null,
        tipoDocumento: $('#tipoDocumento').val(),
        numeroDocumento: $('#numeroDocumento').val().trim(),
        nombreCompleto: $('#nombreCompleto').val().trim(),
        telefono: $('#telefono').val().trim(),
        correo: $('#correo').val().trim()
    };
}
function manejarRespuestaGuardarCliente(res) {
    if (res.success) {
        modalCliente.hide();
        dataTable.ajax.reload();
        Swal.fire('Éxito', res.message, 'success');
        return;
    }
    Swal.fire('Atención', res.message, 'warning');
}