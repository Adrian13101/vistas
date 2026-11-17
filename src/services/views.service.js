// Arma la información que muestran las vistas: combina reservas y servicios
// (usa los otros services, nunca accede directamente a la base de datos).
export default class ViewsService {
  constructor(servicesService, bookingsService) {
    this.servicesService = servicesService;
    this.bookingsService = bookingsService;
  }

  // Reservas con el nombre de cada servicio + servicios disponibles (para el select de la vista).
  async getBookingsData() {
    const [bookings, services] = await Promise.all([
      this.bookingsService.getBookings(),
      this.servicesService.getServices(),
    ]);
    const byId = new Map(services.map((s) => [s.id, s]));

    return {
      bookings: bookings.map((booking) => ({
        ...booking,
        serviceItems: booking.services.map((id) => ({
          id,
          name: byId.get(id)?.name ?? "Servicio eliminado",
          missing: !byId.has(id),
        })),
      })),
      services: services.filter((s) => s.available),
    };
  }
}
