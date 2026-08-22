# ACME-BANK

Proyecto del curso de Node.js de Campuslands. Es una sucursal virtual estilo cajero
hecha en consola, con persistencia en un archivo JSON (sin bases de datos externas).

## Estructura del proyecto

```
ACME-BANK/
  package.json
  db.json
  index.js
  Cuenta.js
  Movimiento.js
  Servicio.js
  persistencia.js
  README.md
```

## Instalación y ejecución

No se necesita instalar ninguna dependencia externa, todo el proyecto usa solo
módulos nativos de Node (`fs` y `readline`).

1. Descomprimir o copiar la carpeta `ACME-BANK`.
2. Abrir una terminal dentro de esa carpeta.
3. Ejecutar:

```
npm start
```

o directamente:

```
node index.js
```

El archivo `db.json` ya viene con un arreglo de cuentas vacío. Cada vez que se
crea una cuenta o se hace una operación, el archivo se actualiza solo.

## Cómo funciona

Al arrancar, `index.js` carga las cuentas guardadas en `db.json` (si el archivo
no existe, el programa igual arranca con un arreglo vacío). Después muestra el
menú principal y se queda esperando una opción hasta que el usuario elige salir:

```
1. Crear cuenta
2. Consignar dinero
3. Retirar dinero
4. Pagar servicios
5. Mostrar movimientos
6. Salir
```

Para las opciones 3, 4 y 5 el programa primero pide número de cuenta y clave
(autenticación) antes de dejar continuar. Para crear cuenta y consignar no se
pide clave, porque el enunciado solo exige autenticación en retiro, pago de
servicios y consulta de movimientos.

Cada operación exitosa se guarda de inmediato con `guardarCuentas` y después
el programa vuelve a mostrar el menú principal.

## Clases utilizadas

**Cuenta** (`Cuenta.js`)
Representa una cuenta bancaria. Guarda documento, nombre, saldo, la clave
(privada) y su lista de movimientos. Tiene los métodos que hacen el trabajo
real del banco: `verificarClave`, `consignar`, `retirar` y `pagarServicio`.
También tiene `obtenerDatosParaGuardar` y el método estático
`crearDesdeDatos`, que sirven para convertir la cuenta de ida y vuelta entre
objeto de la clase y objeto plano de JSON.

**Movimiento** (`Movimiento.js`)
Representa un movimiento bancario: tipo, valor, referencia (si aplica) y
fecha. Tiene un método `mostrar()` que arma el texto que se ve en consola
cuando se consultan los movimientos de una cuenta.

**Servicio** (`Servicio.js`)
Clase base para los servicios que se pueden pagar. No se puede instanciar
directamente (si se intenta, lanza un error), porque no representa ningún
servicio real por sí sola. Define el método `calcularMonto()`, que cada
servicio hijo tiene que implementar.

**Energia, Agua, Gas** (`Servicio.js`)
Heredan de `Servicio` y cada una define su propio `calcularMonto()` y
`obtenerNombre()`.

## Relaciones entre clases

- **Cuenta – Movimiento (composición):** cada movimiento pertenece a una
  cuenta específica y se crea siempre desde dentro de la cuenta (en
  `consignar`, `retirar` y `pagarServicio`). Un movimiento no tiene sentido
  fuera de la cuenta que lo generó.
- **Cuenta – Servicio (asociación unidireccional):** `Cuenta.pagarServicio`
  recibe un objeto `Servicio` y lo usa para calcular el monto a descontar,
  pero la cuenta no guarda una referencia permanente al servicio, solo lo usa
  en el momento del pago.
- **Servicio – Energia/Agua/Gas (herencia):** `Energia`, `Agua` y `Gas`
  extienden de `Servicio`.

## Dónde se aplicó encapsulamiento

La clave de la cuenta (`#clave`) es una propiedad privada dentro de `Cuenta`,
no se puede leer ni modificar desde afuera de la clase. Para comprobarla
existe el método `verificarClave(intento)`, que solo devuelve `true` o
`false` sin exponer el valor real de la clave.

Solo hay un lugar donde `Cuenta` sí expone la clave hacia afuera:
`obtenerDatosParaGuardar()`, usado exclusivamente por `persistencia.js` para
poder escribirla en el archivo `db.json` (si no se hiciera así, la clave se
perdería cada vez que se guarda el archivo, porque `JSON.stringify` no
incluye las propiedades privadas `#`). Fue la solución más simple para poder
persistir la cuenta completa sin agregar un sistema de encriptación que el
enunciado no pidió.

## Dónde se aplicó abstracción

`Cuenta.pagarServicio(servicio)` no necesita saber si el servicio es Energía,
Agua o Gas, ni cómo calcula su monto cada uno. Solo le importa que el objeto
tenga `calcularMonto()` y `obtenerNombre()`. El detalle de cómo se calcula
cada monto queda escondido dentro de cada clase hija.

## Dónde se aplicó herencia y polimorfismo

`Servicio` es la clase base y `Energia`, `Agua` y `Gas` heredan de ella.
Las tres sobrescriben `calcularMonto()` y `obtenerNombre()` con su propio
comportamiento. El polimorfismo se ve en `pagarServicio`: sin importar qué
subclase le llegue, siempre llama a `servicio.calcularMonto()` de la misma
forma, y el resultado cambia según el tipo real del objeto.

