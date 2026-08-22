// Clase base para representar un servicio que se puede pagar desde una cuenta.
// La dejamos como una especie de clase abstracta porque no tiene sentido
// crear un Servicio "generico", siempre debe ser Energia, Agua o Gas
class Servicio {
  constructor(referencia) {
    // Con el new.target evitamos que alguien haga "new Servicio()" directamente,
    // en JS no existen las clases abstractas como tal, esta es la forma comun
    // de simular esa restriccion
    if (new.target === Servicio) {
      throw new Error('No se puede crear un Servicio directamente, usa Energia, Agua o Gas');
    }

    this.referencia = referencia; // numero o dato que el usuario da para identificar el pago
  }

  // Cada servicio hijo tiene que decir cuanto cuesta, este metodo se
  // sobrescribe en cada clase hija (aqui se ve el polimorfismo)
  calcularMonto() {
    throw new Error('calcularMonto tiene que implementarse en la clase hija');
  }

  // Nombre que se muestra en los resumenes y en los movimientos
  obtenerNombre() {
    return 'Servicio';
  }
}

// El enunciado no dice cuanto cuesta cada servicio, entonces para poder
// probar que el pago funciona le pusimos un valor fijo a cada uno,
// fue la solucion mas simple ya que no se pidio una logica de precios
class Energia extends Servicio {
  calcularMonto() {
    return 150;
  }

  obtenerNombre() {
    return 'Energia';
  }
}

class Agua extends Servicio {
  calcularMonto() {
    return 80;
  }

  obtenerNombre() {
    return 'Agua';
  }
}

class Gas extends Servicio {
  calcularMonto() {
    return 100;
  }

  obtenerNombre() {
    return 'Gas';
  }
}

// Aqui aplicamos Factory Method, en vez de que el index.js tenga que hacer
// un if o un switch para saber que clase instanciar segun la opcion elegida,
// se lo dejamos a esta funcion
function crearServicio(opcion, referencia) {
  switch (opcion) {
    case '1':
      return new Energia(referencia);
    case '2':
      return new Agua(referencia);
    case '3':
      return new Gas(referencia);
    default:
      return null; // si la opcion no es valida dejamos que el index.js lo maneje
  }
}

module.exports = { Servicio, Energia, Agua, Gas, crearServicio };