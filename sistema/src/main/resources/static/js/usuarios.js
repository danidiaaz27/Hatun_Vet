$(document).ready(function() {
    const API_BASE = '/usuarios/api';

    // Cargar perfiles en el Select
    function cargarPerfiles() {
        fetch(`${API_BASE}/perfiles`)
            .then(r => r.json())
            .then(res => {
                if(res.success) {
                    const select = $('#id_perfil');
                    select.find('option:not(:first)').remove(); // Limpiar opciones previas
                    res.data.forEach(p => select.append(`<option value="${p.id}">${p.nombre}</option>`));
                }
            });
    }

    // Inicializar DataTable
    let dataTable = $('#tablaUsuarios').DataTable({
        ajax: { url: `${API_BASE}/listar`, dataSrc: 'data' },
        columns: [
            { data: 'nombre', className: 'fw-bold' },
            { data: 'usuario', className: 'text-muted' },
            {
                data: 'perfil',
                render: data => data ? `<span class="badge bg-secondary">${data.nombre}</span>` : '<span class="text-danger">Sin Perfil</span>'
            },
            {
                data: 'activo',
                render: data => data ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-danger">Inactivo</span>'
            },
            {
                data: null,
                render: function(data, type, row) {
                    const iconColor = row.activo ? 'text-warning' : 'text-success';
                    const iconClass = row.activo ? 'bi-eye-slash-fill' : 'bi-eye-fill';

                    // Prevenir que el admin principal sea borrado o desactivado por error
                    let actions = `
                        <div class="btn-group btn-group-sm">
                            <button data-id="${row.id}" class="btn btn-light border action-edit text-primary" title="Editar"><i class="bi bi-pencil-fill"></i></button>`;

                    if(row.usuario !== 'admin') {
                        actions += `
                            <button data-id="${row.id}" class="btn btn-light border action-status ${iconColor}" title="Cambiar Estado"><i class="bi ${iconClass}"></i></button>
                            <button data-id="${row.id}" class="btn btn-light border action-delete text-danger" title="Eliminar"><i class="bi bi-trash-fill"></i></button>`;
                    }
                    actions += `</div>`;
                    return actions;
                }
            }
        ],
        language: { url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json" }
    });

    const usuarioModal = new bootstrap.Modal(document.getElementById('usuarioModal'));
    cargarPerfiles(); // Cargar la lista al iniciar

    // Nuevo Registro
    $('#btnNuevoRegistro').click(() => {
        $('#formUsuario')[0].reset();
        $('#id').val('');
        $('#clave').prop('required', true);
        $('#claveHelp').hide();
        $('#modalTitle').text('Nuevo Usuario');
        usuarioModal.show();
    });

    // Guardar
    $('#formUsuario').submit(e => {
        e.preventDefault();
        const payload = {
            id: $('#id').val() || null,
            nombre: $('#nombre').val(),
            usuario: $('#usuario').val(),
            passwordHash: $('#clave').val(), // El backend espera passwordHash, que luego será encriptado por el Service
            perfil: { id: $('#id_perfil').val() }
        };

        fetch(`${API_BASE}/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(r => r.json()).then(data => {
            if (data.success) {
                usuarioModal.hide();
                dataTable.ajax.reload();
                Swal.fire('Éxito', data.message, 'success');
            } else {
                Swal.fire('Error', data.message, 'error');
            }
        });
    });

    // Editar
    $('#tablaUsuarios tbody').on('click', '.action-edit', function() {
        fetch(`${API_BASE}/${$(this).data('id')}`)
            .then(r => r.json()).then(res => {
                if(res.success) {
                    $('#id').val(res.data.id);
                    $('#nombre').val(res.data.nombre);
                    $('#usuario').val(res.data.usuario);
                    $('#id_perfil').val(res.data.perfil ? res.data.perfil.id : '');

                    $('#clave').val('').prop('required', false);
                    $('#claveHelp').show(); // Mostrar aviso de contraseña

                    $('#modalTitle').text('Editar Usuario');
                    usuarioModal.show();
                }
            });
    });

    // Cambiar Estado
    $('#tablaUsuarios tbody').on('click', '.action-status', function() {
        fetch(`${API_BASE}/cambiar-estado/${$(this).data('id')}`, { method: 'POST' })
            .then(() => dataTable.ajax.reload());
    });

    // Eliminar
    $('#tablaUsuarios tbody').on('click', '.action-delete', function() {
        const id = $(this).data('id');
        Swal.fire({
            title: '¿Eliminar usuario?',
            text: 'Solo se desactivará del sistema',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#D32F2F'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${API_BASE}/eliminar/${id}`, { method: 'DELETE' })
                    .then(r => r.json()).then(data => {
                        if(data.success) dataTable.ajax.reload();
                        else Swal.fire('Error', data.message, 'error');
                    });
            }
        });
    });
});