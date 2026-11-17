# Sistema Backend de Turnos y Reservas

Backend de un sistema de turnos y reservas hecho con Node.js, Express (ESM) y **MongoDB Atlas con Mongoose**, con vistas renderizadas en el servidor con **Handlebars** y actualizaciones en tiempo real con **Socket.io**. Gestiona tres recursos: `services` (servicios disponibles), `bookings` (reservas de los clientes) y `messages` (mensajes de consulta de los clientes).

La API está organizada en capas, cada una con una única responsabilidad. Los datos fluyen así:

```
Request -> Router -> Controller -> Service -> Repository -> DAO -> MongoDB (Mongoose)
```

Tanto la API REST como las vistas y los sockets usan los mismos services, así que las reglas y validaciones son siempre las mismas.

| Capa         | Carpeta             | Responsabilidad                                                                                  |
|--------------|---------------------|--------------------------------------------------------------------------------------------------|
| Routers      | `src/routes`        | Definen los endpoints y los conectan con su controller. Sin lógica.                              |
| Controllers  | `src/controllers`   | Capa HTTP: leen `req.params`, `req.query` y `req.body`, llaman al service y responden con `res`. |
| Services     | `src/services`      | Lógica de negocio y validaciones. Lanzan errores (400, 404, 409). No conocen `req` ni `res`.     |
| Repositories | `src/repositories`  | Interfaz de persistencia que usa el negocio. No saben cómo se guardan los datos.                 |
| DAO          | `src/dao`           | Acceso directo a MongoDB a través de los modelos de Mongoose.                                    |
| Models       | `src/models`        | Schemas de Mongoose de cada colección.                                                           |
| Views        | `src/views`         | Plantillas Handlebars (layout, páginas y partials). Los controllers de vistas les pasan los datos. |
| Realtime     | `src/realtime`      | Socket.io: avisa a los navegadores cuando cambian los datos y recibe acciones por socket.        |

La migración de archivos JSON a MongoDB solo tocó el DAO, los modelos y la configuración: routers, controllers, services y repositories se mantuvieron, y los endpoints responden con el mismo formato que antes.

Los errores se lanzan desde los services con las clases de `src/utils/errors.js` y un único middleware en `app.js` los convierte en la respuesta HTTP.

## Vistas y tiempo real

| Vista                | Qué muestra                                                                                      |
|----------------------|--------------------------------------------------------------------------------------------------|
| `GET /`              | Servicios disponibles. La lista se actualiza sola cuando cambia algún servicio.                  |
| `GET /bookings`      | Reservas con los nombres de sus servicios. Permite crear una reserva y agregarle servicios. Se actualiza sola. |
| `GET /realtimeservices` | Gestión de servicios: crear, cambiar disponibilidad y eliminar por Socket.io. Se ve al instante en todos los navegadores abiertos. |

Las páginas se renderizan en el servidor con Handlebars (los datos reales vienen de MongoDB) y después un pequeño script del navegador (`public/js`) mantiene la lista al día con Socket.io. Cada página muestra en el encabezado si la conexión en vivo está activa.

**Cómo funciona el tiempo real**

1. Cuando un service guarda un cambio (crear, modificar o eliminar un servicio; crear una reserva o agregarle un servicio), emite un evento interno (`src/events/event-bus.js`). Los services no saben nada de Socket.io.
2. `src/realtime/socket.js` escucha esos eventos y envía a todos los navegadores la información actualizada.
3. Por eso el efecto es el mismo si el cambio viene de la API REST (Postman, curl), de un formulario de las vistas o de un evento por socket.

| Evento                | Dirección           | Contenido                                                                  |
|-----------------------|---------------------|----------------------------------------------------------------------------|
| `services:updated`    | servidor → clientes | Lista completa de servicios                                                |
| `bookings:updated`    | servidor → clientes | `{ bookings, services }`: reservas con nombres de servicios y servicios disponibles |
| `services:create`     | cliente → servidor  | Datos del servicio nuevo                                                   |
| `services:update`     | cliente → servidor  | `{ id, data }` con los campos a modificar                                  |
| `services:delete`     | cliente → servidor  | `id` del servicio                                                          |

