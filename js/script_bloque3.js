//* Lee los datos del forumario y los devuelve en un objeto
function readFormData(){
    const base = {};

    base.nombre = document.getElementById('nombre').value;
    
    const fechaSalida = document.getElementById('fechaSalida').value;
    const fechaVuelta = document.getElementById('fechaVuelta').value;

    if (fechaSalida === "" || fechaVuelta === "") {
        showError("Las fechas son obligatorias.");
        throw new Error("Las fechas son obligatorias.");
    }

    base.fechaSalida = validateDate(new Date(fechaSalida));
    base.fechaVuelta = validateDate(new Date(fechaVuelta));

    base.presupuesto = validateNumber(document.getElementById('presupuesto').value, "Presupuesto");
    base.transporte = validateNumber(document.getElementById('transporte').value, "Transporte");
    base.precioNoche = validateNumber(document.getElementById('precioNoche').value, "Precio por noche");
    base.gastoLaborable = validateNumber(document.getElementById('gastoLaborable').value, "Gasto laborable");
    base.gastoFinSemana = validateNumber(document.getElementById('gastoFinSemana').value, "Gasto fin de semana");

    return base;
}

function validateNumber(value, fieldName = "Campo") {
    if(value.trim() === "") {
        showError(`El ${fieldName} no puede estar vacío.`);
        throw new Error(`El ${fieldName} no puede estar vacío.`);
    }

    const numero = Number(value);

    if(!Number.isFinite(numero)){
        showError(`El ${fieldName} debe ser un número válido.`);
        throw new Error(`El ${fieldName} debe ser un número válido.`);
    }

    if(numero < 0) {
        showError(`El ${fieldName} no puede ser negativo.`);
        throw new Error(`El ${fieldName} no puede ser negativo.`);
    }

    return numero;
}

//* Valida los datos del formulario
function validateFormData(data){
    if(data.nombre.trim() === "" || typeof data.nombre !== "string"){
        showError("El nombre no puede estar vacío y debe ser una cadena de texto.");
        throw new Error("El nombre no puede estar vacío y debe ser una cadena de texto.");
    }
}

//* Valida que la fecha sea un objeto Date válido
function validateDate(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error("La fecha no es válida.");
    }

    return date;
}

