const Movimiento = require('./Movimiento');

// Esta clase representa una cuenta bancaria, aqui vive casi toda la logica
// de las operaciones que pide el enunciado (consignar, retirar, pagar servicios)
class Cuenta {
  // La clave se guarda como propiedad privada para que no se pueda leer
  // directamente desde afuera de la clase, por eso usamos #
  #clave;

  constructor(numeroCuenta, documento, nombre, clave, saldo = 0) {
    this.numeroCuenta = numeroCuenta; // numero consecutivo asignado al crear la cuenta
    this.documento = documento;
    this.nombre = nombre;
    this.#clave = clave;
    this.saldo = saldo;
    this.movimientos = []; // aqui se van guardando los Movimiento de esta cuenta
  }

  // Este metodo sirve para revisar si la clave que escribio el usuario es
  // la correcta, sin necesidad de exponer la clave real hacia afuera
  verificarClave(intento) {
    return intento === this.#clave;
  }

  // Consignar dinero, primero se valida el monto antes de tocar el saldo
  consignar(monto) {
    if (!monto || monto <= 0) {
      return { exito: false, mensaje: 'El monto a consignar debe ser mayor a 0' };
    }

    this.saldo += monto;

    // Registramos el movimiento para que quede en el historial de la cuenta
    const movimiento = new Movimiento('Consignacion', monto);
    this.movimientos.push(movimiento);

    return { exito: true, mensaje: 'Consignacion realizada correctamente' };
  }

  // Retirar dinero, aqui es donde se valida que el saldo alcance
  // antes de descontar nada, si no alcanza se rechaza la operacion
  retirar(monto) {
    if (!monto || monto <= 0) {
      return { exito: false, mensaje: 'El monto a retirar debe ser mayor a 0' };
    }

    if (monto > this.saldo) {
      return { exito: false, mensaje: 'El saldo no alcanza para hacer este retiro' };
    }

    this.saldo -= monto;

    const movimiento = new Movimiento('Retiro', monto);
    this.movimientos.push(movimiento);

    return { exito: true, mensaje: 'Retiro realizado correctamente' };
  }

  // Para pagar un servicio recibimos el objeto ya creado (Energia, Agua o Gas)
  // y usamos su propio calcularMonto, sin necesidad de saber que tipo es,
  // aqui es donde se aprovecha el polimorfismo
  pagarServicio(servicio) {
    const monto = servicio.calcularMonto();

    if (monto > this.saldo) {
      return { exito: false, mensaje: 'El saldo no alcanza para pagar este servicio' };
    }

    this.saldo -= monto;

    const movimiento = new Movimiento(`Pago ${servicio.obtenerNombre()}`, monto, servicio.referencia);
    this.movimientos.push(movimiento);

    return { exito: true, mensaje: 'Pago realizado correctamente' };
  }

  // Esto nos sirve para sacar los datos de la cuenta en un objeto plano
  // y poder guardarlos en el archivo. Aqui si devolvemos la clave porque
  // JSON.stringify no guarda las propiedades privadas (#), entonces sin
  // esto la clave se perderia cada vez que se guarda el archivo
  obtenerDatosParaGuardar() {
    return {
      numeroCuenta: this.numeroCuenta,
      documento: this.documento,
      nombre: this.nombre,
      clave: this.#clave,
      saldo: this.saldo,
      movimientos: this.movimientos
    };
  }

  // Con este metodo estatico reconstruimos una Cuenta real a partir de los
  // datos planos que vienen del db.json cuando arranca el programa
  static crearDesdeDatos(datos) {
    const cuenta = new Cuenta(datos.numeroCuenta, datos.documento, datos.nombre, datos.clave, datos.saldo);

    // Los movimientos que vienen del archivo son objetos planos, no instancias
    // de Movimiento, aqui los volvemos a convertir para que tengan el metodo mostrar()
    cuenta.movimientos = (datos.movimientos || []).map((m) => {
      const movimiento = new Movimiento(m.tipo, m.valor, m.referencia);
      movimiento.fecha = m.fecha; // respetamos la fecha original en vez de poner una nueva
      return movimiento;
    });

    return cuenta;
  }
}

module.exports = Cuenta;