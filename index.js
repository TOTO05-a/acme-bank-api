const readline = require('readline');
const Cuenta = require('./Cuenta');
const { crearServicio } = require('./Servicio');
const { cargarCuentas, guardarCuentas } = require('./persistencia');

// Con rl podemos pedir datos al usuario desde la consola
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// rl.question normalmente funciona con callback, aqui lo envolvemos en una
// promesa para poder usar await en todo el programa y que se lea mas facil
function preguntar(texto) {
  return new Promise((resolve) => {
    rl.question(texto, (respuesta) => resolve(respuesta));
  });
}

// Cargamos las cuentas guardadas apenas arranca el programa, si es la
// primera vez que se ejecuta esto va a venir vacio
let cuentas = cargarCuentas();

// Busca una cuenta por su numero, usamos Number() porque lo que llega
// de preguntar() siempre es un string y el numeroCuenta se guarda como numero
function buscarCuenta(numero) {
  return cuentas.find((c) => c.numeroCuenta === Number(numero));
}

// Esta funcion se usa para las opciones que piden autenticacion
// (retirar, pagar servicios, mostrar movimientos), pide numero y clave
// y devuelve la cuenta solo si todo es correcto
async function autenticar() {
  const numero = await preguntar('Numero de cuenta: ');
  const cuenta = buscarCuenta(numero);

  if (!cuenta) {
    console.log('No existe una cuenta con ese numero');
    return null;
  }

  const clave = await preguntar('Clave: ');

  if (!cuenta.verificarClave(clave)) {
    console.log('La clave no es correcta');
    return null;
  }

  return cuenta;
}

async function crearCuenta() {
  console.log('\n--- Crear cuenta ---');

  const documento = await preguntar('Numero de documento: ');
  const nombre = await preguntar('Nombre: ');
  const clave = await preguntar('Asigna una clave para la cuenta: ');

  // El numero de cuenta tiene que ser consecutivo, por eso lo sacamos
  // del tamaño del arreglo en vez de usar algo como Date.now()
  const numeroCuenta = cuentas.length + 1;

  const nuevaCuenta = new Cuenta(numeroCuenta, documento, nombre, clave, 0);
  cuentas.push(nuevaCuenta);

  guardarCuentas(cuentas); // guardamos de una vez para no perder la cuenta nueva

  console.log('\nCuenta creada correctamente');
  console.log(`Tu numero de cuenta es: ${numeroCuenta}`);
}

async function consignar() {
  console.log('\n--- Consignar dinero ---');

  const numero = await preguntar('Numero de cuenta: ');
  const cuenta = buscarCuenta(numero);

  if (!cuenta) {
    console.log('No existe una cuenta con ese numero');
    return;
  }

  const monto = Number(await preguntar('Monto a consignar: '));
  const resultado = cuenta.consignar(monto);

  console.log(resultado.mensaje);

  if (resultado.exito) {
    guardarCuentas(cuentas);

    console.log('--- Resumen de la transaccion ---');
    console.log(`Cuenta: ${cuenta.numeroCuenta}`);
    console.log(`Monto consignado: Q${monto}`);
    console.log(`Saldo actual: Q${cuenta.saldo}`);
  }
}

async function retirar() {
  console.log('\n--- Retirar dinero ---');

  const cuenta = await autenticar();
  if (!cuenta) return;

  const monto = Number(await preguntar('Monto a retirar: '));
  const resultado = cuenta.retirar(monto);

  console.log(resultado.mensaje);

  if (resultado.exito) {
    guardarCuentas(cuentas);

    console.log('--- Resumen de la transaccion ---');
    console.log(`Cuenta: ${cuenta.numeroCuenta}`);
    console.log(`Monto retirado: Q${monto}`);
    console.log(`Saldo actual: Q${cuenta.saldo}`);
  }
}

async function pagarServicio() {
  console.log('\n--- Pagar servicios ---');

  const cuenta = await autenticar();
  if (!cuenta) return;

  console.log('\n1. Energia');
  console.log('2. Agua');
  console.log('3. Gas');
  const opcionServicio = await preguntar('Elige el servicio a pagar: ');

  const referencia = await preguntar('Referencia del servicio: ');

  // crearServicio decide que clase instanciar segun la opcion,
  // asi no hay que andar poniendo ifs aqui para cada tipo de servicio
  const servicio = crearServicio(opcionServicio, referencia);

  if (!servicio) {
    console.log('Esa opcion de servicio no existe');
    return;
  }

  const resultado = cuenta.pagarServicio(servicio);

  console.log(resultado.mensaje);

  if (resultado.exito) {
    guardarCuentas(cuentas);

    console.log('--- Resumen de la transaccion ---');
    console.log(`Servicio: ${servicio.obtenerNombre()}`);
    console.log(`Referencia: ${referencia}`);
    console.log(`Monto pagado: Q${servicio.calcularMonto()}`);
    console.log(`Saldo actual: Q${cuenta.saldo}`);
  }
}

async function mostrarMovimientos() {
  console.log('\n--- Movimientos ---');

  const cuenta = await autenticar();
  if (!cuenta) return;

  console.log(`\nMovimientos de la cuenta ${cuenta.numeroCuenta}:`);

  if (cuenta.movimientos.length === 0) {
    console.log('Esta cuenta todavia no tiene movimientos');
    return;
  }

  // Recorremos y usamos mostrar() de cada Movimiento para no repetir
  // el formato del texto aqui mismo
  cuenta.movimientos.forEach((m) => console.log(m.mostrar()));
}

// Este es el ciclo principal del programa, se queda repitiendo el menu
// hasta que el usuario elija la opcion de salir
async function iniciar() {
  let salir = false;

  while (!salir) {
    console.log('\n===== ACME BANK =====');
    console.log('1. Crear cuenta');
    console.log('2. Consignar dinero');
    console.log('3. Retirar dinero');
    console.log('4. Pagar servicios');
    console.log('5. Mostrar movimientos');
    console.log('6. Salir');

    const opcion = await preguntar('Elige una opcion: ');

    switch (opcion) {
      case '1':
        await crearCuenta();
        break;
      case '2':
        await consignar();
        break;
      case '3':
        await retirar();
        break;
      case '4':
        await pagarServicio();
        break;
      case '5':
        await mostrarMovimientos();
        break;
      case '6':
        console.log('\nGracias por usar Acme Bank');
        salir = true;
        break;
      default:
        console.log('Esa opcion no existe, intenta de nuevo');
    }
  }

  rl.close();
}

iniciar();