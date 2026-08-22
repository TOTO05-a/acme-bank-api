// Esta clase representa un movimiento de la cuenta (consignacion, retiro o pago)
// La usamos para no andar guardando objetos sueltos sin ninguna estructura
class Movimiento {
  constructor(tipo, valor, referencia = null) {
    this.tipo = tipo; // ejemplo: "Consignacion", "Retiro", "Pago Energia"
    this.valor = valor;

    // La referencia solo aplica cuando el movimiento viene de un pago de servicio,
    // por eso la dejamos como null cuando no se necesita
    this.referencia = referencia;

    // Guardamos la fecha en el momento en que se crea el movimiento,
    // asi el usuario puede ver cuando se hizo cada operacion
    this.fecha = new Date().toLocaleString();
  }

  // Con esto armamos el texto que se ve en pantalla cuando se listan
  // los movimientos, para no repetir el mismo formato en el index
  mostrar() {
    let texto = `[${this.fecha}] ${this.tipo} - Q${this.valor}`;

    // Solo agregamos la referencia si el movimiento la trae
    if (this.referencia) {
      texto += ` (ref: ${this.referencia})`;
    }

    return texto;
  }
}

module.exports = Movimiento;