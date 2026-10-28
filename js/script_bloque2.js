
var diesText = "4";
var pressupostText = "500";
var transportText = "120";
var preuNitText = "65";
var despesaLaborableText = "30";
var despesaCapSetmanaText = "45";

var diesNumber;
var pressupostNumber;
var transportNumber;
var preuNitNumber;
var despesaLaborableNumber;
var despesaCapSetmanaNumber;

const diasNoLaborables = 0;

//*  Validar els camps i convertir-los a nombres
function convertAndValidateText() {
    validateText(diesText);
    validateText(pressupostText);
    validateText(transportText);
    validateText(preuNitText);
    validateText(despesaLaborableText);
    validateText(despesaCapSetmanaText);

    diesNumber = validateDies();
    pressupostNumber = validatePrices(pressupostText);
    transportNumber = validatePrices(transportText);
    preuNitNumber = validatePrices(preuNitText);
    despesaLaborableNumber = validatePrices(despesaLaborableText);
    despesaCapSetmanaNumber = validatePrices(despesaCapSetmanaText);

    return {
        diesNumber,
        pressupostNumber,
        transportNumber,
        preNitNumber: preuNitNumber,
        despesaLaborableNumber,
        despesaCapSetmanaNumber
    };
}

function validateDies() {
    let diesNumber = Number(diesText);

    if (!Number.isFinite(diesNumber)) {
        throw new Error("Els dies han de ser numèrics.");
    }

    if (!Number.isInteger(diesNumber)) {
        throw new Error("Els dies han de ser un número sencer.");
    }

    if (diesNumber < 1 || diesNumber > 30) {
        throw new Error("Els dies han de ser un sencer de l'1 al 30.");
    }

    return diesNumber;
}

function validatePrices(price) {
    let priceNumber = Number(price);

    if (!Number.isFinite(priceNumber)) {
        throw new Error("L'import ha de ser un valor numèric.");
    }

    if (priceNumber < 0) {
        throw new Error("L'import no pot ser negatiu.");
    }

    return priceNumber;
}

function validateText(text) {
    if (text.trim() === "") {
        throw new Error("Escriu un text.");
    }

    return text.trim();
}

function calculateTotalPrice() {
    convertAndValidateText();

    let total = 0.0;
    //* Cálculo de noches
    let noches = Math.max(0, diesNumber - 1);
    let alojamiento = noches * preuNitNumber;

    //* Validación de diasNoLaborables
    if (!Number.isInteger(diasNoLaborables) || diasNoLaborables < 0 || diasNoLaborables > diesNumber) {
        throw new Error("El nombre de díes no laborables no es vàlid.");
    }

    //* Coste total
    let diasLaborables = diesNumber - diasNoLaborables;
    let despesaDiariaTotal = diasLaborables * despesaLaborableNumber + diasNoLaborables * despesaCapSetmanaNumber;
    total = transportNumber + alojamiento + despesaDiariaTotal;

    //* Saldo disponible y media por día
    let saldoDisponible = pressupostNumber - total;
    let mitjanaPerDia = total / diesNumber;

    //* Insuficient/Ajustado/Suficiente
    let resultado = "";
    if (saldoDisponible < 0) {
        resultado = "Insuficiente";
    }
    else if (saldoDisponible < pressupostNumber * 0.2) {
        resultado = "Ajustado";
    }
    else {
        resultado = "Suficiente";
    }

    return {
        noches,
        alojamiento,
        despesaDiariaTotal,
        total,
        saldoDisponible,
        mitjanaPerDia,
        resultado
    };

}

function generarDetallePorDia() {
    const detalle = [];
    let acumulado = 0;
    const diasLaborables = diesNumber - diasNoLaborables;

    for (let dia = 1; dia <= diesNumber; dia++) {
        const transporteDia = (dia === 1) ? transportNumber : 0;
        const alojamientoDia = (dia < diesNumber) ? preuNitNumber : 0;
        const esFinSemana = dia > diasLaborables;
        const gastoDia = esFinSemana ? despesaCapSetmanaNumber : despesaLaborableNumber;
        const costeDia = transporteDia + alojamientoDia + gastoDia;
        acumulado += costeDia;

        detalle.push({ dia, transporteDia, alojamientoDia, gastoDia, costeDia, acumulado });

        console.log(
            `Día ${dia}: transporte ${transporteDia} € | alojamiento ${alojamientoDia} € | ` +
            `gasto ${gastoDia} € | coste ${costeDia} € | acumulado ${acumulado} €`
        );
    }

    return detalle;
}

function comprobarDetalle(detalle, costeTotal) {
    const sumaDetalle = detalle[detalle.length - 1].acumulado;
    console.log(`Suma del detalle: ${sumaDetalle} € Coste total: ${costeTotal} € ¿Coincide?: ${sumaDetalle === costeTotal}`);
    return sumaDetalle === costeTotal;
}

const resumen = calculateTotalPrice();
console.log(resumen);

const detalle = generarDetallePorDia();
comprobarDetalle(detalle, resumen.total);

console.log(calculateTotalPrice());