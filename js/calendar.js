console.log('js/calendar.js cargado y ejecutado.');

document.addEventListener('DOMContentLoaded', () => {
    var calendarEl = document.getElementById('calendar');
    if (calendarEl) {
        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek'
            }
        });
        calendar.render();
        console.log('FullCalendar inicializado.');
    } else {
        console.error('No se encontró el elemento #calendar');
    }
});