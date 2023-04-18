// VARIABLES Y SELECTORES
const gastosUl = document.querySelector('#gastos ul');
const totalInput = document.querySelector('#total');
const restanteInput = document.querySelector('#restante');
const formulario = document.querySelector('#agregar-gasto');

const valorPresupuesto = document.querySelector('#presupuestoInput');
const modal = document.querySelector('#modalPresupuesto button');
const esconderBoton = document.querySelector('#botonIngresar');
const contenidoPrincipal = document.querySelector('.contenido-principal');


// EVENT LISTENERS
evenListeners();
function evenListeners() {
    valorPresupuesto.addEventListener('blur', ejecutarInput);
    modal.addEventListener('click', preguntarPresupuesto);
    formulario.addEventListener('submit', agregarGasto);

    document.addEventListener('DOMContentLoaded', () => {
        presupuesto = new Presupuesto();
        
        presupuesto.gastos = JSON.parse(localStorage.getItem('gastos')) || [];
        presupuesto.presupuesto = JSON.parse(localStorage.getItem('presupuesto'));
        presupuesto.restante = JSON.parse(localStorage.getItem('restante'));

        interfaz.mostrarGastoListado(presupuesto.gastos);
        interfaz.presupuesto({
            presupuesto: presupuesto.presupuesto,
            restante: presupuesto.restante
        });
        
        console.log("presupuesto",presupuesto);
        console.log("presupuesto",presupuesto.presupuesto);
        console.log("restante",presupuesto.restante);

    });
}

// CLASES
class Presupuesto {
    constructor(presupuesto) {
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    nuevoGasto(gasto) {
        this.gastos = [...this.gastos, gasto];
        this.nuevoRestante();

    }
    
    nuevoRestante() {
        const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidadGasto, 0);
        this.restante = this.presupuesto - gastado;

    }

    eliminarGasto(id) {
        this.gastos = this.gastos.filter(gasto => gasto.id !== id);
        this.nuevoRestante();
    }
}

class Interfaz {
    presupuesto(cantidad) {
        // const { presupuesto, restante } = cantidad;
        totalInput.textContent = cantidad.presupuesto;
        restanteInput.textContent = cantidad.restante;

        guardarLocalStorage();
    }

    imprimirAlerta(mensaje, tipo) {
        const div = document.createElement('DIV');
        const padreDiv = formulario.parentElement;
        div.classList.add('alert', 'text-center');

        if (tipo === 'error') {
            div.classList.add('alert-danger');
        } else {
            div.classList.add('alert-success');
        }
        div.textContent = mensaje;
        padreDiv.insertBefore(div, formulario);
        formulario.reset();
        setTimeout(() => {
            div.remove();

        }, 3000);
    }
    imprimirAlerta2(mensaje, tipo) {
        const div = document.createElement('DIV');
        const padreDiv = valorPresupuesto.parentElement;
        div.classList.add('alert', 'text-center');

        if (tipo === 'error') {
            div.classList.add('alert-danger', 'mt-2');
        } else {
            div.classList.add('alert-success', 'mt-2');
        }
        div.textContent = mensaje;
        padreDiv.appendChild(div);
        formulario.reset();
        setTimeout(() => {
            div.remove();

        }, 3000);
    }
    mostrarGastoListado(gastos) {
        this.eliminarGastosRepetidos();

        gastos.map(gasto => {
            const { nombre, cantidadGasto, id } = gasto;

            const li = document.createElement('li');
            const precio = document.createElement('span');
            const borrar = document.createElement('a');

            li.textContent = `${nombre}`;
            li.classList.add('rounded', 'border', 'p-3', 'd-flex', 'justify-content-between', 'align-items-center');
            li.dataset.id = id;

            precio.textContent = `$${cantidadGasto}`;
            precio.classList.add('badge', 'bg-primary', 'rounded-pill', 'text-white');
            borrar.textContent = 'Borrar';
            borrar.classList.add('btn', 'btn-danger', 'text-white');
            borrar.onclick = () => {
                eliminarGasto(id);
            }

            li.appendChild(precio);
            li.appendChild(borrar);
            gastosUl.appendChild(li);

            // return `${gasto.nombre} ${gasto.cantidadGasto}`;
        });
        guardarLocalStorage();
    }


