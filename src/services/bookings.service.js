import { ConflictError, NotFoundError, ValidationError } from "../utils/errors.js";
import { eventBus, EVENTS } from "../events/event-bus.js";
import { isValidObjectId, isValidDate, isValidTime, isValidEmail } from "../utils/validators.js";

const RULES = {
  customerName: [(v) => typeof v === "string" && v.trim() !== "", "customerName debe ser un string no vacío"],
  customerEmail: [
    isValidEmail,
    "customerEmail debe ser un email válido",
  ],
  date: [isValidDate, "date debe tener formato YYYY-MM-DD y ser una fecha válida"],
  time: [isValidTime, "time debe tener formato HH:MM (24 hs)"],
};

function validateBooking(body) {
  const errors = [];
  const data = body ?? {};

  for (const [field, [isValid, message]] of Object.entries(RULES)) {
    const value = data[field];
    if (value === undefined) {
      errors.push(`${field} es obligatorio`);
    } else if (!isValid(value)) {
      errors.push(message);
    }
  }
  return errors;
}

// Solo deja pasar los campos permitidos (ignora id, services y cualquier otro campo)
const pick = ({ customerName, customerEmail, date, time } = {}) => ({
  customerName,
  customerEmail,
  date,
  time,
});

// Service de reservas: para validar el servicio que se agrega usa ServicesService
// (otra regla de negocio), nunca accede directamente a la base de datos.
export default class BookingsService {
  constructor(bookingsRepository, servicesService, events = eventBus) {
    this.repository = bookingsRepository;
    this.servicesService = servicesService;
    this.events = events;
  }

  async getBookings() {
    return this.repository.getAll();
  }

  async createBooking(body) {
    const errors = validateBooking(body);
    if (errors.length) throw new ValidationError("Datos inválidos", errors);

    const created = await this.repository.create(pick(body));
    this.events.emit(EVENTS.BOOKINGS_CHANGED);
    return created;
  }

  async getBookingById(bid) {
    if (!isValidObjectId(bid)) throw new ValidationError("El bid debe ser un id válido");

    const booking = await this.repository.getById(bid);
    if (!booking) throw new NotFoundError("Reserva no encontrada");
    return booking;
  }

  async addServiceToBooking(bid, sid) {
    if (!isValidObjectId(bid)) throw new ValidationError("El bid debe ser un id válido");
    if (!isValidObjectId(sid)) throw new ValidationError("El sid debe ser un id válido");

    const booking = await this.getBookingById(bid);

    // Lanza 404 si el servicio no existe
    const service = await this.servicesService.getServiceById(sid);
    if (!service.available) {
      throw new ValidationError("El servicio indicado no está disponible");
    }
    if (booking.services.includes(service.id)) {
      throw new ConflictError("El servicio ya está incluido en la reserva");
    }

    const updated = await this.repository.addService(bid, sid);
    this.events.emit(EVENTS.BOOKINGS_CHANGED);
    return updated;
  }
}
