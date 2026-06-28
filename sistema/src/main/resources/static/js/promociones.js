$(document).ready(function() {
    const API_BASE = '/promociones/api';

    // Cargar listas de productos y categorías para los combos
    cargarCombos();

    let dataTable = $('#tablaPromociones').DataTable({
        ajax: { url: `${API_BASE}/listar`, dataSrc: 'data' },
        columns: [
            { data: 'nombre', className: 'fw-bold text-primary' },
            { 
                data: 'tipo',
                render: tipo => {
                    const map = {
                        'PORCENTUAL': '<span class="badge bg-info text-dark">Porcentual</span>',
                        'MONTO_FIJO': '<span class="badge bg-secondary text-white">Monto Fijo</span>',
                        'PROMO_2X1': '<span class="badge bg-primary text-white">2x1</span>',
                        'PROMO_3X2': '<span class="badge bg-primary text-white">3x2</span>',
                        'COMPRA_MINIMA': '<span class="badge bg-dark text-white">Compra Mínima</span>',
                        'REGALO': '<span class="badge bg-warning text-dark">Regalo</span>',
                        'CATEGORIA': '<span class="badge bg-purple text-dark" style="background:#f3e5f5; color:#7b1fa2;">Categoría</span>'
                    };
                    return map[tipo] || tipo;
                }
            },
            {
                data: null,
                render: row => {
                    if (row.tipo === 'PORCENTUAL') return `${parseFloat(row.valor).toFixed(0)}% de descuento`;
                    if (row.tipo === 'MONTO_FIJO') return `S/ ${parseFloat(row.valor).toFixed(2)} de descuento`;
                    if (row.tipo === 'PROMO_2X1') return 'Paga 1, Lleva 2';
                    if (row.tipo === 'PROMO_3X2') return 'Paga 2, Lleva 3';
                    if (row.tipo === 'COMPRA_MINIMA') {
                        let res = `Compra Min. S/ ${parseFloat(row.compraMinima).toFixed(2)}`;
                        if (row.valor > 0) res += ` (-S/ ${parseFloat(row.valor).toFixed(2)})`;
                        if (row.productoRegalo) res += ` (+ Regalo: ${row.productoRegalo.nombre})`;
                        return res;
                    }
                    if (row.tipo === 'REGALO') return `Lleva gratis: ${row.productoRegalo ? row.productoRegalo.nombre : '-'}`;
                    if (row.tipo === 'CATEGORIA') return `${parseFloat(row.valor).toFixed(0)}% de desc. en categoría`;
                    return '-';
                }
            },
            {
                data: null,
                render: row => {
                    if (row.producto) return `Producto: <span class="fw-semibold">${row.producto.nombre}</span>`;
                    if (row.categoria) return `Categoría: <span class="fw-semibold">${row.categoria.nombre}</span>`;
                    return '<span class="text-muted">Todos los productos</span>';
                }
            },
            {
                data: null,
                render: row => {
                    const fInicio = formatFecha(row.fechaInicio);
                    const fFin = formatFecha(row.fechaFin);
                    return `<small>${fInicio} al ${fFin}</small>`;
                }
            },
            {
                data: 'estado',
                render: data => data === 'ACTIVO' ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-danger">Inactivo</span>'
            },
            {
                data: null,
                render: function(data, type, row) {
                    return `
                        <div class="btn-group btn-group-sm">
                            <button data-id="${row.id}" class="btn btn-light border action-edit text-primary" title="Editar"><i class="bi bi-pencil-fill"></i></button>
                            <button data-id="${row.id}" class="btn btn-light border action-delete text-danger" title="Eliminar"><i class="bi bi-trash-fill"></i></button>
                        </div>`;
                }
            }
        ],
        language: { url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json" }
    });

    const promocionModal = new bootstrap.Modal(document.getElementById('promocionModal'));

    // Toggle fields based on type select
    $('#tipo').change(function() {
        const tipo = $(this).val();
        
        // Hide all conditional inputs
        $('#divValor, #divCompraMinima, #divProducto, #divCategoria, #divProductoRegalo').addClass('d-none');
        $('#valor, #compraMinima, #productoId, #categoriaId, #productoRegaloId').prop('required', false);

        if (tipo === 'PORCENTUAL') {
            $('#divValor, #divProducto, #divCategoria').removeClass('d-none');
            $('#lblValor').text('Porcentaje de descuento (%) *');
            $('#valor').prop('required', true).attr('placeholder', 'Ej. 15');
        } else if (tipo === 'MONTO_FIJO') {
            $('#divValor, #divProducto, #divCategoria').removeClass('d-none');
            $('#lblValor').text('Monto de descuento (S/) *');
            $('#valor').prop('required', true).attr('placeholder', 'Ej. 10.00');
        } else if (tipo === 'PROMO_2X1' || tipo === 'PROMO_3X2') {
            $('#divProducto').removeClass('d-none');
            $('#productoId').prop('required', true);
        } else if (tipo === 'COMPRA_MINIMA') {
            $('#divCompraMinima, #divValor, #divProductoRegalo').removeClass('d-none');
            $('#lblValor').text('Descuento por cumplir compra (S/) (Opcional)');
            $('#compraMinima').prop('required', true).attr('placeholder', 'Ej. 100.00');
        } else if (tipo === 'REGALO') {
            $('#divProducto, #divProductoRegalo').removeClass('d-none');
            $('#productoId, #productoRegaloId').prop('required', true);
        } else if (tipo === 'CATEGORIA') {
            $('#divCategoria, #divValor').removeClass('d-none');
            $('#categoriaId').prop('required', true);
            $('#lblValor').text('Porcentaje de descuento (%) *');
            $('#valor').prop('required', true).attr('placeholder', 'Ej. 20');
        }
    });

    $('#btnNuevoRegistro').click(() => {
        $('#formPromocion')[0].reset();
        $('#id').val('');
        $('#tipo').val('').trigger('change');
        $('#modalTitle').text('Nueva Promoción');
        promocionModal.show();
    });

    $('#formPromocion').submit(e => {
        e.preventDefault();

        const btnGuardar = $('#btnSubmitPromocion');
        btnGuardar.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Guardando...');

        const payload = {
            id: $('#id').val() || null,
            nombre: $('#nombre').val().trim(),
            descripcion: $('#descripcion').val().trim(),
            tipo: $('#tipo').val(),
            valor: parseFloat($('#valor').val()) || 0,
            fechaInicio: $('#fechaInicio').val(),
            fechaFin: $('#fechaFin').val(),
            estado: $('#estado').val(),
            compraMinima: parseFloat($('#compraMinima').val()) || 0,
            producto: $('#productoId').val() ? { id: $('#productoId').val() } : null,
            categoria: $('#categoriaId').val() ? { id: $('#categoriaId').val() } : null,
            productoRegalo: $('#productoRegaloId').val() ? { id: $('#productoRegaloId').val() } : null
        };

        fetch(`${API_BASE}/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(r => r.json()).then(data => {
            if (data.success) {
                promocionModal.hide();
                dataTable.ajax.reload();
                Swal.fire('Éxito', data.message, 'success');
            } else {
                Swal.fire('Atención', data.message, 'warning');
            }
        }).catch(() => {
            Swal.fire('Error', 'Fallo al comunicarse con el servidor.', 'error');
        }).finally(() => {
            btnGuardar.prop('disabled', false).html('Guardar');
        });
    });

    $('#tablaPromociones tbody').on('click', '.action-edit', function() {
        const id = $(this).data('id');
        fetch(`${API_BASE}/listar`).then(r => r.json()).then(res => {
            const promo = res.data.find(p => p.id === id);
            if (promo) {
                $('#id').val(promo.id);
                $('#nombre').val(promo.nombre);
                $('#descripcion').val(promo.descripcion);
                $('#tipo').val(promo.tipo).trigger('change');
                $('#valor').val(promo.valor);
                $('#fechaInicio').val(promo.fechaInicio);
                $('#fechaFin').val(promo.fechaFin);
                $('#estado').val(promo.estado);
                $('#compraMinima').val(promo.compraMinima);
                
                if (promo.producto) $('#productoId').val(promo.producto.id);
                if (promo.categoria) $('#categoriaId').val(promo.categoria.id);
                if (promo.productoRegalo) $('#productoRegaloId').val(promo.productoRegalo.id);

                $('#modalTitle').text('Editar Promoción');
                promocionModal.show();
            }
        });
    });

    $('#tablaPromociones tbody').on('click', '.action-delete', function() {
        const id = $(this).data('id');
        Swal.fire({
            title: '¿Eliminar Promoción?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#D32F2F',
            confirmButtonText: 'Sí, eliminar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${API_BASE}/eliminar/${id}`, { method: 'DELETE' })
                    .then(r => r.json()).then(data => {
                        if(data.success) {
                            dataTable.ajax.reload();
                            Swal.fire('Eliminada', data.message, 'success');
                        } else {
                            Swal.fire('Error', data.message, 'error');
                        }
                    });
            }
        });
    });

    function cargarCombos() {
        // Cargar productos
        fetch('/productos/api/listar')
            .then(r => r.json())
            .then(res => {
                if (res.data) {
                    res.data.forEach(p => {
                        const opt = `<option value="${p.id}">${p.nombre} (S/ ${parseFloat(p.precio).toFixed(2)})</option>`;
                        $('#productoId').append(opt);
                        $('#productoRegaloId').append(opt);
                    });
                }
            });

        // Cargar categorías
        fetch('/categorias/api/listar')
            .then(r => r.json())
            .then(res => {
                if (res.data) {
                    res.data.forEach(c => {
                        const opt = `<option value="${c.id}">${c.nombre}</option>`;
                        $('#categoriaId').append(opt);
                    });
                }
            });
    }

    function formatFecha(fechaStr) {
        if (!fechaStr) return '';
        const parts = fechaStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return fechaStr;
    }
});
