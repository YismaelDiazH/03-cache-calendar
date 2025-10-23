console.log('js/form.js cargado y ejecutado.');

document.addEventListener('DOMContentLoaded', () => {
    
    // Inicializar Select2
    try {
        $('#countrySelect').select2();
        console.log('Select2 inicializado.');
    } catch (e) {
        console.error('Fallo al inicializar Select2:', e);
    }

    // Lógica del formulario
    const form = document.getElementById('sampleForm');
    const messageEl = document.getElementById('form-message');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            messageEl.textContent = 'Formulario enviado (simulación). ¡Datos validados por JS!';
            messageEl.style.color = '#388e3c'; // Verde oscuro
        });
    }
});