Los eventos del cliente responden con un acknowledgement `{ status: "success" }` o `{ status: "error", message, errors? }`, con los mismos mensajes de validación que la API REST.

El contenido que cargan los usuarios se escapa tanto en el servidor (Handlebars) como en el navegador (`textContent`), por lo que no puede ejecutarse como HTML.

## Requisitos

- Node.js 18 o superior
- Una base de datos en MongoDB Atlas (el plan gratuito alcanza)

## Instalación

```bash
git clone <URL-DEL-REPOSITORIO>
cd refactor
npm install
cp .env.example .env     # en Windows: copy .env.example .env
```

Después completá el archivo `.env` con tus valores (ver la siguiente sección).

### Configurar MongoDB Atlas

1. Creá un cluster gratuito en [MongoDB Atlas](https://www.mongodb.com/atlas).
2. En **Database Access**, creá un usuario con contraseña.
3. En **Network Access**, agregá tu IP (o `0.0.0.0/0` solo para desarrollo).
4. En **Connect > Drivers**, copiá la connection string y pegala en `MONGO_URI`, reemplazando `<usuario>` y `<password>` y dejando el nombre de la base (por ejemplo `turnos-reservas`) antes del `?`.

> El archivo `.env` tiene credenciales: está en el `.gitignore` y no se sube al repositorio.

## Ejecución

```bash
npm run seed     # opcional: carga servicios y una reserva de ejemplo si la base está vacía
npm start
```

El servidor queda escuchando en `http://localhost:8080` (según el `PORT` del `.env`). Abrí `http://localhost:8080/` para ver las vistas; para ver el tiempo real, abrí `/` y `/realtimeservices` en dos ventanas y creá un servicio. También está disponible `npm run dev`, que reinicia al guardar cambios.

## Variables de entorno

| Variable    | Descripción                          | Ejemplo                                                    |
|-------------|--------------------------------------|------------------------------------------------------------|
| `PORT`      | Puerto del servidor                  | `8080`                                                     |
| `NODE_ENV`  | Entorno de ejecución                 | `development`                                              |
| `MONGO_URI` | Connection string de MongoDB Atlas   | `mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/turnos-reservas?retryWrites=true&w=majority` |

Si falta alguna, la aplicación termina al iniciar con un mensaje que indica cuál. Si no puede conectarse a MongoDB, también termina con un mensaje de error (sin mostrar la URI).

## Estructura

```
src/
  config/
    env.config.js                 # carga y valida variables de entorno
    db.config.js                  # conexión a MongoDB con Mongoose
  routes/
    services.router.js
    bookings.router.js
    messages.router.js
    views.router.js               # vistas: /, /bookings, /realtimeservices
  controllers/
    views.controller.js           # renderizan las plantillas Handlebars
    services.controller.js        # getServices, getServiceById, createService, updateService, deleteService
    bookings.controller.js        # createBooking, getBookingById, addServiceToBooking
    messages.controller.js        # getMessages, getMessageById, createMessage
  services/
    services.service.js           # reglas y validaciones de servicios
    bookings.service.js           # reglas y validaciones de reservas
    messages.service.js           # reglas y validaciones de mensajes
    views.service.js              # arma los datos de las vistas (reservas + nombres de servicios)
  repositories/
    services.repository.js
    bookings.repository.js
    messages.repository.js
  dao/
    services.dao.js               # consultas a la colección services
    bookings.dao.js               # consultas a la colección bookings
    messages.dao.js               # consultas a la colección messages
  models/
    service.model.js              # schema de Service
    booking.model.js              # schema de Booking
    message.model.js              # schema de Message
    index.js
  views/
    layouts/main.handlebars       # estructura común (encabezado, estilos, scripts)
    partials/                     # serviceCard y bookingCard
    home.handlebars
    bookings.handlebars
    realtimeservices.handlebars
  events/event-bus.js             # eventos de dominio (cambios en servicios y reservas)
  realtime/socket.js              # servidor Socket.io
  utils/
    errors.js                     # AppError, ValidationError, NotFoundError, ConflictError
    validators.js                 # validaciones reutilizables (id, fecha, hora, email)
  scripts/
    seed.js                       # datos de ejemplo (npm run seed)
  container.js                    # arma las capas: DAO -> Repository -> Service
  app.js                          # configuración de Express y manejo de errores
  server.js                       # conexión a la base y arranque del servidor (Express + Socket.io)
public/
  css/styles.css
  js/                             # scripts del navegador: dom.js, home.js, bookings.js, realtimeservices.js
```

## Endpoints de la API REST

| Método | Ruta                               | Descripción                                        | Códigos              |
|--------|------------------------------------|----------------------------------------------------|----------------------|
| GET    | /api/services                      | Lista servicios. Filtros: `category`, `available`  | 200, 400             |
| GET    | /api/services/:sid                 | Obtiene un servicio por id                         | 200, 400, 404        |
| POST   | /api/services                      | Crea un servicio                                   | 201, 400             |
| PUT    | /api/services/:sid                 | Actualiza un servicio (parcial)                    | 200, 400, 404        |
| DELETE | /api/services/:sid                 | Elimina un servicio                                | 200, 400, 404        |
| POST   | /api/bookings                      | Crea una reserva (sin servicios)                   | 201, 400             |
| GET    | /api/bookings/:bid                 | Obtiene una reserva por id                         | 200, 400, 404        |
| POST   | /api/bookings/:bid/services/:sid   | Agrega un servicio a la reserva                    | 200, 400, 404, 409   |
| GET    | /api/messages                      | Lista los mensajes                                 | 200                  |
| GET    | /api/messages/:mid                 | Obtiene un mensaje por id                          | 200, 400, 404        |
| POST   | /api/messages                      | Crea un mensaje                                    | 201, 400             |

## Modelos

Servicio:

```json
{
  "id": "6740b1f2a1c3e45d8f9a0b12",
  "name": "Corte de pelo",
  "description": "Corte clásico con lavado incluido",
  "duration": 30,
  "price": 5000,
  "category": "peluquería",
  "available": true
}
```

Reserva:

```json
{
  "id": "6740b1f2a1c3e45d8f9a0b15",
  "customerName": "Ana Gómez",
  "customerEmail": "ana@example.com",
  "date": "2026-11-02",
  "time": "10:00",
  "services": ["6740b1f2a1c3e45d8f9a0b12"]
}
```

Mensaje:

```json
{
  "id": "6740b1f2a1c3e45d8f9a0b20",
  "customerEmail": "ana@example.com",
  "message": "Hola, quiero consultar disponibilidad para el viernes",
  "createdAt": "2026-11-17T23:25:33.960Z"
}
```

- Los ids son los `ObjectId` de MongoDB, representados como string de 24 caracteres hexadecimales. Se generan automáticamente: no se envían en el POST ni se pueden modificar. Un id con otro formato responde 400.
- `duration` está en minutos. `date` tiene formato `YYYY-MM-DD` y `time` formato `HH:MM` (24 hs).
- Una reserva se crea sin servicios (`services: []`) y se le agregan con `POST /api/bookings/:bid/services/:sid`. `services` guarda referencias (ids) a la colección `services`.
- Al agregar un servicio, `BookingsService` verifica con `ServicesService` que exista (404 si no), que esté disponible (400) y que no esté ya en la reserva (409).
- El filtro `category` no distingue mayúsculas ni tildes (`?category=estetica` encuentra "estética").

## Ejemplos

```bash
# Servicios con filtros
curl "http://localhost:8080/api/services?category=bienestar&available=true"

# Crear una reserva
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Luis Pérez","customerEmail":"luis@example.com","date":"2026-11-03","time":"11:30"}'

# Agregar un servicio a la reserva (reemplazá los ids por los reales)
curl -X POST http://localhost:8080/api/bookings/<BID>/services/<SID>

# Ver la reserva
curl http://localhost:8080/api/bookings/<BID>

# Enviar un mensaje
curl -X POST http://localhost:8080/api/messages \
  -H "Content-Type: application/json" \
  -d '{"customerEmail":"luis@example.com","message":"¿Tienen turnos el viernes?"}'
```
