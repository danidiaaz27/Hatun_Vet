function recargarTablaUsuarios() {
    dataTable.ajax.reload();
}

function iniciarToggleClave() {
    $('#btnToggleClave').click(function() {
        const input = $('#clave');
        const icon = $(this).find('i');

        if (input.attr('type') === 'password') {
            input.attr('type', 'text');
            icon.removeClass('bi-eye-fill').addClass('bi-eye-slash-fill');
            return;
        }

        input.attr('type', 'password');
        icon.removeClass('bi-eye-slash-fill').addClass('bi-eye-fill');
    });
}

function resetearIconoClave() {
    $('#btnToggleClave i')
        .removeClass('bi-eye-slash-fill')
        .addClass('bi-eye-fill');
}