//* Calcula los días entre dos fechas, incluyendo el día de salida y el día de vuelta.
function calculateDaysBetweenDates(startDate, endDate){
    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if(end < start){
        throw new Error("La fecha de vuelta no puede ser anterior a la fecha de salida.");
    }

    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const days = Math.floor((end - start) / MS_PER_DAY) + 1; // +1 para incluir el día de salida y el día de vuelta

    if(days > 30){
        throw new Error("El viaje no puede durar más de 30 días.");
    }

    let saturdayCount = 0;
    let sundayCount = 0;

    const currentDate = new Date(start);
    while(currentDate <= end) {
        const day = currentDate.getDay();
        if(day === 6) {
            saturdayCount++;
        } else if(day === 0) {
            sundayCount++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return {days, nights: days - 1, saturdayCount, sundayCount};
}

//* Calcula el coste total del viaje y actualiza la interfaz con los resultados.
function calcularViaje(daysInfo, viajeInfo){
    const presupuesto = viajeInfo.presupuesto;
    const transporte = viajeInfo.transporte;
    const precioNoche = viajeInfo.precioNoche;
    const gastoLaborable = viajeInfo.gastoLaborable;
    const gastoFinSemana = viajeInfo.gastoFinSemana;

    const laborables = daysInfo.days - daysInfo.saturdayCount - daysInfo.sundayCount;

    const costeTransporte = transporte;
    const costeAlojamiento = precioNoche * daysInfo.nights;
    const costeDiario = (laborables * gastoLaborable) + (daysInfo.saturdayCount * gastoFinSemana) + (daysInfo.sundayCount * gastoFinSemana);

    const costeTotal = costeTransporte + costeAlojamiento + costeDiario;

    const saldo = presupuesto - costeTotal;
    const mediaDiaria = costeTotal / daysInfo.days;

    //* Mostrar resultados
    document.getElementById('resultado').hidden = false;

    document.getElementById('totalDias').textContent = daysInfo.days;
    document.getElementById('totalNoches').textContent = daysInfo.nights;
    document.getElementById('totalPresupuesto').textContent = `${presupuesto.toFixed(2)} €`;
    document.getElementById('totalCoste').textContent = `${costeTotal.toFixed(2)} €`;
    document.getElementById('totalSaldo').textContent = `${saldo.toFixed(2)} €`;
    document.getElementById('mediaDia').textContent = `${mediaDiaria.toFixed(2)} €`;
    
    const textoEstado = document.getElementById('textoEstado');
    if (saldo < 0) {
        textoEstado.textContent = "El viaje supera el presupuesto.";
    } 
    else if (costeTotal >= presupuesto * 0.8) {
        textoEstado.textContent = "Presupuesto ajustado.";
    }
    else {
        textoEstado.textContent = "El viaje está dentro del presupuesto.";
    }

    generarTablaDetalle(daysInfo, viajeInfo);
}

function showError(message){
    alert(message);
}

//* Genera la tabla de detalle del viaje, mostrando los costes diarios y el acumulado.
function generarTablaDetalle(daysInfo, viajeInfo) {

    const tabla = document.getElementById('tablaDetalle');

    tabla.innerHTML = '';

    const precioNoche = viajeInfo.precioNoche;
    const transporte = viajeInfo.transporte;
    const gastoLaborable = viajeInfo.gastoLaborable;
    const gastoFinSemana = viajeInfo.gastoFinSemana;

    const currentDate = toUTCDate(viajeInfo.fechaSalida);

    let acumulado = 0;

    for (let i = 0; i < daysInfo.days; i++) {

        const diaSemana = currentDate.getUTCDay();
        const esFinSemana = diaSemana === 0 || diaSemana === 6;

        const tipoDia = esFinSemana
            ? 'Fin de semana'
            : 'Laborable';

        const gastoDiario = esFinSemana
            ? gastoFinSemana
            : gastoLaborable;

        const costeTransporte = i === 0 ? transporte : 0;

        const costeAlojamiento = i < daysInfo.nights
            ? precioNoche
            : 0;

        const costeDia =
            costeTransporte +
            costeAlojamiento +
            gastoDiario;

        acumulado += costeDia;

        //* Formatear fecha
        const fecha = currentDate.toLocaleDateString('es-ES', {
            timeZone: 'UTC'
        });

        const fila = document.createElement('tr');

        const valores = [
            i + 1,
            fecha,
            tipoDia,
            `${costeTransporte.toFixed(2)} €`,
            `${costeAlojamiento.toFixed(2)} €`,
            `${gastoDiario.toFixed(2)} €`,
            `${costeDia.toFixed(2)} €`,
            `${acumulado.toFixed(2)} €`
        ];

        valores.forEach(valor => {
            const celda = document.createElement('td');
            celda.textContent = valor;
            fila.appendChild(celda);
        });

        tabla.appendChild(fila);

        //* Avanzar un día de calendario UTC
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
}

function toUTCDate(date) {
    return new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    ));
}

//* Evento de click del botón "Calcular"
const btnCalcular = document.getElementById('btnCalcular');
btnCalcular.addEventListener('click', (event) => {
    event.preventDefault();

    const data = readFormData();
    validateFormData(data);
    
    const daysInfo = calculateDaysBetweenDates(data.fechaSalida, data.fechaVuelta);
    calcularViaje(daysInfo, data);
});

const CLAVE_STORAGE = 'planificadorViajes.planificacion';
const CAMPOS = [
    'nombre', 'fechaSalida', 'fechaVuelta', 'presupuesto',
    'transporte', 'precioNoche', 'gastoLaborable', 'gastoFinSemana'
];

let ultimoCalculo = null;
let datosModificados = false;
let contadorCalculos = 0;

const formViaje = document.getElementById('formViaje');
const seccionResultado = document.getElementById('resultado');

function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = texto;
    mensaje.classList.remove('error', 'success-message');
    if (tipo === 'error') mensaje.classList.add('error');
    if (tipo === 'ok') mensaje.classList.add('success-message');
}

