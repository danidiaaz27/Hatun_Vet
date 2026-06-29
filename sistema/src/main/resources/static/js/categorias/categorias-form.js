function iniciarFormularioCategorias() {
    $('#btnNuevoRegistro').click(abrirModalNuevaCategoria);
    $('#formCategoria').submit(guardarCategoria);
}

function abrirModalNuevaCategoria() {
    $('#formCategoria')[0].reset();
    $('#id').val('');
    $('#modalTitle').text('Nueva Categoría');
    categoriaModal.show();
}

function guardarCategoria(e) {
    e.preventDefault();

    const btnGuardar = $('#btnSubmitCategoria');
    btnGuardar.prop('disabled', true).html(
        '<span class="spinner-border spinner-border-sm"></span> Guardando...'
    );

    fetch(`${API_BASE}/guardar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crearPayloadCategoria())
    })
        .then(r => r.json())
        .then(data => manejarRespuestaGuardarCategoria(data))
        .catch(() => {
            Swal.fire('Error', 'Fallo al comunicarse con el servidor.', 'error');
        })
        .finally(() => {
            btnGuardar.prop('disabled', false).html('Guardar');
        });
}

function crearPayloadCategoria() {
    return {
        id: $('#id').val() || null,
        nombre: $('#nombre').val().trim(),
        descripcion: $('#descripcion').val().trim()
    };
}

function manejarRespuestaGuardarCategoria(data) {
    if (data.success) {
        categoriaModal.hide();
        dataTable.ajax.reload();
        Swal.fire('Éxito', data.message, 'success');
        return;
    }

    Swal.fire('Atención', data.message, 'warning');
}