function inicializarTablaCaja() {
    tablaCaja = $('#tablaCaja').DataTable({
        dom: 'rt',
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        },
        paging: false,
        ordering: false,
        buttons: [
            {
                extend: 'excelHtml5',
                text: '<i class="bi bi-file-earmark-excel"></i> Excel',
                className: 'btn btn-sm btn-success border-0 shadow-sm mx-1'
            },
            {
                extend: 'pdfHtml5',
                text: '<i class="bi bi-file-earmark-pdf"></i> PDF',
                className: 'btn btn-sm btn-danger border-0 shadow-sm'
            }
        ]
    });

    tablaCaja.buttons().container().appendTo('#botonesExportar');
}