function iniciarFormularioImagenes() {
    $('#formLandingImagen').submit(guardarImagenLanding);
    $('#btnNuevaImagen').click(abrirModalNuevaImagen);
}

function abrirModalNuevaImagen() {
    $('#formLandingImagen')[0].reset();
    $('#landingId').val('');
    landingModal.show();
}

function guardarImagenLanding(e) {
    e.preventDefault();

    const formData = crearFormDataImagenLanding();

    fetch(`${API_BASE}/imagenes/guardar`, {
        method: 'POST',
        body: formData
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                landingModal.hide();
                cargarImagenes();
                Swal.fire('Éxito', data.message, 'success');
                return;
            }

            Swal.fire('Error', data.message, 'error');
        });
}

function crearFormDataImagenLanding() {
    const formData = new FormData();

    formData.append('id', $('#landingId').val());
    formData.append('tipo', $('#tipo').val().trim());
    formData.append('estado', $('#estado').val());

    const file = document.getElementById('imagenFile').files[0];

    if (file) {
        formData.append('imagenFile', file);
    }

    return formData;
}