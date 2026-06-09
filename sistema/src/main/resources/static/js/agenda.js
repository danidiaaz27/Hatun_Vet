document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const modalNuevaCita = new bootstrap.Modal(document.getElementById('modalNuevaCita'));
    const modalCheckIn = new bootstrap.Modal(document.getElementById('modalCheckIn'));

    let clientesList = [];
    let slotSeleccionado = null; // slot elegido por el usuario

    // 1. Inicializar FullCalendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        locale: 'es',
        slotMinTime: '00:00:00',
        slotMaxTime: '24:00:00',
        scrollTime: '08:00:00',
        allDaySlot: false,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: function(fetchInfo, successCallback, failureCallback) {
            fetch('/api/citas')
                .then(response => response.json())
                .then(data => {
                    let events = data.map(cita => {
                        let colorClass = 'bg-agendada';
                        if (cita.estado === 'EN_ESPERA')   colorClass = 'bg-espera';
                        if (cita.estado === 'EN_ATENCION') colorClass = 'bg-atencion';
                        if (cita.estado === 'FINALIZADA')  colorClass = 'bg-secondary';

                        let mascotaNombre = cita.mascota ? cita.mascota.nombre : 'Sin Mascota';
                        let duenoNombre = (cita.mascota && cita.mascota.cliente)
                            ? cita.mascota.cliente.nombreCompleto : 'Sin Dueño';
                        let titulo = `${mascotaNombre} (${duenoNombre}) - ${cita.motivoPrincipal}`;

                        return {
                            id: cita.id,
                            title: titulo,
                            start: cita.fechaHoraProgramada,
                            className: colorClass,
                            extendedProps: { estado: cita.estado }
                        };
                    });
                    successCallback(events);
                })
                .catch(error => failureCallback(error));
        },
        eventClick: function(info) {
            const estado = info.event.extendedProps.estado;
            if (estado === 'AGENDADA') {
                document.getElementById('citaIdCheckIn').value = info.event.id;
                document.getElementById('lblMotivoCheckIn').innerText = `Motivo: ${info.event.title}`;
                document.getElementById('checkAvisoCosto').checked = false;
                modalCheckIn.show();
            } else {
                Swal.fire('Información', `Esta cita ya se encuentra en estado: ${estado}`, 'info');
            }
        }
    });
    calendar.render();

    // 2. Cargar Médicos y Clientes al iniciar
    cargarMedicos();
    cargarClientes();

    function cargarMedicos() {
        fetch('/usuarios/api/veterinarios')
            .then(r => r.json())
            .then(res => {
                const select = document.getElementById('medicoId');
                select.innerHTML = '<option value="">-- Seleccione un Médico --</option>';
                if (res.success && res.data) {
                    res.data.forEach(med => {
                        select.innerHTML += `<option value="${med.id}">Dr(a). ${med.nombre}</option>`;
                    });
                } else {
                    select.innerHTML = '<option value="">Error al cargar médicos</option>';
                }
            })
            .catch(err => {
                console.error(err);
                document.getElementById('medicoId').innerHTML = '<option value="">Error al cargar médicos</option>';
            });
    }

    function cargarClientes() {
        fetch('/clientes/api/listar')
            .then(r => r.json())
            .then(res => { if (res.data) clientesList = res.data; })
            .catch(err => console.error("Error al precargar clientes:", err));
    }

    // 3. Autocompletado de Propietario
    const buscarDuenoInput       = document.getElementById('buscarDuenoInput');
    const resultadosBusquedaDueno = document.getElementById('resultadosBusquedaDueno');
    const duenoIdSeleccionado    = document.getElementById('duenoIdSeleccionado');
    const btnLimpiarDueno        = document.getElementById('btnLimpiarDueno');
    const mascotaSelect          = document.getElementById('mascotaId');

    buscarDuenoInput.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        resultadosBusquedaDueno.innerHTML = '';
        if (query.length < 2) { resultadosBusquedaDueno.style.display = 'none'; return; }

        const filtrados = clientesList.filter(c =>
            c.nombreCompleto.toLowerCase().includes(query) ||
            c.numeroDocumento.includes(query)
        );

        if (filtrados.length === 0) {
            resultadosBusquedaDueno.innerHTML = '<li class="autocomplete-suggestion-item text-muted">No se encontraron resultados</li>';
            resultadosBusquedaDueno.style.display = 'block';
            return;
        }

        filtrados.forEach(c => {
            const li = document.createElement('li');
            li.className = 'autocomplete-suggestion-item';
            li.innerHTML = `<strong>${c.nombreCompleto}</strong> <span class="text-muted small">(${c.numeroDocumento})</span>`;
            li.addEventListener('click', function() { seleccionarPropietario(c); });
            resultadosBusquedaDueno.appendChild(li);
        });
        resultadosBusquedaDueno.style.display = 'block';
    });

    document.addEventListener('click', function(e) {
        if (e.target !== buscarDuenoInput && e.target !== resultadosBusquedaDueno) {
            resultadosBusquedaDueno.style.display = 'none';
        }
    });

    function seleccionarPropietario(cliente) {
        buscarDuenoInput.value = `${cliente.nombreCompleto} (${cliente.numeroDocumento})`;
        duenoIdSeleccionado.value = cliente.id;
        buscarDuenoInput.disabled = true;
        btnLimpiarDueno.style.display = 'block';
        resultadosBusquedaDueno.style.display = 'none';
        cargarMascotasCliente(cliente.id);
    }

    btnLimpiarDueno.addEventListener('click', limpiarSeleccionPropietario);

    function limpiarSeleccionPropietario() {
        buscarDuenoInput.value = '';
        buscarDuenoInput.disabled = false;
        duenoIdSeleccionado.value = '';
        btnLimpiarDueno.style.display = 'none';
        mascotaSelect.innerHTML = '<option value="">-- Primero busque un dueño --</option>';
        mascotaSelect.disabled = true;
    }

    function cargarMascotasCliente(clienteId, mascotaIdSeleccionar = null) {
        mascotaSelect.innerHTML = '<option value="">Cargando mascotas...</option>';
        mascotaSelect.disabled = true;
        fetch(`/mascotas/api/cliente/${clienteId}`)
            .then(r => r.json())
            .then(res => {
                mascotaSelect.innerHTML = '';
                if (res.success && res.data && res.data.length > 0) {
                    res.data.forEach(m => {
                        const sel = (mascotaIdSeleccionar && m.id == mascotaIdSeleccionar) ? 'selected' : '';
                        mascotaSelect.innerHTML += `<option value="${m.id}" ${sel}>${m.nombre} (${m.especie} - ${m.raza || 'Sin raza'})</option>`;
                    });
                    mascotaSelect.disabled = false;
                } else {
                    mascotaSelect.innerHTML = '<option value="">El cliente no tiene mascotas registradas</option>';
                    mascotaSelect.disabled = true;
                }
            })
            .catch(err => {
                console.error(err);
                mascotaSelect.innerHTML = '<option value="">Error al cargar mascotas</option>';
            });
    }

    // 4. Registro Rápido
    const btnToggleRegistroRapido  = document.getElementById('btnToggleRegistroRapido');
    const seccionRegistroRapido    = document.getElementById('seccionRegistroRapido');
    const btnCancelarRegRapido     = document.getElementById('btnCancelarRegRapido');
    const btnCerrarRegRapidoHeader = document.getElementById('btnCerrarRegRapidoHeader');
    const btnGuardarRegRapido      = document.getElementById('btnGuardarRegRapido');

    btnToggleRegistroRapido.addEventListener('click', function() {
        limpiarSeleccionPropietario();
        seccionRegistroRapido.style.display = 'block';
        this.style.display = 'none';
    });

    function ocultarRegistroRapido() {
        seccionRegistroRapido.style.display = 'none';
        btnToggleRegistroRapido.style.display = 'block';
        ['regNumDoc','regNombreDueno','regTelefono','regCorreo',
         'regNombreMascota','regRaza','regFechaNac','regColor','regObservaciones']
            .forEach(id => { document.getElementById(id).value = ''; });
    }

    btnCancelarRegRapido.addEventListener('click', ocultarRegistroRapido);
    btnCerrarRegRapidoHeader.addEventListener('click', ocultarRegistroRapido);

    btnGuardarRegRapido.addEventListener('click', function() {
        const numDoc       = document.getElementById('regNumDoc').value.trim();
        const nombreDueno  = document.getElementById('regNombreDueno').value.trim();
        const nombreMascota = document.getElementById('regNombreMascota').value.trim();

        if (!numDoc || !nombreDueno || !nombreMascota) {
            Swal.fire('Atención', 'El documento del dueño, nombre del dueño y nombre de la mascota son obligatorios.', 'warning');
            return;
        }

        const regRazaVal    = document.getElementById('regRaza').value.trim();
        const regColorVal   = document.getElementById('regColor').value.trim();
        const regFechaNacVal = document.getElementById('regFechaNac').value;

        if (/[0-9]/.test(nombreMascota)) { Swal.fire('Atención', 'El nombre de la mascota no puede contener números.', 'warning'); return; }
        if (/[0-9]/.test(regRazaVal))    { Swal.fire('Atención', 'La raza no puede contener números.', 'warning'); return; }
        if (/[0-9]/.test(regColorVal))   { Swal.fire('Atención', 'El color no puede contener números.', 'warning'); return; }

        if (regFechaNacVal) {
            const dateNac = new Date(regFechaNacVal + 'T00:00:00');
            if (dateNac.getFullYear() < 2008) { Swal.fire('Atención', 'El año no puede ser menor a 2008.', 'warning'); return; }
            const today = new Date(); today.setHours(0,0,0,0);
            if (dateNac > today) { Swal.fire('Atención', 'La fecha no puede ser posterior a hoy.', 'warning'); return; }
        }

        const tipoDoc = document.getElementById('regTipoDoc').value;
        if (tipoDoc === "1" && numDoc.length !== 8)  { Swal.fire('Atención', 'El DNI debe tener 8 dígitos.', 'warning'); return; }
        if (tipoDoc === "6" && numDoc.length !== 11) { Swal.fire('Atención', 'El RUC debe tener 11 dígitos.', 'warning'); return; }

        const reqPayload = {
            tipoDocumento: tipoDoc,
            numeroDocumento: numDoc,
            nombreCompleto: nombreDueno,
            telefono: document.getElementById('regTelefono').value.trim() || null,
            correo: document.getElementById('regCorreo').value.trim() || null,
            nombreMascota,
            especie: document.getElementById('regEspecie').value,
            raza: document.getElementById('regRaza').value.trim() || null,
            sexo: document.getElementById('regSexo').value,
            fechaNacimiento: document.getElementById('regFechaNac').value || null,
            color: document.getElementById('regColor').value.trim() || null,
            observaciones: document.getElementById('regObservaciones').value.trim() || null
        };

        fetch('/mascotas/api/registro-rapido', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqPayload)
        })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                Swal.fire('Registrado', 'Cliente y mascota registrados con éxito.', 'success');
                cargarClientes();
                ocultarRegistroRapido();
                buscarDuenoInput.value = `${nombreDueno} (${numDoc})`;
                duenoIdSeleccionado.value = res.clienteId;
                buscarDuenoInput.disabled = true;
                btnLimpiarDueno.style.display = 'block';
                cargarMascotasCliente(res.clienteId, res.mascotaId);
            } else {
                Swal.fire('Error', res.message || 'Error al guardar registro rápido.', 'error');
            }
        })
        .catch(err => { console.error(err); Swal.fire('Error', 'Error en el servidor.', 'error'); });
    });

    // 5. SLOT PICKER — cargar horarios disponibles al cambiar médico o fecha
    function cargarSlots() {
        const medicoId = document.getElementById('medicoId').value;
        const fecha    = document.getElementById('fechaCita').value;
        const contenedor = document.getElementById('contenedorSlots');

        // Limpiar slot previo
        slotSeleccionado = null;
        document.getElementById('horaCita').value = '';
        contenedor.innerHTML = '';

        if (!medicoId || !fecha) return;

        contenedor.innerHTML = '<small class="text-muted"><span class="spinner-border spinner-border-sm me-1"></span> Cargando horarios...</small>';

        fetch(`/medicos/api/slots-disponibles?medicoId=${encodeURIComponent(medicoId)}&fecha=${fecha}`)
            .then(r => r.json())
            .then(res => {
                contenedor.innerHTML = '';
                if (!res.success || !res.slots || res.slots.length === 0) {
                    contenedor.innerHTML = '<small class="text-warning"><i class="bi bi-exclamation-triangle me-1"></i>El médico no tiene horario disponible ese día.</small>';
                    return;
                }
                res.slots.forEach(slot => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'slot-btn';
                    btn.textContent = slot;
                    btn.addEventListener('click', function() {
                        document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('active'));
                        this.classList.add('active');
                        slotSeleccionado = slot;
                        document.getElementById('horaCita').value = slot;
                    });
                    contenedor.appendChild(btn);
                });
            })
            .catch(() => {
                contenedor.innerHTML = '<small class="text-danger"><i class="bi bi-x-circle me-1"></i>Error al cargar horarios.</small>';
            });
    }

    document.getElementById('medicoId').addEventListener('change', cargarSlots);
    document.getElementById('fechaCita').addEventListener('change', cargarSlots);

    // 6. Guardar Nueva Cita
    document.getElementById('formNuevaCita').addEventListener('submit', function(e) {
        e.preventDefault();

        const fecha = document.getElementById('fechaCita').value;
        const hora  = document.getElementById('horaCita').value;

        if (!hora) {
            Swal.fire('Atención', 'Debe seleccionar un horario disponible.', 'warning');
            return;
        }

        const fechaHora = `${fecha}T${hora}:00`;

        const today = new Date(); today.setHours(0,0,0,0);
        const selectedDate = new Date(`${fecha}T00:00:00`);
        if (selectedDate < today) {
            Swal.fire('Atención', 'No se puede agendar una cita para un día anterior a hoy.', 'warning');
            return;
        }

        const mascotaVal = document.getElementById('mascotaId').value;
        const medicoVal  = document.getElementById('medicoId').value;

        if (!mascotaVal) { Swal.fire('Atención', 'Debe seleccionar una mascota válida.', 'warning'); return; }
        if (!medicoVal)  { Swal.fire('Atención', 'Debe seleccionar un médico veterinario.', 'warning'); return; }

        const payload = {
            mascota: { id: parseInt(mascotaVal) },
            veterinario: { id: medicoVal },
            fechaHoraProgramada: fechaHora,
            motivoPrincipal: document.getElementById('motivoCita').value
        };

        fetch('/api/citas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                modalNuevaCita.hide();
                calendar.refetchEvents();
                Swal.fire('Éxito', res.message, 'success');
                this.reset();
                limpiarSeleccionPropietario();
                ocultarRegistroRapido();
                document.getElementById('contenedorSlots').innerHTML = '';
                slotSeleccionado = null;
            } else {
                Swal.fire('Conflicto o Error', res.message, 'error');
            }
        })
        .catch(err => { console.error(err); Swal.fire('Error', 'No se pudo guardar la cita.', 'error'); });
    });

    // 7. Check-In
    document.getElementById('btnProcesarCheckIn').addEventListener('click', function() {
        if (!document.getElementById('checkAvisoCosto').checked) {
            Swal.fire('Atención', 'Debe confirmar que informó el costo base al cliente.', 'warning');
            return;
        }
        const idCita = document.getElementById('citaIdCheckIn').value;
        const btn = this;
        btn.disabled = true;
        btn.innerText = "Procesando...";

        fetch(`/api/citas/${idCita}/check-in`, { method: 'POST' })
            .then(r => r.json())
            .then(res => {
                btn.disabled = false;
                btn.innerText = "Marcar Llegada (Pasar a Espera)";
                if (res.success) {
                    modalCheckIn.hide();
                    calendar.refetchEvents();
                    Swal.fire('Check-in Exitoso', res.message, 'success');
                } else {
                    Swal.fire('Error', res.message, 'error');
                }
            })
            .catch(err => {
                btn.disabled = false;
                btn.innerText = "Marcar Llegada (Pasar a Espera)";
                console.error(err);
                Swal.fire('Error', 'No se pudo procesar el check-in.', 'error');
            });
    });

    // Filtros numéricos en campos de mascota
    $('#regNombreMascota, #regRaza, #regColor').on('input', function() {
        this.value = this.value.replace(/[0-9]/g, '');
    });

    // Fechas mínimas/máximas
    const todayStr = new Date().toISOString().split('T')[0];
    const fechaCitaEl = document.getElementById('fechaCita');
    if (fechaCitaEl) fechaCitaEl.setAttribute('min', todayStr);
    const regFechaNacEl = document.getElementById('regFechaNac');
    if (regFechaNacEl) regFechaNacEl.setAttribute('max', todayStr);
});