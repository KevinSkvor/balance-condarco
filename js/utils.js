const MESES = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

const BLOQUES_LABEL = {
    ingreso:       'Ingresos',
    ingreso_extra: 'Ingresos Extras',
    blanco:        'Gastos en Blanco',
    negro:         'Gastos en Negro',
    personal:      'Gastos Personales de Familia'
};

function formatARS(n) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency', currency: 'ARS',
        minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(n || 0);
}

function getMesActual()  { return new Date().getMonth() + 1; }
function getAnioActual() { return new Date().getFullYear(); }

function getParams() {
    const p = new URLSearchParams(window.location.search);
    return {
        mes:  parseInt(p.get('mes'))  || getMesActual(),
        anio: parseInt(p.get('anio')) || getAnioActual()
    };
}

function setParams(mes, anio) {
    const url = new URL(window.location.href);
    url.searchParams.set('mes', mes);
    url.searchParams.set('anio', anio);
    window.history.pushState({}, '', url);
}

function showError(elId, msg) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
}
