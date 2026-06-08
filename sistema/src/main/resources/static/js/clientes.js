$(document).ready(function() {
    const API_URL = '/clientes/api';
    const modalCliente = new bootstrap.Modal(document.getElementById('modalCliente'));
    const modalHistorial = new bootstrap.Modal(document.getElementById('modalHistorial'));

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
                render: data => data ? new Date(data).toLocaleDateString('es-PE') : ''
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
                className: 'text-center',
                render: id => `
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary action-edit" data-id="${id}" title="Editar">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="eliminarCliente(${id})" title="Eliminar">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
                    </div>
                `
            }
        ],
        language: { url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json" }
    });

    $('#numeroDocumento').on('input', function() { this.value = this.value.replace(/[^0-9]/g, ''); });

    // Validar nombre completo/razón social en tiempo real (solo letras, espacios, acentos, ñ, diéresis, punto, coma y &)
    $('#nombreCompleto').on('input', function() {
        this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.,&]/g, '');
    });

    // Validar teléfono en tiempo real (solo números)
    $('#telefono').on('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    $('#btnBuscarDoc').click(function() {
        const tipoDoc = $('#tipoDocumento').val();
        const numDoc = $('#numeroDocumento').val().trim();

        if (tipoDoc === '1' && numDoc.length !== 8) return Swal.fire('Aviso', 'El DNI debe tener 8 dígitos', 'warning');
        if (tipoDoc === '6' && numDoc.length !== 11) return Swal.fire('Aviso', 'El RUC debe tener 11 dígitos', 'warning');

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
                    Swal.fire('No encontrado', 'Verifique el número ingresado en SUNAT/RENIEC.', 'info');
                }
            })
            .catch(() => Swal.fire('Error', 'Fallo al conectar con la API', 'error'));
    });

    $('#btnNuevoCliente').click(() => {
        $('#formCliente')[0].reset();
        $('#id').val('');
        modalCliente.show();
    });

    $('#tablaClientes tbody').on('click', '.action-edit', function() {
        const id = $(this).data('id');
        fetch(`${API_URL}/${id}`)
            .then(r => r.json())
            .then(res => {
                if (res.success) {
                    $('#id').val(res.data.id);
                    $('#tipoDocumento').val(res.data.tipoDocumento);
                    $('#numeroDocumento').val(res.data.numeroDocumento);
                    $('#nombreCompleto').val(res.data.nombreCompleto);
                    $('#telefono').val(res.data.telefono || '');
                    $('#correo').val(res.data.correo || '');
                    modalCliente.show();
                }
            });
    });

    $('#formCliente').submit(e => {
        e.preventDefault();
        const tipoDoc = $('#tipoDocumento').val();
        const numDoc = $('#numeroDocumento').val().trim();
        const nombre = $('#nombreCompleto').val().trim();
        const telf = $('#telefono').val().trim();

        // Validaciones antes de enviar
        if (tipoDoc === '1' && numDoc.length !== 8) {
            return Swal.fire('Atención', 'El DNI debe tener exactamente 8 dígitos.', 'warning');
        }
        if (tipoDoc === '6' && numDoc.length !== 11) {
            return Swal.fire('Atención', 'El RUC debe tener exactamente 11 dígitos.', 'warning');
        }

        const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.,&]+$/;
        if (!regexNombre.test(nombre)) {
            return Swal.fire('Atención', 'El Nombre Completo o Razón Social solo debe contener letras.', 'warning');
        }

        if (telf.length > 0 && telf.length < 7) {
            return Swal.fire('Atención', 'El número de teléfono debe tener al menos 7 dígitos.', 'warning');
        }

        const data = {
            id: $('#id').val() || null,
            tipoDocumento: tipoDoc,
            numeroDocumento: numDoc,
            nombreCompleto: nombre,
            telefono: telf,
            correo: $('#correo').val().trim()
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

    window.eliminarCliente = function(id) {
        Swal.fire({
            title: '¿Eliminar cliente?',
            text: "Se verificará que no tenga historial de ventas.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
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
                            Swal.fire('No permitido', res.message, 'error');
                        }
                    });
            }
        });
    };

    window.verHistorial = function(numDocumento, nombre) {
        $('#lblHistorialNombre').text(nombre);
        $('#tablaHistorialPetshop tbody').html('<tr><td colspan="4" class="text-center py-4"><span class="spinner-border text-primary"></span></td></tr>');
        $('#tablaHistorialPeluqueria tbody').html('<tr><td colspan="5" class="text-center py-4"><span class="spinner-border text-primary"></span></td></tr>');
        modalHistorial.show();

        fetch(`${API_URL}/historial/${numDocumento}`)
            .then(r => r.json())
            .then(res => {
                if(res.success) {
                    const tbodyPet = $('#tablaHistorialPetshop tbody');
                    tbodyPet.empty();
                    if(res.compras.length === 0) tbodyPet.html('<tr><td colspan="4" class="text-center text-muted py-3">No hay compras registradas</td></tr>');
                    else res.compras.forEach(v => {
                        let f = new Date(v.fechaEmision).toLocaleString('es-PE', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'});
                        tbodyPet.append(`<tr><td><small>${f}</small></td><td><span class="badge bg-secondary">${v.serie || 'TICK'}-${v.correlativo || '000'}</span></td><td class="fw-bold text-success">S/ ${v.total.toFixed(2)}</td><td><span class="badge ${v.estado === 'FACTURADO' ? 'bg-success' : 'bg-danger'}">${v.estado}</span></td></tr>`);
                    });

                    const tbodyPel = $('#tablaHistorialPeluqueria tbody');
                    tbodyPel.empty();
                    if(res.peluqueria.length === 0) tbodyPel.html('<tr><td colspan="5" class="text-center text-muted py-3">No hay atenciones de peluquería registradas</td></tr>');
                    else res.peluqueria.forEach(b => {
                        let f = new Date(b.fechaServicio).toLocaleString('es-PE', {day:'2-digit', month:'2-digit', year:'numeric'});
                        tbodyPel.append(`<tr><td><small>${f}</small></td><td class="fw-bold">${b.nombreMascota}</td><td>${b.tipoServicio}</td><td class="text-primary fw-bold">S/ ${b.precio.toFixed(2)}</td><td><span class="badge ${b.estado === 'TERMINADO' ? 'bg-success' : 'bg-info'}">${b.estado}</span></td></tr>`);
                    });
                }
            });
    };
});