formViaje.addEventListener('click', (event) => {
    if (event.target !== btnCalcular) return;
    seccionResultado.hidden = true;
    document.getElementById('tablaDetalle').innerHTML = '';
    mostrarMensaje('', '');
}, true);

formViaje.addEventListener('click', (event) => {
    if (event.target !== btnCalcular) return;

    if (seccionResultado.hidden) {
        ultimoCalculo = null;
        mostrarMensaje('Los datos no son válidos. Revisa el formulario y vuelve a calcular.', 'error');
        return;
    }

    contadorCalculos++;
    ultimoCalculo = crearInstantanea();
    datosModificados = false;
    mostrarMensaje(`Cálculo nº ${ultimoCalculo.numero} realizado correctamente.`, 'ok');
});

function crearInstantanea() {
    const campos = {};
    for (const id of CAMPOS) {
        campos[id] = document.getElementById(id).value;
    }

    const texto = (id) => document.getElementById(id).textContent;

    const filas = [];
    document.querySelectorAll('#tablaDetalle tr').forEach(tr => {
        const celdas = [];
        tr.querySelectorAll('td').forEach(td => celdas.push(td.textContent));
        filas.push(celdas);
    });

    return {
        numero: contadorCalculos,
        hechoEl: new Date(),             
        campos,
        resumen: {
            dias: texto('totalDias'),
            noches: texto('totalNoches'),
            presupuesto: texto('totalPresupuesto'),
            coste: texto('totalCoste'),
            saldo: texto('totalSaldo'),
            media: texto('mediaDia'),
            estado: texto('textoEstado')
        },
        filas
    };
}

formViaje.addEventListener('input', () => {
    datosModificados = true;
});

//* Guardar y Obrir resum solo funcionan con un cálculo válido y al día.
function hayCalculoVigente() {
    if (ultimoCalculo === null) {
        mostrarMensaje('Primero tienes que calcular una planificación válida.', 'error');
        return false;
    }
    if (datosModificados) {
        mostrarMensaje('Has modificado los datos. Pulsa Calcular antes de continuar.', 'error');
        return false;
    }
    return true;
}

document.getElementById('btnGuardar').addEventListener('click', () => {
    if (!hayCalculoVigente()) return;

    const paquete = {
        version: 1,
        guardadoEl: new Date().toISOString(),
        campos: ultimoCalculo.campos
    };

    try {
        localStorage.setItem(CLAVE_STORAGE, JSON.stringify(paquete));
        mostrarMensaje(`Planificación "${ultimoCalculo.campos.nombre.trim()}" guardada.`, 'ok');
    }
    catch (error) {
        mostrarMensaje('No se puede acceder al almacenamiento del navegador. No se ha guardado.', 'error');
    }
});

document.getElementById('btnRecuperar').addEventListener('click', () => {
    let texto;
    try {
        texto = localStorage.getItem(CLAVE_STORAGE);
    }
    catch (error) {
        mostrarMensaje('No se puede acceder al almacenamiento del navegador.', 'error');
        return;
    }

    if (texto === null) {
        mostrarMensaje('No hay ninguna planificación guardada.', '');
        return;
    }

    let paquete;
    try {
        paquete = JSON.parse(texto);
    }
    catch (error) {
        mostrarMensaje('El contenido guardado está dañado (no es JSON válido). Puedes borrarlo con "Esborrar desat".', 'error');
        return;
    }

    if (!esPaqueteValido(paquete)) {
        mostrarMensaje('El contenido guardado no tiene el formato esperado. Puedes borrarlo con "Esborrar desat".', 'error');
        return;
    }

    for (const id of CAMPOS) {
        document.getElementById(id).value = paquete.campos[id];
    }

    //* Validamos y recalculamos
    btnCalcular.click();

    if (ultimoCalculo === null) {
        mostrarMensaje('El contenido guardado no es válido: no supera la validación.', 'error');
    } else {
        mostrarMensaje(`Planificación "${paquete.campos.nombre.trim()}" recuperada y recalculada (cálculo nº ${ultimoCalculo.numero}).`, 'ok');
    }
});

