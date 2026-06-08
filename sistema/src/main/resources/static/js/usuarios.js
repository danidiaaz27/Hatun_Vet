$(document).ready(function() {
    const API_BASE = '/usuarios/api';

    function cargarPerfiles() {
        fetch(`${API_BASE}/perfiles`)
            .then(r => r.json())
            .then(res => {
                if(res.success) {
                    const select = $('#id_perfil');
                    select.find('option:not(:first)').remove();
                    res.data.forEach(p => select.append(`<option value="${p.id}">${p.nombre}</option>`));
                }
            });
    }

    let dataTable = $('#tablaUsuarios').DataTable({
        ajax: { url: `${API_BASE}/listar`, dataSrc: 'data' },
        columns: [
            { data: 'nombre', className: 'fw-bold' },
            { data: 'usuario', className: 'text-muted' },
            { data: 'perfil', render: data => data ? `<span class="badge bg-secondary">${data.nombre}</span>` : '<span class="text-danger">Sin Perfil</span>' },
            { data: 'activo', render: data => data ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-danger">Inactivo</span>' },
            { data: null, render: function(data, type, row) {
                    let actions = `<div class="btn-group btn-group-sm">
                        <button data-id="${row.id}" class="btn btn-light border action-edit text-primary" title="Editar"><i class="bi bi-pencil-fill"></i></button>`;
                    if(row.usuario !== 'admin') {
                        actions += `<button data-id="${row.id}" class="btn btn-light border action-status ${row.activo ? 'text-warning' : 'text-success'}" title="Estado"><i class="bi ${row.activo ? 'bi-eye-slash-fill' : 'bi-eye-fill'}"></i></button>
                                    <button data-id="${row.id}" class="btn btn-light border action-delete text-danger" title="Eliminar"><i class="bi bi-trash-fill"></i></button>`;
                    }
                    return actions + `</div>`;
                }
            }
        ],
        language: { url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json" }
    });

    const usuarioModal = new bootstrap.Modal(document.getElementById('usuarioModal'));
    cargarPerfiles();

    // Mostrar / Ocultar contraseña
    $('#btnToggleClave').click(function() {
        const input = $('#clave');
        const icon = $(this).find('i');
        if (input.attr('type') === 'password') {
            input.attr('type', 'text');
            icon.removeClass('bi-eye-fill').addClass('bi-eye-slash-fill');
        } else {
            input.attr('type', 'password');
            icon.removeClass('bi-eye-slash-fill').addClass('bi-eye-fill');
        }
    });

    // Validar que en Nombre solo se ingresen letras y espacios en tiempo real
    $('#nombre').on('input', function() {
        this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
    });

    function validarPassword(pwd) {
        if (pwd.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
        if (!/[A-Z]/.test(pwd)) return "La contraseña debe contener al menos una letra mayúscula.";
        if (!/[a-z]/.test(pwd)) return "La contraseña debe contener al menos una letra minúscula.";
        if (!/[0-9]/.test(pwd)) return "La contraseña debe contener al menos un número.";
        if (!/[^a-zA-Z0-9\s]/.test(pwd)) return "La contraseña debe contener al menos un carácter especial (ej. @, $, !, %, *, #, ?, -).";
        return null;
    }

    $('#btnNuevoRegistro').click(() => {
        $('#formUsuario')[0].reset();
        $('#id').val('');
        $('#clave').prop('required', true).attr('type', 'password');
        $('#btnToggleClave i').removeClass('bi-eye-slash-fill').addClass('bi-eye-fill');
        $('#claveHelp').hide();
        $('#modalTitle').text('Nuevo Usuario');
        usuarioModal.show();
    });

    $('#formUsuario').submit(e => {
        e.preventDefault();
        const login = $('#usuario').val().trim();
        const nombre = $('#nombre').val().trim();
        const clave = $('#clave').val();
        const id = $('#id').val() || null;

        if (login.includes(' ')) {
            Swal.fire('Error', 'El usuario no puede contener espacios', 'error');
            return;
        }

        // Validar nombre (solo letras y espacios)
        const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
        if (!regexNombre.test(nombre)) {
            Swal.fire('Error', 'El nombre solo debe contener letras.', 'error');
            return;
        }

        // Validar contraseña
        if (!id) {
            if (!clave) {
                Swal.fire('Error', 'La contraseña es obligatoria para nuevos usuarios', 'error');
                return;
            }
            const errorPwd = validarPassword(clave);
            if (errorPwd) {
                Swal.fire('Contraseña insegura', errorPwd, 'warning');
                return;
            }
        } else {
            if (clave.length > 0) {
                const errorPwd = validarPassword(clave);
                if (errorPwd) {
                    Swal.fire('Contraseña insegura', errorPwd, 'warning');
                    return;
                }
            }
        }

        const payload = {
            id: id,
            nombre: nombre,
            usuario: login,
            passwordHash: clave,
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

    $('#tablaUsuarios tbody').on('click', '.action-edit', function() {
        fetch(`${API_BASE}/${$(this).data('id')}`)
            .then(r => r.json()).then(res => {
                if(res.success) {
                    $('#id').val(res.data.id);
                    $('#nombre').val(res.data.nombre);
                    $('#usuario').val(res.data.usuario);
                    $('#id_perfil').val(res.data.perfil ? res.data.perfil.id : '');
                    $('#clave').val('').prop('required', false).attr('type', 'password');
                    $('#btnToggleClave i').removeClass('bi-eye-slash-fill').addClass('bi-eye-fill');
                    $('#claveHelp').show();
                    $('#modalTitle').text('Editar Usuario');
                    usuarioModal.show();
                }
            });
    });

    $('#tablaUsuarios tbody').on('click', '.action-status', function() {
        fetch(`${API_BASE}/cambiar-estado/${$(this).data('id')}`, { method: 'POST' }).then(() => dataTable.ajax.reload());
    });

    $('#tablaUsuarios tbody').on('click', '.action-delete', function() {
        const id = $(this).data('id');
        Swal.fire({ title: '¿Eliminar usuario?', text: 'Solo se desactivará', icon: 'warning', showCancelButton: true, confirmButtonColor: '#D32F2F' })
        .then((result) => { if (result.isConfirmed) {
            fetch(`${API_BASE}/eliminar/${id}`, { method: 'DELETE' }).then(r => r.json()).then(data => {
                if(data.success) dataTable.ajax.reload(); else Swal.fire('Error', data.message, 'error');
            });
        }});
    });
});