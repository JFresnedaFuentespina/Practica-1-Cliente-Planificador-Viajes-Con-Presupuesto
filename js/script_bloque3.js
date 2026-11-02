function readFormData(){
    const base = {};

    base.nombre = document.getElementById('nombre').value;
    base.fechaSalida = document.getElementById('fechaSalida').value;
    base.fechaVuelta = document.getElementById('fechaVuelta').value;
    base.presupuesto = document.getElementById('presupuesto').value;
    base.transporte = document.getElementById('transporte').value;
    base.precioNoche = document.getElementById('precioNoche').value;
    base.gastoLaborable = document.getElementById('gastoLaborable').value;
    base.gastoFinSemana = document.getElementById('gastoFinSemana').value;
    
    return base;
}

function validateFormData(data){
    if(data.nombre.trim() === "" || typeof data.nombre !== "string"){
        throw new Error("El nombre no puede estar vacío y debe ser una cadena de texto.");
    }
}

const btnCalcular = document.getElementById('btnCalcular');

btnCalcular.addEventListener('click', (event) => {
    event.preventDefault();
    const data = readFormData();
    console.log(data);
});