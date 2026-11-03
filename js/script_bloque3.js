
//* Lee los datos del forumario y los devuelve en un objeto
function readFormData(){
    const base = {};

    base.nombre = document.getElementById('nombre').value;
    
    const fechaSalida = document.getElementById('fechaSalida').value;
    const fechaVuelta = document.getElementById('fechaVuelta').value;

    if (fechaSalida === "" || fechaVuelta === "") {
        throw new Error("Las fechas son obligatorias.");
    }

    base.fechaSalida = validateDate(new Date(fechaSalida));
    base.fechaVuelta = validateDate(new Date(fechaVuelta));

    base.presupuesto = document.getElementById('presupuesto').value;
    base.transporte = document.getElementById('transporte').value;
    base.precioNoche = document.getElementById('precioNoche').value;
    base.gastoLaborable = document.getElementById('gastoLaborable').value;
    base.gastoFinSemana = document.getElementById('gastoFinSemana').value;
    
    return base;
}

//* Valida los datos del formulario
function validateFormData(data){
    if(data.nombre.trim() === "" || typeof data.nombre !== "string"){
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
    const presupuesto = Number(viajeInfo.presupuesto);
    const transporte = Number(viajeInfo.transporte);
    const precioNoche = Number(viajeInfo.precioNoche);
    const gastoLaborable = Number(viajeInfo.gastoLaborable);
    const gastoFinSemana = Number(viajeInfo.gastoFinSemana);

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
    if (saldo >= 0) {
        textoEstado.textContent = "El viaje está dentro del presupuesto.";
    } else {
        textoEstado.textContent = "El viaje supera el presupuesto.";
    }

    generarTablaDetalle(daysInfo, viajeInfo);
}   

//* Genera la tabla de detalle del viaje, mostrando los costes diarios y el acumulado.
function generarTablaDetalle(daysInfo, viajeInfo) {

    const tabla = document.getElementById('tablaDetalle');

    tabla.innerHTML = '';

    const precioNoche = Number(viajeInfo.precioNoche);
    const transporte = Number(viajeInfo.transporte);
    const gastoLaborable = Number(viajeInfo.gastoLaborable);
    const gastoFinSemana = Number(viajeInfo.gastoFinSemana);

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