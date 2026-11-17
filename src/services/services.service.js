import { NotFoundError, ValidationError } from "../utils/errors.js";
import { eventBus, EVENTS } from "../events/event-bus.js";
import { isValidObjectId } from "../utils/validators.js";

const RULES = {
  name: [(v) => typeof v === "string" && v.trim() !== "", "name debe ser un string no vacío"],
  description: [(v) => typeof v === "string" && v.trim() !== "", "description debe ser un string no vacío"],
  duration: [(v) => Number.isInteger(v) && v > 0, "duration debe ser un entero positivo (minutos)"],
  price: [(v) => typeof v === "number" && v >= 0, "price debe ser un número mayor o igual a 0"],
  category: [(v) => typeof v === "string" && v.trim() !== "", "category debe ser un string no vacío"],
  available: [(v) => typeof v === "boolean", "available debe ser true o false"],
};

function validateService(body, { partial = false } = {}) {
  const errors = [];
  const data = body ?? {};

  for (const [field, [isValid, message]] of Object.entries(RULES)) {
    const value = data[field];
    if (value === undefined) {
      if (!partial) errors.push(`${field} es obligatorio`);
    } else if (!isValid(value)) {
      errors.push(message);
    }
  }

  if (partial && Object.keys(data).length === 0) {
    errors.push("el body no puede estar vacío");
  }
  return errors;
}

// Solo deja pasar los campos permitidos (ignora id y cualquier otro campo)
const pick = ({ name, description, duration, price, category, available } = {}) =>
  Object.fromEntries(
    Object.entries({ name, description, duration, price, category, available }).filter(
      ([, v]) => v !== undefined
    )
  );

const assertValidId = (sid) => {
  if (!isValidObjectId(sid)) throw new ValidationError("El sid debe ser un id válido");
};

// Service: reglas de negocio y validaciones. No conoce req/res ni el formato de persistencia.
export default class ServicesService {
  constructor(repository, events = eventBus) {
    this.repository = repository;
    this.events = events;
  }

  async getServices({ category, available } = {}) {
    const filters = {};

    if (category !== undefined) {
      if (typeof category !== "string" || category.trim() === "") {
        throw new ValidationError("category debe ser un texto");
      }
      filters.category = category.trim();
    }

    if (available !== undefined) {
      if (available !== "true" && available !== "false") {
        throw new ValidationError("available debe ser true o false");
      }
      filters.available = available === "true";
    }

    return this.repository.getAll(filters);
  }

  async getServiceById(sid) {
    assertValidId(sid);
    const service = await this.repository.getById(sid);
    if (!service) throw new NotFoundError("Servicio no encontrado");
    return service;
  }

  async createService(body) {
    const errors = validateService(body);
    if (errors.length) throw new ValidationError("Datos inválidos", errors);

    const created = await this.repository.create(pick(body));
    this.events.emit(EVENTS.SERVICES_CHANGED);
    return created;
  }

  async updateService(sid, body) {
    assertValidId(sid);

    const errors = validateService(body, { partial: true });
    if (errors.length) throw new ValidationError("Datos inválidos", errors);

    const updated = await this.repository.update(sid, pick(body));
    if (!updated) throw new NotFoundError("Servicio no encontrado");
    this.events.emit(EVENTS.SERVICES_CHANGED);
    return updated;
  }

  async deleteService(sid) {
    assertValidId(sid);
    const deleted = await this.repository.delete(sid);
    if (!deleted) throw new NotFoundError("Servicio no encontrado");
    this.events.emit(EVENTS.SERVICES_CHANGED);
    return deleted;
  }
}