También se simuló el concepto de clase abstracta: `Servicio` revisa
`new.target` en su constructor y lanza un error si alguien intenta hacer
`new Servicio()` directamente, porque en JavaScript no existen las clases
abstractas de forma nativa como en otros lenguajes vistos en clase.

## Principios SOLID aplicados

- **SRP:** cada archivo tiene una responsabilidad clara. `Cuenta` maneja las
  operaciones propias de una cuenta, `Movimiento` solo representa un
  registro, `Servicio` y sus hijas calculan montos, `persistencia.js` solo
  lee y escribe el archivo, e `index.js` solo maneja el menú y la
  interacción con el usuario.
- **Open/Closed:** se puede agregar un nuevo servicio (por ejemplo Internet)
  creando una clase nueva que extienda `Servicio`, sin tocar `Cuenta` ni las
  demás clases de servicio ya existentes.
- **Liskov:** en cualquier parte donde se espera un `Servicio` (como en
  `pagarServicio`) se puede pasar `Energia`, `Agua` o `Gas` sin que el
  programa se rompa ni se comporte de forma inesperada.
- **Dependency Inversion (aplicado de forma simple):** `index.js` no lee ni
  escribe el archivo directamente, usa las funciones `cargarCuentas` y
  `guardarCuentas` de `persistencia.js`. Si el día de mañana cambiara la
  forma de guardar los datos, no habría que tocar el menú ni la lógica de
  las cuentas.
- **Interface Segregation:** no se creó ninguna interfaz explícita porque
  JavaScript no las maneja de forma nativa, y crear archivos de interfaces
  solo para decir que se usó el principio hubiera sido forzarlo. En cambio
  se procuró que cada clase solo tenga los métodos que realmente necesita
  para su propósito.

## Patrones de diseño utilizados

- **Factory Method:** la función `crearServicio(opcion, referencia)` en
  `Servicio.js` decide qué clase instanciar (`Energia`, `Agua` o `Gas`)
  según la opción elegida en el menú, para no tener que repetir esa lógica
  con ifs dentro de `index.js`.

No se usaron **Adapter** ni **Observer**: no había ningún sistema
incompatible que necesitara adaptarse, y agregar un sistema de eventos solo
para registrar un movimiento después de una operación hubiera sido más
complicado que simplemente llamar al método directamente.

## Temas del curso que no se usaron y por qué

- **MongoDB / CRUD con MongoDB / consultas avanzadas / transacciones:** el
  enunciado no pide una base de datos externa, con `fs` y JSON alcanza para
  cumplir con la persistencia que se pide.
- **Workers / Workers compartidos:** todo el programa es secuencial, no hay
  ninguna tarea pesada ni que necesite ejecutarse en paralelo mientras el
  usuario espera.
- **Adapter:** no existe ningún formato o sistema incompatible que necesite
  adaptarse a otro.
- **Eliminar cuentas (delete del CRUD):** el enunciado no pide eliminar
  cuentas, agregarlo solo para completar el CRUD hubiera sido inventar una
  funcionalidad no solicitada.

## Decisiones tomadas donde el enunciado no especificaba algo

- El enunciado no dice cuánto cuesta cada servicio (Energía, Agua, Gas), así
  que cada uno tiene un valor fijo definido en su propio `calcularMonto()`
  (150, 80 y 100 respectivamente), solo para poder demostrar que el pago
  funciona. No se agregó ninguna lógica de cálculo de tarifas.
- El número de cuenta se calcula como `cuentas.length + 1`, siguiendo la
  numeración consecutiva que pide el enunciado. Como el proyecto no tiene
  eliminación de cuentas, esto siempre da un número correcto y único.

## Ejemplo de uso en consola

```
===== ACME BANK =====
1. Crear cuenta
2. Consignar dinero
3. Retirar dinero
4. Pagar servicios
5. Mostrar movimientos
6. Salir
Elige una opcion: 1

--- Crear cuenta ---
Numero de documento: 123456
Nombre: Juan Perez
Asigna una clave para la cuenta: clave123

Cuenta creada correctamente
Tu numero de cuenta es: 1

===== ACME BANK =====
Elige una opcion: 2

--- Consignar dinero ---
Numero de cuenta: 1
Monto a consignar: 500
Consignacion realizada correctamente
--- Resumen de la transaccion ---
Cuenta: 1
Monto consignado: Q500
Saldo actual: Q500

===== ACME BANK =====
Elige una opcion: 4

--- Pagar servicios ---
Numero de cuenta: 1
Clave: clave123

1. Energia
2. Agua
3. Gas
Elige el servicio a pagar: 1
Referencia del servicio: REF-001
Pago realizado correctamente
--- Resumen de la transaccion ---
Servicio: Energia
Referencia: REF-001
Monto pagado: Q150
Saldo actual: Q350

===== ACME BANK =====
Elige una opcion: 5

--- Movimientos ---
Numero de cuenta: 1
Clave: clave123

Movimientos de la cuenta 1:
[fecha] Consignacion - Q500
[fecha] Pago Energia - Q150 (ref: REF-001)

===== ACME BANK =====
Elige una opcion: 6

Gracias por usar Acme Bank
```

Este proyecto fue probado corriendo una sesión completa (crear cuenta,
consignar, retirar con validación de saldo, pagar servicio, consultar
movimientos, y casos de error como monto inválido, saldo insuficiente,
cuenta inexistente y clave incorrecta) y también se verificó que los datos
persistan correctamente al cerrar y volver a abrir el programa.