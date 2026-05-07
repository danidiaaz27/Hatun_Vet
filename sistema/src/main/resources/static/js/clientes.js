$(document).ready(function() {
    const API_URL = '/clientes/api';
    const modalCliente = new bootstrap.Modal(document.getElementById('modalCliente'));
    const modalHistorial = new bootstrap.Modal(document.getElementById('modalHistorial'));

    // --- 1. Inicializar DataTable Principal ---
    let dataTable = $('#tablaClientes').DataTable({
        ajax: { url: `${API_URL}/listar`, dataSrc: 'data' },
        columns: [
            {
                data: null,
                render: row => `<strong>${row.numeroDocumento}</strong><br><small class="text-muted">${row.tipoDocumento === '1' ? 'DNI' : (row.tipoDocumento === '6' ? 'RUC' : 'CE/PAS')}</small>`
            },
            { data: 'nombreCompleto' },
            {
                data: null,
                render: row => {
                    let html = '';
                    if(row.telefono) html += `<div class="small"><i class="bi bi-whatsapp text-success"></i> ${row.telefono}</div>`;
                    if(row.correo) html += `<div class="small"><i class="bi bi-envelope"></i> ${row.correo}</div>`;
                    return html || '<span class="text-muted small">Sin datos</span>';
                }
            },
            {
                data: 'fechaRegistro',
                render: data => new Date(data).toLocaleDateString('es-PE')
            },
            {
                data: null,
                className: 'text-center',
                render: row => `
                    <button class="btn btn-sm btn-dark" onclick="verHistorial('${row.numeroDocumento}', '${row.nombreCompleto}')">
                        <i class="bi bi-clock-history me-1"></i> Ver Todo
                    </button>
                `
            },
            {
                data: 'id',
                render: id => `
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarCliente(${id})" title="Eliminar">
                        <i class="bi bi-trash3-fill"></i>
                    </button>
                `
            }
        ],
        language: { url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json" }
    });

    // --- 2. Lupa: Buscar en RENIEC/SUNAT ---
    $('#numeroDocumento').on('input', function() { this.value = this.value.replace(/[^0-9]/g, ''); });

    $('#btnBuscarDoc').click(function() {
        const tipoDoc = $('#tipoDocumento').val();
        const numDoc = $('#numeroDocumento').val().trim();

        if (tipoDoc === '1' && numDoc.length !== 8) return Swal.fire('Aviso', 'El DNI debe tener 8 dígitos', 'warning');
        if (tipoDoc === '6' && numDoc.length !== 11) return Swal.fire('Aviso', 'El RUC debe tener 11 dígitos', 'warning');

        const btn = $(this);
        const icon = btn.html();
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span>');

        // Reutilizamos el endpoint de ventas
        fetch(`/ventas/api/consultar-cliente?tipoDoc=${tipoDoc}&numero=${numDoc}`)
            .then(r => r.json())
            .then(res => {
                const info = res.datos || res.data;
                if (res.success && info) {
                    let nombre = tipoDoc === '1'
                        ? (info.nombre_completo || `${info.nombres} ${info.ape_paterno} ${info.ape_materno}`).trim()
                        : (info.nombre_o_razon_social || info.razon_social);
                    $('#nombreCompleto').val(nombre);
                } else {
                    Swal.fire('No encontrado', 'Verifique el número ingresado', 'info');
                }
            })
            .catch(() => Swal.fire('Error', 'Fallo al conectar con la API', 'error'))
            .finally(() => btn.prop('disabled', false).html(icon));
    });

    // --- 3. Guardar Cliente ---
    $('#btnNuevoCliente').click(() => {
        $('#formCliente')[0].reset();
        modalCliente.show();
    });

    $('#formCliente').submit(e => {
        e.preventDefault();
        const data = {
            tipoDocumento: $('#tipoDocumento').val(),
            numeroDocumento: $('#numeroDocumento').val(),
            nombreCompleto: $('#nombreCompleto').val(),
            telefono: $('#telefono').val(),
            correo: $('#correo').val()
        };

        fetch(`${API_URL}/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(r => r.json())
        .then(res => {
            if(res.success) {
                modalCliente.hide();
                dataTable.ajax.reload();
                Swal.fire('Éxito', res.message, 'success');
            } else {
                Swal.fire('Atención', res.message, 'warning');
            }
        });
    });

    // --- 4. Eliminar Cliente ---
    window.eliminarCliente = function(id) {
        Swal.fire({
            title: '¿Eliminar cliente?',
            text: "No podrás revertir esto.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${API_URL}/eliminar/${id}`, { method: 'DELETE' })
                    .then(r => r.json())
                    .then(res => {
                        if(res.success) {
                            dataTable.ajax.reload();
                            Swal.fire('Eliminado', 'Cliente eliminado', 'success');
                        } else {
                            Swal.fire('Error', res.message, 'error');
                        }
                    });
            }
        });
    };

    // --- 5. LA MAGIA: Cargar Historial 360 ---
    window.verHistorial = function(numDocumento, nombre) {
        $('#lblHistorialNombre').text(nombre);

        // Limpiar tablas previas
        $('#tablaHistorialPetshop tbody').html('<tr><td colspan="4" class="text-center py-4"><span class="spinner-border text-primary"></span></td></tr>');
        $('#tablaHistorialPeluqueria tbody').html('<tr><td colspan="5" class="text-center py-4"><span class="spinner-border text-primary"></span></td></tr>');

        modalHistorial.show();

        fetch(`${API_URL}/historial/${numDocumento}`)
            .then(r => r.json())
            .then(res => {
                if(res.success) {

                    // Llenar Compras (Petshop)
                    const tbodyPet = $('#tablaHistorialPetshop tbody');
                    tbodyPet.empty();
                    if(res.compras.length === 0) {
                        tbodyPet.html('<tr><td colspan="4" class="text-center text-muted py-3">No hay compras registradas</td></tr>');
                    } else {
                        res.compras.forEach(v => {
                            let f = new Date(v.fechaEmision).toLocaleString('es-PE', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'});
                            tbodyPet.append(`
                                <tr>
                                    <td><small>${f}</small></td>
                                    <td><span class="badge bg-secondary">${v.serie || 'TICK'}-${v.correlativo || '000'}</span></td>
                                    <td class="fw-bold text-success">S/ ${v.total.toFixed(2)}</td>
                                    <td><span class="badge ${v.estado === 'EMITIDO' ? 'bg-success' : 'bg-danger'}">${v.estado}</span></td>
                                </tr>
                            `);
                        });
                    }

                    // Llenar Peluquería
                    const tbodyPel = $('#tablaHistorialPeluqueria tbody');
                    tbodyPel.empty();
                    if(res.peluqueria.length === 0) {
                        tbodyPel.html('<tr><td colspan="5" class="text-center text-muted py-3">No hay atenciones de peluquería registradas</td></tr>');
                    } else {
                        res.peluqueria.forEach(b => {
                            let f = new Date(b.fechaServicio).toLocaleString('es-PE', {day:'2-digit', month:'2-digit', year:'numeric'});
                            tbodyPel.append(`
                                <tr>
                                    <td><small>${f}</small></td>
                                    <td class="fw-bold">${b.nombreMascota} <span class="text-muted small">(${b.especie})</span></td>
                                    <td>${b.tipoServicio}</td>
                                    <td class="text-primary fw-bold">S/ ${b.precio.toFixed(2)}</td>
                                    <td><span class="badge ${b.estado === 'TERMINADO' ? 'bg-success' : 'bg-info'}">${b.estado}</span></td>
                                </tr>
                            `);
                        });
                    }

                } else {
                    Swal.fire('Error', res.message, 'error');
                }
            })
            .catch(() => Swal.fire('Error', 'Fallo al conectar con el servidor', 'error'));
    };
});