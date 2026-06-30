function iniciarEdicionPerfiles() {
    $('#tablaPerfiles tbody').on('click', '.action-edit', editarPerfil);
    $('#tablaPerfiles tbody').on('click', '.action-status', cambiarEstadoPerfil);
}

function editarPerfil() {
    fetch(`${API_BASE}/${$(this).data('id')}`)
        .then(r => r.json())
        .then(res => {
            if (res.success) cargarPerfilEnModal(res.data);
        });
}

function cargarPerfilEnModal(perfil) {
    $('#id').val(perfil.id);
    $('#nombre').val(perfil.nombre);
    $('#descripcion').val(perfil.descripcion);
    $('#modalTitle').text('Editar Perfil');
    perfilModal.show();
}

function cambiarEstadoPerfil() {
    fetch(`${API_BASE}/cambiar-estado/${$(this).data('id')}`, {
        method: 'POST'
    }).then(() => recargarTablaPerfiles());
}