    eliminarGastosRepetidos() {
        while (gastosUl.firstChild) {
            gastosUl.removeChild(gastosUl.firstChild);
        }
    }

    actualizarRestante(restante) {
        document.querySelector('#restante').textContent = restante;
    }

    comprobarPresupuesto(presupuestoObj) {
        const { presupuesto, restante } = presupuestoObj;
        const restanteDiv = document.querySelector('.restante');
        // comprobar 25%
        if ((presupuesto / 4) > restante) { // console.log("presupuesto ",presupuesto); // console.log("restante ",restante); // console.log('Gastaste más del 75%');
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        } else if ((presupuesto / 2) > restante) {
            restanteDiv.classList.remove('alert-success', 'alert-danger');
            restanteDiv.classList.add('alert-warning');
        } else {
            restanteDiv.classList.remove('alert-warning', 'alert-danger');
            restanteDiv.classList.add('alert-success');
        }

        // Si el total es 0 o menor
        if (restante <= 0) {
            interfaz.imprimirAlerta('El presupuesto se ha agotado', 'error');
            formulario.querySelector('button[type="submit"]').disabled = true;
        } else {
            formulario.querySelector('button[type="submit"]').disabled = false;
        }

        // guardarLocalStoragePresuResul(presupuestoObj);

    }
}

// Instanciar Interfaz
const interfaz = new Interfaz();

let presupuesto;
let valor;
// FUNCIONES
function preguntarPresupuesto(e) {
    e.preventDefault();
    presupuesto = new Presupuesto(valor);
     
    interfaz.presupuesto(presupuesto);
    contenidoPrincipal.classList.remove('d-none');
    contenidoPrincipal.classList.add('d-block');
    esconderBoton.classList.add('d-none');

}

function ejecutarInput(e) {
    // console.log(e.target.value);
    if (e.target.value === '' || e.target.value === null || isNaN(e.target.value) || e.target.value <= 0) {
        modal.removeAttribute("data-bs-dismiss");
        interfaz.imprimirAlerta2('Digite un valor coherente de tu presupuesto', 'error');
        return;
    }

    modal.setAttribute("data-bs-dismiss", "modal");
    valor = e.target.value
}

function agregarGasto(e) {
    e.preventDefault();
    const nombreGasto = document.querySelector('#gasto').value;
    const cantidad = Number(document.querySelector('#cantidad').value);

    if (nombreGasto === '' || cantidad === '') {
        interfaz.imprimirAlerta('Ambos campos son obligatorios', 'error');

    } else if (isNaN(cantidad) || cantidad <= 0) {
        interfaz.imprimirAlerta('Cantidad no válida', 'error');

    } else {
        interfaz.imprimirAlerta('Enviado con éxito', 'correcto');

        const listado = {
            id: Date.now(),
            nombre: nombreGasto,
            cantidadGasto: cantidad
        };

        presupuesto.nuevoGasto(listado);

        const { gastos, restante } = presupuesto;
        interfaz.mostrarGastoListado(gastos);
        interfaz.actualizarRestante(restante);
        interfaz.comprobarPresupuesto(presupuesto);
    }
}

function eliminarGasto(id) {
    // Los elimina del objeto
    presupuesto.eliminarGasto(id);

    // Los elimina del HTML
    const { gastos, restante } = presupuesto;
    interfaz.mostrarGastoListado(gastos);
    interfaz.actualizarRestante(restante);
    interfaz.comprobarPresupuesto(presupuesto);
}

function guardarLocalStorage() {
    // console.log("presupuestos gastos",presupuesto.gastos);
    const gastosLocalStorage = JSON.stringify(presupuesto.gastos);
    const presupuestoLocalStorage = JSON.stringify(presupuesto.presupuesto);
    const restanteStorage = JSON.stringify(presupuesto.restante);

    localStorage.setItem('gastos', gastosLocalStorage);
    localStorage.setItem('presupuesto', presupuestoLocalStorage);
    localStorage.setItem('restante', restanteStorage);
    
    if (presupuesto.gastos.length > 0) {
        contenidoPrincipal.classList.remove('d-none');
        contenidoPrincipal.classList.add('d-block');
        esconderBoton.classList.add('d-none');
    }
}
