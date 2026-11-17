// Errores de aplicación: los services los lanzan y el middleware de app.js los convierte en respuestas HTTP.
export class AppError extends Error {
  constructor(message, statusCode = 500, errors) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Datos inválidos", errors) {
    super(message, 400, errors);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflicto") {
    super(message, 409);
  }
}
