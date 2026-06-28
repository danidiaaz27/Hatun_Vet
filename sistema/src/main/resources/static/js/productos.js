$(document).ready(function() {
    const API_BASE = '/productos/api';

    function cargarCategorias() {
        fetch(`${API_BASE}/categorias`)
            .then(r => r.json())
            .then(res => {
                if(res.success) {
                    const select = $('#id_categoria');
                    select.find('option:not(:first)').remove();
                    res.data.filter(c => c.estado).forEach(c => {
                        select.append(`<option value="${c.id}">${c.nombre}</option>`);
                    });
                }
            });
    }

    function cargarProveedores() {
        fetch('/proveedores/api/listar')
            .then(r => r.json())
            .then(res => {
                if(res.data) {
                    const select = $('#proveedor_id');
                    select.find('option:not(:first)').remove();
                    res.data.filter(p => p.estado).forEach(p => {
                        select.append(`<option value="${p.id}">${p.nombre}</option>`);
                    });
                }
            });
    }

    let dataTable = $('#tablaProductos').DataTable({
        ajax: { url: `${API_BASE}/listar`, dataSrc: 'data' },
        columns: [
            {
                data: 'imagen',
                orderable: false,
                render: function(data) {
                    if (data) return `<img src="/uploads/${data}" alt="img" class="img-thumbnail" style="width: 50px; height: 50px; object-fit: cover;">`;
                    return `<div class="bg-light text-secondary d-flex align-items-center justify-content-center border rounded" style="width: 50px; height: 50px;"><i class="bi bi-image fs-4"></i></div>`;
                }
            },
            { data: 'codigo', className: 'fw-bold text-secondary' },
            { 
                data: 'nombre', 
                className: 'fw-bold text-primary',
                render: (data, type, row) => {
                    let badge = '';
                    if (row.esServicio) {
                        badge = ` <span class="badge bg-primary bg-opacity-10 text-primary fw-bold small border" style="font-size:10px;"><i class="bi bi-scissors me-1"></i>Servicio</span>`;
                    } else if (row.fraccionable) {
                        const stockFracc = row.stockFraccionado || 0;
                        badge = ` <span class="badge bg-info bg-opacity-10 text-info fw-bold small border" style="font-size:10px;" title="Envase en uso"><i class="bi bi-flask"></i> Abierto: ${parseFloat(stockFracc).toFixed(2)} / ${parseFloat(row.capacidadTotal).toFixed(2)} ${row.unidadMedida}</span>`;
                    }
                    return data + badge;
                }
            },
            {
                data: 'categoria',
                render: data => data ? data.nombre : '<span class="text-danger">Sin Categoría</span>'
            },
            {
                data: 'precio',
                className: 'text-end fw-bold',
                render: data => `S/ ${parseFloat(data).toFixed(2)}`
            },
            {
                data: 'stock',
                className: 'text-center',
                render: (data, type, row) => row.esServicio ? `<span class="badge bg-secondary rounded-pill">N/A</span>` : (data <= 5 ? `<span class="badge bg-danger rounded-pill">${data}</span>` : `<span class="badge bg-success rounded-pill">${data}</span>`)
            },
            {
                data: 'estado',
                render: data => data ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-danger">Inactivo</span>'
            },
            {
                data: null,
                orderable: false,
                render: function(data, type, row) {
                    const iconColor = row.estado ? 'text-warning' : 'text-success';
                    const iconClass = row.estado ? 'bi-eye-slash-fill' : 'bi-eye-fill';
                    return `
                        <div class="btn-group btn-group-sm">
                            <button data-id="${row.id}" class="btn btn-light border action-edit text-primary" title="Editar"><i class="bi bi-pencil-fill"></i></button>
                            <button data-id="${row.id}" class="btn btn-light border action-status ${iconColor}" title="Cambiar Estado"><i class="bi ${iconClass}"></i></button>
                            <button data-id="${row.id}" class="btn btn-light border action-delete text-danger" title="Eliminar"><i class="bi bi-trash-fill"></i></button>
                        </div>`;
                }
            }
        ],
        language: { url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json" }
    });

    const productoModal = new bootstrap.Modal(document.getElementById('productoModal'));
    cargarCategorias();
    cargarProveedores();

    $('#fraccionable').change(function() {
        if (this.checked) {
            $('#seccionFraccionamiento').slideDown(200);
            $('#unidadMedida').prop('required', true);
            $('#capacidadTotal').prop('required', true);
            $('#precioFraccionado').prop('required', true);
        } else {
            $('#seccionFraccionamiento').slideUp(200);
            $('#unidadMedida').prop('required', false).val('');
            $('#capacidadTotal').prop('required', false).val('');
            $('#precioFraccionado').prop('required', false).val('');
        }
    });

    $('#esServicio').change(function() {
        if (this.checked) {
            $('#grupoStock').hide();
            $('#stock').prop('required', false).val(0);
            $('#grupoFraccionable').hide();
            $('#fraccionable').prop('checked', false).trigger('change');
        } else {
            $('#grupoStock').show();
            $('#stock').prop('required', true);
            $('#grupoFraccionable').show();
        }
    });

    $('#btnNuevoRegistro').click(() => {
        $('#formProducto')[0].reset();
        $('#id').val('');
        $('#esServicio').prop('checked', false).trigger('change');
        $('#fraccionable').prop('checked', false).trigger('change');
        $('#modalTitle').text('Nuevo Producto');
        productoModal.show();
    });

    $('#formProducto').submit(e => {
        e.preventDefault();

        // VALIDACIÓN 5: Límite de Peso de Imagen (Max 2MB)
        let fileInput = document.getElementById('imagenFile');
        if (fileInput.files.length > 0) {
            let fileSize = fileInput.files[0].size / 1024 / 1024; // en MB
            if (fileSize > 2) {
                Swal.fire('Archivo muy pesado', 'La imagen no puede pesar más de 2MB.', 'warning');
                return;
            }
        }

        // VALIDACIÓN ANTI-DOBLE CLIC
        const btnGuardar = $('#btnSubmitProducto');
        btnGuardar.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Guardando...');

        let formData = new FormData();
        if ($('#id').val()) formData.append("id", $('#id').val());

        formData.append("codigo", $('#codigo').val().trim());
        formData.append("nombre", $('#nombre').val().trim());
        formData.append("descripcion", $('#descripcion').val().trim());
        formData.append("precio", $('#precio').val());
        formData.append("stock", $('#stock').val());
        formData.append("categoria.id", $('#id_categoria').val());
        formData.append("esServicio", $('#esServicio').is(':checked'));
        formData.append("fraccionable", $('#fraccionable').is(':checked'));

        if ($('#fraccionable').is(':checked') && !$('#esServicio').is(':checked')) {
            formData.append("unidadMedida", $('#unidadMedida').val().trim());
            formData.append("capacidadTotal", $('#capacidadTotal').val());
            formData.append("precioFraccionado", $('#precioFraccionado').val());
        }

        const proveedorId = $('#proveedor_id').val();
        if (proveedorId) formData.append("proveedor.id", proveedorId);

        if (fileInput.files.length > 0) {
            formData.append("imagenFile", fileInput.files[0]);
        }

        fetch(`${API_BASE}/guardar`, {
            method: 'POST',
            body: formData
        }).then(r => r.json()).then(data => {
            if (data.success) {
                productoModal.hide();
                dataTable.ajax.reload();
                Swal.fire('Éxito', data.message, 'success');
            } else {
                Swal.fire('Atención', data.message, 'warning');
            }
        }).catch(() => Swal.fire('Error', 'Fallo de conexión.', 'error'))
          .finally(() => btnGuardar.prop('disabled', false).html('Guardar Producto'));
    });

    $('#tablaProductos tbody').on('click', '.action-edit', function() {
        fetch(`${API_BASE}/${$(this).data('id')}`)
            .then(r => r.json()).then(res => {
                if(res.success) {
                    const p = res.data;
                    $('#id').val(p.id);
                    $('#codigo').val(p.codigo);
                    $('#nombre').val(p.nombre);
                    $('#descripcion').val(p.descripcion);
                    $('#precio').val(p.precio);
                    $('#id_categoria').val(p.categoria ? p.categoria.id : '');
                    $('#proveedor_id').val(p.proveedor ? p.proveedor.id : '');
                    $('#imagenFile').val('');

                    if (p.esServicio) {
                        $('#esServicio').prop('checked', true).trigger('change');
                    } else {
                        $('#esServicio').prop('checked', false).trigger('change');
                        $('#stock').val(p.stock);
                        if (p.fraccionable) {
                            $('#fraccionable').prop('checked', true);
                            $('#seccionFraccionamiento').show();
                            $('#unidadMedida').val(p.unidadMedida).prop('required', true);
                            $('#capacidadTotal').val(p.capacidadTotal).prop('required', true);
                            $('#precioFraccionado').val(p.precioFraccionado).prop('required', true);
                        } else {
                            $('#fraccionable').prop('checked', false);
                            $('#seccionFraccionamiento').hide();
                            $('#unidadMedida').val('').prop('required', false);
                            $('#capacidadTotal').val('').prop('required', false);
                            $('#precioFraccionado').val('').prop('required', false);
                        }
                    }

                    $('#modalTitle').text('Editar Producto');
                    productoModal.show();
                }
            });
    });

    $('#tablaProductos tbody').on('click', '.action-status', function() {
        fetch(`${API_BASE}/cambiar-estado/${$(this).data('id')}`, { method: 'POST' })
            .then(() => dataTable.ajax.reload());
    });

    $('#tablaProductos tbody').on('click', '.action-delete', function() {
        const id = $(this).data('id');
        Swal.fire({
            title: '¿Eliminar producto?',
            text: 'Solo se podrá eliminar si no tiene historial de ventas o inventario.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#D32F2F',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, intentar eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${API_BASE}/eliminar/${id}`, { method: 'DELETE' })
                    .then(r => r.json()).then(data => {
                        if(data.success) {
                            dataTable.ajax.reload();
                            Swal.fire('Eliminado', data.message, 'success');
                        } else {
                            Swal.fire('No permitido', data.message, 'error');
                        }
                    });
            }
        });
    });
});