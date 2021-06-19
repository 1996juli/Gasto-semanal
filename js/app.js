//VARIABLES Y SELECTORES
const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');

//Eventos 
eventListeners();
function eventListeners(){
    document.addEventListener("DOMContentLoaded", preguntarPresupuesto);

    formulario.addEventListener("submit", agregarGasto);
}

//Clases
class Presupuesto {
    constructor(presupuesto){
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    nuevoGasto(gasto){
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
    }

    calcularRestante(){
        const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0);
        this.restante = this.presupuesto - gastado;  
    }

    eliminarGasto(id){
        this.gastos = this.gastos.filter( gasto => gasto.id !== id);
        this.calcularRestante(); // si eliminamos un gasto nos va a retornar ese importe
    }

}

class UI {
    insertarPresupuesto(cantidad){
        //Extraer los valores
        const {presupuesto, restante} = cantidad; // cantidad es el valor colocado en el prompt , este valor se va a aseginar tanto a la variable presupuesto como restante
        //Agregar al HTML
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    imprimirAlerta(mensaje, tipo){
        //Crear el div
        const divMensaje = document.createElement("div");
        divMensaje.classList.add("text-center", "alert");

        if(tipo === "error"){
            divMensaje.classList.add("alert-danger"); //fondo rojo
        } else {
            divMensaje.classList.add("alert-success"); //fondo verde
        }

        //Mensaje de error
        divMensaje.textContent = mensaje;

        //Insertar en el HTML
        document.querySelector(".primario").insertBefore(divMensaje, formulario);

        //Quitar el mensaje 
        setTimeout(()=>{
            divMensaje.remove();
        },3000)

    }

    mostrarGastos(gastos){            
        this.limpiarHTML(); //Elimina el HTML previo
        //Iterar sobre los gastos
        gastos.forEach( gasto =>{
            const {cantidad, nombre, id} = gasto;

            //Crear un li
            const nuevoGasto = document.createElement("LI");
            nuevoGasto.className = "list-group-item d-flex justify-content-between align-items-center";
            nuevoGasto.dataset.id = id;

            //Agregar el HTML del gasto
            nuevoGasto.innerHTML = ` ${nombre} <span class="badge badge-primary badge-pill"> $ ${cantidad} </span>`;

            //Boton para borrar el gasto
            const btnBorrar = document.createElement("button");
            btnBorrar.innerHTML = "Borrar &times"; // &times --> entidad html que muestra una X
            btnBorrar.classList.add("btn", "btn-danger", "borrar-gasto");
            btnBorrar.onclick = () =>{
                eliminarGasto(id);
            }
            nuevoGasto.appendChild(btnBorrar);

            //Agregar em HTML
            gastoListado.appendChild(nuevoGasto);
        })
    }

    actualizarRestante(restante){
        document.querySelector('#restante').textContent = restante;
    }

    limpiarHTML(){
        while (gastoListado.firstChild){
            gastoListado.removeChild(gastoListado.firstChild);
        }
    }

    comprobarPresupuesto(presupuestoObj){ //porq presupuesto es global.
        const { presupuesto, restante} = presupuestoObj;

        const restanteDiv = document.querySelector(".restante");

        //Comprobar 25%
        if((presupuesto / 4) > restante){
            restanteDiv.classList.remove("alert-success", "alert-warning");
            restanteDiv.classList.add("alert-danger");
        } else if ( (presupuesto / 2 ) > restante){
            restanteDiv.classList.remove("alert-success");
            restanteDiv.classList.add("alert-warning");
        } else {
            restanteDiv.classList.remove("alert-danger", "alert-warning");
            restanteDiv.classList.add("alert-success");
        }


        if(restante <= 0){
            const error = ui.imprimirAlerta("El presupuesto se ha agotado", "error");
            formulario.querySelector('button[type="submit"]').disabled = true; // si no hay mas presupuesto se inhabilite el boton
        }
        
        formulario.querySelector('button[type="submit"]').disabled = false;
    }
}

//Instanciar

const ui = new UI();
let presupuesto;


//Funciones
function preguntarPresupuesto(){
    const presupuestoUsuario = prompt("¿Cual es tu presupuesto?");
    console.log(Number(presupuestoUsuario));

    if(presupuestoUsuario === "" || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0){
        window.location.reload();
    }

    presupuesto = new Presupuesto(presupuestoUsuario);
    
    ui.insertarPresupuesto(presupuesto);
}

//Añade gastos
function agregarGasto(e){
    e.preventDefault();

    //Leer los datos del formulario
    const nombre = document.querySelector("#gasto").value;
    const cantidad = Number(document.querySelector("#cantidad").value);

    //Validar
    if(nombre === "" || cantidad === ""){
        ui.imprimirAlerta("Ambos campos son obligatorios", "error");
        return;
    } else if (cantidad <= 0 || isNaN(cantidad)) {
        ui.imprimirAlerta("Cantidad no valida", "error");
        return;
    } 

    //Generar un objeto con el gasto
    const gasto = {nombre, cantidad, id: Date.now()}

    //Añade un nuevo gasto
    presupuesto.nuevoGasto(gasto);
    //Mensaje todo correcto
    ui.imprimirAlerta("Gasto agregado correctamente");

    //Imprimir los gastos
    const {gastos, restante} = presupuesto; //se extrae de nuestro objeto solo los gastos
    ui.mostrarGastos(gastos);

    ui.actualizarRestante(restante); //Mostrar el resto que queda del presupuesto

    ui.comprobarPresupuesto(presupuesto); //clasificar segun el valor del presup en rojo / amarrillo o verde

    //Reinicia formulario
    formulario.reset();
}

function eliminarGasto(id){
    //elimina el id de la clase
    presupuesto.eliminarGasto(id);
    const { gastos , restante} = presupuesto; 
    ui.mostrarGastos(gastos); // se crea nuevamente el html con un nuevo arreglo sin el id que deseamos eliminar
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);
}

