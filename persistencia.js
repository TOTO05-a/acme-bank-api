const fs = require('fs');
const Cuenta = require('./Cuenta');

const rutaArchivo = './db.json'; // guardamos la ruta aqui para no escribirla en cada funcion

// Esta funcion carga las cuentas guardadas. Si el archivo no existe todavia
// (por ejemplo la primera vez que se corre el proyecto en otra maquina)
// devolvemos un arreglo vacio para que el programa pueda arrancar igual
function cargarCuentas() {
  if (!fs.existsSync(rutaArchivo)) {
    return [];
  }

  const contenido = fs.readFileSync(rutaArchivo, 'utf-8');
  const datos = JSON.parse(contenido);

  // Convertimos cada objeto plano del json en una instancia real de Cuenta,
  // sino no podriamos usar metodos como verificarClave o consignar
  return datos.cuentas.map((c) => Cuenta.crearDesdeDatos(c));
}

// Guarda el arreglo de cuentas en el archivo. La llamamos despues de cada
// operacion que cambie algo (crear cuenta, consignar, retirar, pagar)
function guardarCuentas(cuentas) {
  const datos = {
    cuentas: cuentas.map((c) => c.obtenerDatosParaGuardar())
  };

  fs.writeFileSync(rutaArchivo, JSON.stringify(datos, null, 2));
}

module.exports = { cargarCuentas, guardarCuentas };