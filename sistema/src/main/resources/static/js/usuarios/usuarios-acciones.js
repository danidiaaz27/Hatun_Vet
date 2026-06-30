function iniciarAccionesUsuarios() {
    $('#tablaUsuarios tbody').on('click', '.action-edit', editarUsuario);
    $('#tablaUsuarios tbody').on('click', '.action-status', cambiarEstadoUsuario);
    $('#tablaUsuarios tbody').on('click', '.action-delete', confirmarEliminarUsuario);
}

function editarUsuario() {
    fetch(`${API_BASE}/${$(this).data('id')}`)
        .then(r => r.json())
        .then(res => {
            if (res.success) cargarUsuarioEnModal(res.data);
        });
}

function cargarUsuarioEnModal(usuario) {
    $('#id').val(usuario.id);
    $('#nombre').val(usuario.nombre);
    $('#usuario').val(usuario.usuario);
    $('#id_perfil').val(usuario.perfil ? usuario.perfil.id : '');

    $('#clave').val('')
        .prop('required', false)
        .attr('type', 'password');

    resetearIconoClave();

    $('#claveHelp').show();
    $('#modalTitle').text('Editar Usuario');

    usuarioModal.show();
}

function cambiarEstadoUsuario() {
    fetch(`${API_BASE}/cambiar-estado/${$(this).data('id')}`, {
        method: 'POST'
    }).then(() => recargarTablaUsuarios());
}

function confirmarEliminarUsuario() {
    const id = $(this).data('id');

    Swal.fire({
        title: '¿Eliminar usuario?',
        text: 'Solo se desactivará',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#D32F2F'
    }).then(result => {
        if (result.isConfirmed) eliminarUsuario(id);
    });
}

function eliminarUsuario(id) {
    fetch(`${API_BASE}/eliminar/${id}`, {
        method: 'DELETE'
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                recargarTablaUsuarios();
                return;
            }

            Swal.fire('Error', data.message, 'error');
        });
}