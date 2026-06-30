function recargarTablaPerfiles() {
    dataTable.ajax.reload();
}

function crearPayloadPerfil() {
    return {
        id: $('#id').val() || null,
        nombre: $('#nombre').val().trim(),
        descripcion: $('#descripcion').val().trim()
    };
}

function validarPerfil(nombre) {
    if (nombre.length < 3) {
        Swal.fire(
            'Atención',
            'El nombre debe tener al menos 3 caracteres',
            'warning'
        );
        return false;
    }

    return true;
}

function renderEstadoPerfil(estado) {
    return estado
        ? '<span class="badge bg-success">Activo</span>'
        : '<span class="badge bg-danger">Inactivo</span>';
}