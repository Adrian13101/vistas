import { Booking } from "../models/index.js";

// DAO: único lugar que sabe CÓMO se guardan las reservas (ahora, MongoDB con Mongoose).
export default class BookingsDAO {
  constructor(model = Booking) {
    this.model = model;
  }

  async getAll() {
    const docs = await this.model.find().sort({ date: 1, time: 1, _id: 1 });
    return docs.map((d) => d.toJSON());
  }

  async getById(id) {
    const doc = await this.model.findById(id);
    return doc ? doc.toJSON() : null;
  }

  // La reserva se crea sin servicios; se agregan después con addService.
  async create(data) {
    const { customerName, customerEmail, date, time } = data;
    const doc = await this.model.create({ customerName, customerEmail, date, time, services: [] });
    return doc.toJSON();
  }

  // $addToSet agrega el servicio sin duplicados. Devuelve la reserva actualizada o null.
  async addService(bookingId, serviceId) {
    const doc = await this.model.findByIdAndUpdate(
      bookingId,
      { $addToSet: { services: serviceId } },
      { new: true }
    );
    return doc ? doc.toJSON() : null;
  }
}
