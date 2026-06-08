document.addEventListener('DOMContentLoaded', function() {
    const selectMedico = document.getElementById('selectMedico');
    const seccionTablas = document.getElementById('seccionTablas');
    const btnGroupAcciones = document.getElementById('btnGroupAcciones');
    const seleccionVaciaAlert = document.getElementById('seleccionVaciaAlert');

    const modalHorario = new bootstrap.Modal(document.getElementById('modalHorario'));
    const modalPermiso = new bootstrap.Modal(document.getElementById('modalPermiso'));

    const diasSemanaMap = {
        1: "Lunes",
        2: "Martes",
        3: "Miércoles",
        4: "Jueves",
        5: "Viernes",
        6: "Sábado",
        7: "Domingo"
    };

    // 1. Cargar Veterinarios en el Select
    cargarVeterinarios();

    function cargarVeterinarios() {
        fetch('/usuarios/api/veterinarios')
            .then(r => r.json())
            .then(res => {
                selectMedico.innerHTML = '<option value="">-- Seleccione un médico --</option>';
                if (res.success && res.data) {
                    res.data.forEach(med => {
                        selectMedico.innerHTML += `<option value="${med.id}">Dr(a). ${med.nombre}</option>`;
                    });
                }
            })
            .catch(err => console.error("Error al cargar médicos:", err));
    }

    // 2. Evento Cambio de Médico
    selectMedico.addEventListener('change', function() {
        const vetId = this.value;
        if (!vetId) {
            seccionTablas.style.display = 'none';
            btnGroupAcciones.setAttribute('style', 'display: none !important;');
            seleccionVaciaAlert.style.display = 'block';
            return;
        }

        seccionTablas.style.display = 'block';
        btnGroupAcciones.setAttribute('style', 'display: flex !important;');
        seleccionVaciaAlert.style.display = 'none';

        cargarHorarios(vetId);
        cargarPermisos(vetId);
    });

    // 3. Gestión de Horarios Semanales
    function cargarHorarios(vetId) {
        const tbody = document.querySelector('#tablaHorarios tbody');
        const alertSin = document.getElementById('sinHorariosAlert');
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Cargando horarios...</td></tr>';
        alertSin.style.display = 'none';

        fetch(`/medicos/api/${vetId}/horarios`)
            .then(r => r.json())
            .then(data => {
                tbody.innerHTML = '';
                if (data && data.length > 0) {
                    // Ordenar por día de la semana
                    data.sort((a,b) => a.diaSemana - b.diaSemana);
                    data.forEach(h => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td class="fw-bold text-dark">${diasSemanaMap[h.diaSemana]}</td>
                            <td><span class="badge bg-light text-dark border">${h.horaInicio.substring(0, 5)}</span></td>
                            <td><span class="badge bg-light text-dark border">${h.horaFin.substring(0, 5)}</span></td>
                            <td>
                                <button class="btn btn-sm btn-outline-danger btn-eliminar-horario" data-id="${h.id}">
                                    <i class="bi bi-trash3-fill"></i>
                                </button>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });

                    // Añadir listener para eliminación
                    document.querySelectorAll('.btn-eliminar-horario').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const id = this.getAttribute('data-id');
                            confirmarEliminarHorario(id);
                        });
                    });
                } else {
                    tbody.innerHTML = '';
                    alertSin.style.display = 'block';
                }
            })
            .catch(err => {
                console.error(err);
                tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error al cargar horarios</td></tr>';
            });
    }

    function confirmarEliminarHorario(id) {
        Swal.fire({
            title: '¿Eliminar horario?',
            text: 'El médico dejará de estar disponible para citas en este bloque.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`/medicos/api/horarios/${id}`, { method: 'DELETE' })
                    .then(r => r.json())
                    .then(res => {
                        if (res.success) {
                            Swal.fire('Eliminado', res.message, 'success');
                            cargarHorarios(selectMedico.value);
                        } else {
                            Swal.fire('Error', res.message, 'error');
                        }
                    })
                    .catch(err => console.error(err));
            }
        });
    }

    // Modal nuevo horario
    document.getElementById('btnNuevoHorario').addEventListener('click', () => {
        document.getElementById('formHorario').reset();
        modalHorario.show();
    });

    document.getElementById('formHorario').addEventListener('submit', function(e) {
        e.preventDefault();
        const dia = document.getElementById('diaSemana').value;
        const inicio = document.getElementById('horaInicio').value;
        const fin = document.getElementById('horaFin').value;

        const payload = {
            veterinario: { id: selectMedico.value },
            diaSemana: parseInt(dia),
            horaInicio: inicio + ":00",
            horaFin: fin + ":00"
        };

        fetch('/medicos/api/horarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                modalHorario.hide();
                Swal.fire('Guardado', res.message, 'success');
                cargarHorarios(selectMedico.value);
            } else {
                Swal.fire('Error', res.message, 'error');
            }
        })
        .catch(err => console.error(err));
    });

    // 4. Gestión de Permisos / Ausencias
    function cargarPermisos(vetId) {
        const tbody = document.querySelector('#tablaPermisos tbody');
        const alertSin = document.getElementById('sinPermisosAlert');
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Cargando ausencias...</td></tr>';
        alertSin.style.display = 'none';

        fetch(`/medicos/api/${vetId}/permisos`)
            .then(r => r.json())
            .then(data => {
                tbody.innerHTML = '';
                if (data && data.length > 0) {
                    data.sort((a,b) => new Date(b.fechaInicio) - new Date(a.fechaInicio)); // Del más nuevo al antiguo
                    data.forEach(p => {
                        const tr = document.createElement('tr');
                        
                        const badgeClass = p.activo ? 'bg-success' : 'bg-secondary';
                        const badgeText = p.activo ? 'Activo' : 'Inactivo';
                        const toggleBtnIcon = p.activo ? 'bi-toggle2-on text-success' : 'bi-toggle2-off text-muted';
                        
                        const fInicio = formatearFecha(p.fechaInicio);
                        const fFin = formatearFecha(p.fechaFin);

                        tr.innerHTML = `
                            <td><small>${fInicio}</small></td>
                            <td><small>${fFin}</small></td>
                            <td><span class="text-dark fw-bold">${p.motivo}</span></td>
                            <td><span class="badge ${badgeClass}">${badgeText}</span></td>
                            <td>
                                <div class="d-flex gap-2">
                                    <button class="btn btn-sm btn-link fs-4 p-0 btn-toggle-permiso" data-id="${p.id}" title="Activar/Desactivar ausencia">
                                        <i class="bi ${toggleBtnIcon}"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger btn-eliminar-permiso" data-id="${p.id}">
                                        <i class="bi bi-trash3-fill"></i>
                                    </button>
                                </div>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });

                    // Listeners
                    document.querySelectorAll('.btn-toggle-permiso').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const id = this.getAttribute('data-id');
                            togglePermiso(id);
                        });
                    });
                    document.querySelectorAll('.btn-eliminar-permiso').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const id = this.getAttribute('data-id');
                            confirmarEliminarPermiso(id);
                        });
                    });
                } else {
                    tbody.innerHTML = '';
                    alertSin.style.display = 'block';
                }
            })
            .catch(err => {
                console.error(err);
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar ausencias</td></tr>';
            });
    }

    function togglePermiso(id) {
        fetch(`/medicos/api/permisos/${id}/toggle`, { method: 'POST' })
            .then(r => r.json())
            .then(res => {
                if (res.success) {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 2500,
                        icon: 'success',
                        title: res.message
                    });
                    cargarPermisos(selectMedico.value);
                } else {
                    Swal.fire('Error', res.message, 'error');
                }
            })
            .catch(err => console.error(err));
    }

    function confirmarEliminarPermiso(id) {
        Swal.fire({
            title: '¿Eliminar registro de ausencia?',
            text: 'El historial de esta ausencia se eliminará de forma permanente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`/medicos/api/permisos/${id}`, { method: 'DELETE' })
                    .then(r => r.json())
                    .then(res => {
                        if (res.success) {
                            Swal.fire('Eliminado', res.message, 'success');
                            cargarPermisos(selectMedico.value);
                        } else {
                            Swal.fire('Error', res.message, 'error');
                        }
                    })
                    .catch(err => console.error(err));
            }
        });
    }

    // Modal nuevo permiso
    document.getElementById('btnNuevoPermiso').addEventListener('click', () => {
        document.getElementById('formPermiso').reset();
        modalPermiso.show();
    });

    document.getElementById('formPermiso').addEventListener('submit', function(e) {
        e.preventDefault();
        const motivo = document.getElementById('motivo').value.trim();
        const inicio = document.getElementById('fechaInicio').value;
        const fin = document.getElementById('fechaFin').value;

        const payload = {
            veterinario: { id: selectMedico.value },
            motivo: motivo,
            fechaInicio: inicio + ":00",
            fechaFin: fin + ":00",
            activo: true
        };

        fetch('/medicos/api/permisos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                modalPermiso.hide();
                Swal.fire('Registrado', res.message, 'success');
                cargarPermisos(selectMedico.value);
            } else {
                Swal.fire('Error', res.message, 'error');
            }
        })
        .catch(err => console.error(err));
    });

    // Helper: formatear fecha de LocalDateTime a String amigable
    function formatearFecha(fechaStr) {
        if (!fechaStr) return '';
        // Reemplazar T con espacio y recortar segundos
        let formatted = fechaStr.replace('T', ' ');
        if (formatted.length > 16) {
            formatted = formatted.substring(0, 16);
        }
        return formatted;
    }
});
