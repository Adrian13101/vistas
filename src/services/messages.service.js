import { NotFoundError, ValidationError } from "../utils/errors.js";
import { isValidEmail, isValidObjectId } from "../utils/validators.js";

const RULES = {
  customerEmail: [isValidEmail, "customerEmail debe ser un email válido"],
  message: [(v) => typeof v === "string" && v.trim() !== "", "message debe ser un string no vacío"],
};

function validateMessage(body) {
  const errors = [];
  const data = body ?? {};

  for (const [field, [isValid, text]] of Object.entries(RULES)) {
    const value = data[field];
    if (value === undefined) {
      errors.push(`${field} es obligatorio`);
    } else if (!isValid(value)) {
      errors.push(text);
    }
  }
  return errors;
}

export default class MessagesService {
  constructor(repository) {
    this.repository = repository;
  }

  async getMessages() {
    return this.repository.getAll();
  }

  async getMessageById(mid) {
    if (!isValidObjectId(mid)) throw new ValidationError("El mid debe ser un id válido");

    const message = await this.repository.getById(mid);
    if (!message) throw new NotFoundError("Mensaje no encontrado");
    return message;
  }

  async createMessage(body) {
    const errors = validateMessage(body);
    if (errors.length) throw new ValidationError("Datos inválidos", errors);

    // Solo se aceptan los campos permitidos (se ignoran id, createdAt, etc.)
    const { customerEmail, message } = body;
    return this.repository.create({ customerEmail, message });
  }
}
