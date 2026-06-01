$(document).ready(function() {
    const API_URL = '/mascotas/api';
    const CLIENTES_API_URL = '/clientes/api';

    const modalMascota = new bootstrap.Modal(document.getElementById('modalMascota'));
    const dt = $('#tablaMascotas').DataTable({
        data: [],
        columns: [
            {
                data: null,
                render: row => `
                    <div class="d-flex align-items-center gap-3">
                        <div class="avatar-pill">${(row.nombre || '?').charAt(0).toUpperCase()}</div>
                        <div>
                            <div class="fw-bold">${row.nombre || ''}</div>
                            <small class="text-muted">ID #${row.id}</small>
                        </div>
                    </div>
                `
            },
            {
                data: null,
                render: row => {
                    const especie = row.especie || 'Sin especie';
                    const raza = row.raza || 'Sin raza';
                    return `<div><span class="badge bg-light text-dark border">${especie}</span><div class="small text-muted mt-1">${raza}</div></div>`;
                }
            },
            {
                data: null,
                render: row => {
                    const cliente = row.cliente;
                    if (!cliente) return '<span class="text-muted small">Sin dueño vinculado</span>';
                    return `
                        <div>
                            <div class="fw-bold">${cliente.nombreCompleto || ''}</div>
                            <small class="text-muted">${cliente.numeroDocumento || ''}</small>
                        </div>
                    `;
                }
            },
            {
                data: null,
                render: row => {
                    const cliente = row.cliente;
                    if (!cliente) return '<span class="text-muted small">Sin contacto</span>';
                    let html = '';
                    if (cliente.telefono) html += `<div class="small"><i class="bi bi-whatsapp text-success me-1"></i>${cliente.telefono}</div>`;
                    if (cliente.correo) html += `<div class="small"><i class="bi bi-envelope me-1"></i>${cliente.correo}</div>`;
                    return html || '<span class="text-muted small">Sin contacto</span>';
                }
            },
            {
                data: 'estado',
                render: estado => {
                    const value = (estado || 'ACTIVA').toUpperCase();
                    const cls = value === 'ACTIVA' ? 'bg-success' : 'bg-secondary';
                    return `<span class="badge ${cls}">${value}</span>`;
                }
            },
            {
                data: 'fechaRegistro',
                render: value => `<small class="text-muted">${formatDate(value)}</small>`
            },
            {
                data: 'id',
                className: 'text-center',
                render: id => `
                    <div class="btn-group btn-group-sm">
                        <button type="button" class="btn btn-outline-primary btn-editar" data-id="${id}" title="Editar">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger btn-eliminar" data-id="${id}" title="Eliminar">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
                    </div>
                `
            }
        ],
        language: { url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' },
        paging: true,
        pageLength: 10,
        searching: false,
        lengthChange: false,
        info: false,
        ordering: false,
        responsive: true,
        autoWidth: false
    });

    let mascotasCache = [];
    let clientesCache = [];
    let filtroActual = '';

    function formatDate(value) {
        if (!value) return '';
        return new Date(value).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    function formatDateTime(value) {
        if (!value) return '';
        return new Date(value).toLocaleString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function normalizarTexto(texto) {
        return (texto || '').toString().trim();
    }

    function cargarMascotas(endpoint = `${API_URL}/listar`, etiquetaFiltro = 'Listado general') {
        $('#lblFiltroActivo').text(etiquetaFiltro);
        $('#tablaMascotas tbody').html('<tr><td colspan="7" class="text-center py-5"><span class="spinner-border text-primary"></span></td></tr>');

        fetch(endpoint)
            .then(r => r.json())
            .then(res => {
                mascotasCache = res.data || [];
                aplicarFiltroLocal();
                actualizarEstadisticas();
            })
            .catch(() => {
                mascotasCache = [];
                dt.clear().draw();
                $('#tablaMascotas tbody').html('<tr><td colspan="7" class="text-center text-danger py-4">No se pudo cargar la información</td></tr>');
            });
    }

    function aplicarFiltroLocal() {
        let data = mascotasCache.slice();
        const especie = normalizarTexto($('#filtroEspecie').val());

        if (especie) {
            data = data.filter(m => normalizarTexto(m.especie).toLowerCase() === especie.toLowerCase());
        }

        dt.clear().rows.add(data).draw();
    }

    function actualizarEstadisticas() {
        $('#statTotalMascotas').text(mascotasCache.length);
        $('#statConDueño').text(mascotasCache.filter(m => m.cliente && m.cliente.id).length);
    }

    function cargarClientesSeleccion() {
        return fetch(CLIENTES_API_URL + '/listar')
            .then(r => r.json())
            .then(res => {
                clientesCache = res.data || [];
                renderClientesSelect();
            })
            .catch(() => {
                clientesCache = [];
                renderClientesSelect();
            });
    }

    function renderClientesSelect() {
        const select = $('#clienteId');
        select.empty();
        select.append('<option value="">Sin seleccionar</option>');

        clientesCache.forEach(cliente => {
            const label = `${cliente.nombreCompleto || ''} - ${cliente.numeroDocumento || ''}`.trim();
            select.append(`<option value="${cliente.id}">${label}</option>`);
        });
    }

    function renderEspeciesFiltro() {
        const select = $('#filtroEspecie');
        const especies = [...new Set(mascotasCache.map(m => normalizarTexto(m.especie)).filter(Boolean))].sort();
        select.find('option:not(:first)').remove();
        especies.forEach(especie => select.append(`<option value="${especie}">${especie}</option>`));
    }

    function prepararFormulario(mascota = null) {
        $('#formMascota')[0].reset();
        $('#id').val('');
        $('#modoRegistro').val('existente');
        $('#clienteId').val('');
        $('#lblDuenoSeleccionado').text('Ninguno');
        $('#tabMascotaBtn').tab('show');

        if (mascota) {
            $('#id').val(mascota.id || '');
            $('#nombre').val(mascota.nombre || '');
            $('#especie').val(mascota.especie || '');
            $('#raza').val(mascota.raza || '');
            $('#sexo').val(mascota.sexo || '');
            $('#fechaNacimiento').val(mascota.fechaNacimiento ? String(mascota.fechaNacimiento).substring(0, 10) : '');
            $('#color').val(mascota.color || '');
            $('#observaciones').val(mascota.observaciones || '');
            $('#estado').val(mascota.estado || 'ACTIVA');

            if (mascota.cliente && mascota.cliente.id) {
                $('#clienteId').val(mascota.cliente.id);
                setLabelDuenoSeleccionado(mascota.cliente);
            }
        }

        const tabMascota = document.getElementById('tabMascotaBtn');
        if (tabMascota) {
            bootstrap.Tab.getOrCreateInstance(tabMascota).show();
        }
    }

    function setLabelDuenoSeleccionado(cliente) {
        if (!cliente) {
            $('#lblDuenoSeleccionado').text('Ninguno');
            return;
        }
        const descripcion = `${cliente.nombreCompleto || ''} · ${cliente.numeroDocumento || ''}`.trim();
        $('#lblDuenoSeleccionado').text(descripcion || 'Ninguno');
    }

    function obtenerMascotaDesdeFormulario() {
        const clienteId = normalizarTexto($('#clienteId').val());
        const cliente = clienteId ? { id: Number(clienteId) } : null;

        return {
            id: $('#id').val() ? Number($('#id').val()) : null,
            nombre: normalizarTexto($('#nombre').val()),
            especie: normalizarTexto($('#especie').val()),
            raza: normalizarTexto($('#raza').val()),
            sexo: normalizarTexto($('#sexo').val()),
            fechaNacimiento: $('#fechaNacimiento').val() || null,
            color: normalizarTexto($('#color').val()),
            observaciones: normalizarTexto($('#observaciones').val()),
            estado: normalizarTexto($('#estado').val()) || 'ACTIVA',
            cliente: cliente
        };
    }

    function enviarGuardar(data) {
        const url = data.id ? `${API_URL}/actualizar/${data.id}` : `${API_URL}/guardar`;
        const method = data.id ? 'PUT' : 'POST';

        return fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json());
    }

    function enviarRegistroRapido() {
        const payload = {
            clienteId: null,
            tipoDocumento: normalizarTexto($('#tipoDocumento').val()),
            numeroDocumento: normalizarTexto($('#numeroDocumento').val()),
            nombreCompleto: normalizarTexto($('#nombreCompleto').val()),
            telefono: normalizarTexto($('#telefono').val()),
            correo: normalizarTexto($('#correo').val()),
            nombreMascota: normalizarTexto($('#nombre').val()),
            especie: normalizarTexto($('#especie').val()),
            raza: normalizarTexto($('#raza').val()),
            sexo: normalizarTexto($('#sexo').val()),
            fechaNacimiento: $('#fechaNacimiento').val() || null,
            color: normalizarTexto($('#color').val()),
            observaciones: normalizarTexto($('#observaciones').val())
        };

        return fetch(`${API_URL}/registro-rapido`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(r => r.json());
    }

    function cerrarYRefrescar(mensaje) {
        modalMascota.hide();
        cargarMascotas(`${API_URL}/listar`, 'Listado general');
        cargarClientesSeleccion();
        Swal.fire('Éxito', mensaje, 'success');
    }

    function ejecutarBusqueda() {
        const valor = normalizarTexto($('#txtBusqueda').val());
        if (!valor) {
            filtroActual = '';
            cargarMascotas(`${API_URL}/listar`, 'Listado general');
            return;
        }

        filtroActual = valor;
        $('#lblFiltroActivo').text(`Búsqueda: ${valor}`);
        $('#tablaMascotas tbody').html('<tr><td colspan="7" class="text-center py-4"><span class="spinner-border text-primary"></span></td></tr>');

        fetch(`${API_URL}/buscar/${encodeURIComponent(valor)}`)
            .then(r => r.json())
            .then(res => {
                mascotasCache = res.data || [];
                renderEspeciesFiltro();
                aplicarFiltroLocal();
                actualizarEstadisticas();
            })
            .catch(() => {
                dt.clear().draw();
            });
    }

    $('#btnNuevaMascota').click(() => {
        prepararFormulario();
        cargarClientesSeleccion().finally(() => modalMascota.show());
    });

    $('#btnRecargar').click(() => {
        $('#txtBusqueda').val('');
        $('#filtroEspecie').val('');
        cargarMascotas(`${API_URL}/listar`, 'Listado general');
    });

    $('#btnBuscar').click(() => ejecutarBusqueda());
    $('#txtBusqueda').on('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            ejecutarBusqueda();
        }
    });

    $('#btnLimpiarFiltro').click(() => {
        $('#txtBusqueda').val('');
        $('#filtroEspecie').val('');
        filtroActual = '';
        cargarMascotas(`${API_URL}/listar`, 'Listado general');
    });

    $('#filtroEspecie').change(() => {
        if (!filtroActual) {
            aplicarFiltroLocal();
            actualizarEstadisticas();
        } else {
            aplicarFiltroLocal();
        }
    });

    $('#btnRefrescarClientes').click(() => {
        cargarClientesSeleccion().then(() => {
            Swal.fire('Actualizado', 'La lista de clientes fue refrescada.', 'success');
        });
    });

    $('#clienteId').change(function() {
        const selectedId = $(this).val();
        const cliente = clientesCache.find(c => String(c.id) === String(selectedId));
        setLabelDuenoSeleccionado(cliente || null);
    });

    $('#tablaMascotas tbody').on('click', '.btn-editar', function() {
        const id = $(this).data('id');
        fetch(`${API_URL}/${id}`)
            .then(r => r.json())
            .then(res => {
                if (res.success) {
                    prepararFormulario(res.data);
                    cargarClientesSeleccion().then(() => modalMascota.show());
                } else {
                    Swal.fire('Atención', res.message || 'Mascota no encontrada', 'warning');
                }
            })
            .catch(() => Swal.fire('Error', 'No se pudo cargar la mascota', 'error'));
    });

    $('#tablaMascotas tbody').on('click', '.btn-eliminar', function() {
        const id = $(this).data('id');
        Swal.fire({
            title: '¿Eliminar mascota?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar'
        }).then(result => {
            if (result.isConfirmed) {
                fetch(`${API_URL}/eliminar/${id}`, { method: 'DELETE' })
                    .then(r => r.json())
                    .then(res => {
                        if (res.success) {
                            Swal.fire('Eliminada', 'La mascota fue eliminada correctamente.', 'success');
                            cargarMascotas(`${API_URL}/listar`, 'Listado general');
                        } else {
                            Swal.fire('Atención', res.message || 'No se pudo eliminar', 'warning');
                        }
                    })
                    .catch(() => Swal.fire('Error', 'No se pudo eliminar la mascota', 'error'));
            }
        });
    });

    $('#formMascota').submit(function(e) {
        e.preventDefault();

        const id = $('#id').val().trim();
        const clienteId = normalizarTexto($('#clienteId').val());
        const tieneClienteExistente = clienteId !== '';
        const tieneRegistroRapido = !tieneClienteExistente && normalizarTexto($('#numeroDocumento').val()) && normalizarTexto($('#nombreCompleto').val());

        if (!tieneClienteExistente && !tieneRegistroRapido && !id) {
            Swal.fire('Atención', 'Selecciona un dueño existente o completa el registro rápido del dueño.', 'warning');
            return;
        }

        const mascotaBase = obtenerMascotaDesdeFormulario();

        if (!id && tieneRegistroRapido) {
            enviarRegistroRapido()
                .then(res => {
                    if (res.success) {
                        cerrarYRefrescar(res.message || 'Mascota registrada correctamente.');
                    } else {
                        Swal.fire('Atención', res.message || 'No se pudo registrar', 'warning');
                    }
                })
                .catch(() => Swal.fire('Error', 'No se pudo registrar la mascota', 'error'));
            return;
        }

        enviarGuardar(mascotaBase)
            .then(res => {
                if (res.success) {
                    cerrarYRefrescar(res.message || 'Mascota guardada correctamente.');
                } else {
                    Swal.fire('Atención', res.message || 'No se pudo guardar', 'warning');
                }
            })
            .catch(() => Swal.fire('Error', 'No se pudo guardar la mascota', 'error'));
    });

    // Auto cargar
    cargarClientesSeleccion();
    cargarMascotas(`${API_URL}/listar`, 'Listado general');
});
