// Repository: expone las operaciones de persistencia de reservas que necesita el negocio.
export default class BookingsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  getAll() {
    return this.dao.getAll();
  }

  getById(id) {
    return this.dao.getById(id);
  }

  create(data) {
    return this.dao.create(data);
  }

  addService(bookingId, serviceId) {
    return this.dao.addService(bookingId, serviceId);
  }
}
