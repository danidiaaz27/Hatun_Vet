$(document).ready(function() {
    const API_URL = '/banos-cortes/api';
    const modalServicio = new bootstrap.Modal(document.getElementById('modalServicio'));

    // Lista base de servicios por defecto
    const serviciosBase = ['Baño Estándar', 'Baño Medicado', 'Solo Corte', 'Baño y Corte', 'Corte de Uñas'];
    let modoNuevoServicio = false;

    // Inicializar DataTable
    let dataTable = $('#tablaServicios').DataTable({
        ajax: { url: `${API_URL}/listar`, dataSrc: 'data' },
        columns: [
            {
                data: 'fechaServicio',
                render: data => new Date(data).toLocaleString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
            },
            {
                data: null,
                render: row => `<strong>${row.nombreMascota}</strong> <br><small class="text-muted">${row.especie}</small>`
            },
            {
                data: null,
                render: row => `<span>${row.nombreDueno}</span><br><small class="text-muted">DNI: ${row.dniDueno || '---'}</small>`
            },
            { data: 'tipoServicio' },
            {
                data: 'precio',
                className: 'text-end fw-bold text-primary',
                render: data => `S/ ${parseFloat(data).toFixed(2)}`
            },
            {
                data: 'estado',
                render: data => {
                    let color = data === 'PENDIENTE' ? 'bg-warning text-dark' : (data === 'TERMINADO' ? 'bg-success' : 'bg-info');
                    return `<span class="badge ${color}">${data}</span>`;
                }
            },
            {
                data: null,
                render: row => `
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-success" onclick="cambiarEstado(${row.id}, 'TERMINADO')" title="Terminar"><i class="bi bi-check-circle"></i></button>
                        <button class="btn btn-outline-info" onclick="cambiarEstado(${row.id}, 'PAGADO')" title="Marcar como Pagado"><i class="bi bi-cash"></i></button>
                    </div>`
            }
        ],
        language: { url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json" },
        order: [[0, 'desc']]
    });

    // --- CARGAR TIPOS DE SERVICIO DINÁMICOS ---
    function cargarTiposServicio() {
        fetch(`${API_URL}/tipos-servicio`)
            .then(r => r.json())
            .then(tiposDB => {
                const select = $('#tipoServicioSelect');
                select.empty();

                // Juntar los base con los que vengan de la base de datos, sin repetir
                let tiposFinales = [...new Set([...serviciosBase, ...tiposDB])];

                tiposFinales.forEach(t => {
                    select.append(`<option value="${t}">${t}</option>`);
                });
            });
    }

    // --- ALTERNAR ENTRE SELECT E INPUT PARA NUEVO SERVICIO ---
    $('#btnAlternarTipo').click(function() {
        modoNuevoServicio = !modoNuevoServicio;
        if (modoNuevoServicio) {
            $('#tipoServicioSelect').addClass('d-none');
            $('#tipoServicioInput').removeClass('d-none').focus();
            $(this).html('<i class="bi bi-list"></i> Ver Lista').removeClass('btn-outline-secondary').addClass('btn-outline-primary');
        } else {
            $('#tipoServicioSelect').removeClass('d-none');
            $('#tipoServicioInput').addClass('d-none').val('');
            $(this).html('<i class="bi bi-plus-lg"></i> Nuevo').removeClass('btn-outline-primary').addClass('btn-outline-secondary');
        }
    });

    // --- LUPA: BUSCAR DNI (Reutilizando la API del Punto de Venta) ---
    $('#dniDueno').on('input', function() { this.value = this.value.replace(/[^0-9]/g, ''); });

    $('#btnBuscarDni').click(function() {
        const dni = $('#dniDueno').val().trim();
        if (dni.length !== 8) {
            Swal.fire('Atención', 'El DNI debe tener 8 dígitos', 'warning');
            return;
        }

        const btn = $(this);
        const icon = btn.html();
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span>');

        // ¡Magia! Llamamos al endpoint que hicimos para las ventas
        fetch(`/ventas/api/consultar-cliente?tipoDoc=1&numero=${dni}`)
            .then(r => r.json())
            .then(res => {
                const info = res.datos || res.data;
                if (res.success && info) {
                    let nombre = info.nombre_completo || `${info.nombres || ''} ${info.ape_paterno || ''} ${info.ape_materno || ''}`.trim();
                    $('#nombreDueno').val(nombre);
                } else {
                    Swal.fire('No encontrado', 'No se hallaron datos en RENIEC', 'info');
                }
            })
            .catch(() => Swal.fire('Error', 'Fallo al conectar con la API', 'error'))
            .finally(() => btn.prop('disabled', false).html(icon));
    });

    // --- BOTÓN NUEVO REGISTRO ---
    $('#btnNuevoServicio').click(() => {
        $('#formServicio')[0].reset();
        cargarTiposServicio();

        // Resetear el botón de tipo de servicio si se quedó en modo texto
        if(modoNuevoServicio) $('#btnAlternarTipo').click();

        modalServicio.show();
    });

    // --- GUARDAR SERVICIO ---
    $('#formServicio').submit(e => {
        e.preventDefault();

        // Obtener el tipo de servicio dependiendo de qué control está visible
        let tipoElegido = modoNuevoServicio ? $('#tipoServicioInput').val().trim() : $('#tipoServicioSelect').val();

        if (!tipoElegido) {
            Swal.fire('Atención', 'Debes ingresar un tipo de servicio', 'warning');
            return;
        }

        const data = {
            nombreMascota: $('#nombreMascota').val(),
            dniDueno: $('#dniDueno').val(),
            nombreDueno: $('#nombreDueno').val(),
            especie: $('#especie').val(),
            tipoServicio: tipoElegido,
            detallesExtra: $('#detallesExtra').val(),
            precio: $('#precio').val()
        };

        fetch(`${API_URL}/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(r => r.json())
        .then(res => {
            if(res.success) {
                modalServicio.hide();
                dataTable.ajax.reload();
                Swal.fire('Éxito', res.message, 'success');
            } else {
                Swal.fire('Error', res.message, 'error');
            }
        });
    });

    window.cambiarEstado = function(id, nuevoEstado) {
        fetch(`${API_URL}/cambiar-estado/${id}?nuevoEstado=${nuevoEstado}`, { method: 'POST' })
            .then(() => dataTable.ajax.reload());
    };
});