//* Comprueba que el objeto tiene la forma que nosotros guardamos.
function esPaqueteValido(paquete) {
    if (typeof paquete !== 'object' || paquete === null) return false;
    if (typeof paquete.campos !== 'object' || paquete.campos === null) return false;
    return CAMPOS.every(id => typeof paquete.campos[id] === 'string');
}

document.getElementById('btnBorrar').addEventListener('click', () => {
    try {
        if (localStorage.getItem(CLAVE_STORAGE) === null) {
            mostrarMensaje('No había ninguna planificación guardada.', '');
            return;
        }
        localStorage.removeItem(CLAVE_STORAGE);
        mostrarMensaje('Planificación guardada eliminada.', 'ok');
    }
    catch (error) {
        mostrarMensaje('No se puede acceder al almacenamiento del navegador.', 'error');
    }
});

document.getElementById('btnResumen').addEventListener('click', () => {
    if (!hayCalculoVigente()) return;

    const ventana = window.open('', '_blank');

    //* Si el navegador bloquea la ventana, window.open devuelve null
    if (ventana === null) {
        mostrarMensaje('El navegador ha bloqueado la ventana del resumen. Permite las ventanas emergentes y vuelve a intentarlo.', 'error');
        return;
    }

    pintarResumen(ventana.document, ultimoCalculo);
    mostrarMensaje(`Resumen del cálculo nº ${ultimoCalculo.numero} abierto en otra pestaña.`, 'ok');
});

//* Construye la página dentro del document de la ventana nueva.
function pintarResumen(doc, calculo) {
    const c = calculo.campos;
    const r = calculo.resumen;

    const añadir = (padre, etiqueta, texto) => {
        const el = doc.createElement(etiqueta);
        if (texto !== undefined) el.textContent = texto;
        padre.appendChild(el);
        return el;
    };

    const fecha = (iso) => new Date(iso).toLocaleDateString('es-ES', { timeZone: 'UTC' });

    doc.title = `Resumen - ${c.nombre.trim()}`;
    doc.body.style.fontFamily = 'Arial, sans-serif';
    doc.body.style.margin = '30px';

    añadir(doc.body, 'h1', c.nombre.trim());
    añadir(doc.body, 'p', `Cálculo nº ${calculo.numero}, hecho el ${calculo.hechoEl.toLocaleString('es-ES')}`);
    añadir(doc.body, 'p', `Del ${fecha(c.fechaSalida)} al ${fecha(c.fechaVuelta)}`);

    añadir(doc.body, 'h2', 'Resumen');
    const lista = añadir(doc.body, 'ul');
    añadir(lista, 'li', `Días: ${r.dias}`);
    añadir(lista, 'li', `Noches: ${r.noches}`);
    añadir(lista, 'li', `Presupuesto: ${r.presupuesto}`);
    añadir(lista, 'li', `Coste total: ${r.coste}`);
    añadir(lista, 'li', `Saldo disponible: ${r.saldo}`);
    añadir(lista, 'li', `Media por día: ${r.media}`);
    añadir(lista, 'li', `Estado: ${r.estado}`);

    añadir(doc.body, 'h2', 'Detalle');
    const tabla = añadir(doc.body, 'table');
    tabla.border = '1';
    tabla.cellPadding = '6';
    tabla.style.borderCollapse = 'collapse';

    const cabecera = añadir(tabla, 'tr');
    ['Día', 'Fecha', 'Tipo de día', 'Transporte', 'Alojamiento', 'Gasto diario', 'Coste del día', 'Acumulado']
        .forEach(t => añadir(cabecera, 'th', t));

    calculo.filas.forEach(celdas => {
        const tr = añadir(tabla, 'tr');
        celdas.forEach(t => añadir(tr, 'td', t));
    });
}