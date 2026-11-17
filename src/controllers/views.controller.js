import { servicesService, viewsService } from "../container.js";

// Controllers de vistas: piden los datos a los services y renderizan la plantilla Handlebars.

// GET /  -> servicios disponibles
export const renderHome = async (req, res, next) => {
  try {
    const services = await servicesService.getServices({ available: "true" });
    res.render("home", { title: "Servicios disponibles", services });
  } catch (error) {
    next(error);
  }
};

// GET /realtimeservices  -> alta, baja y cambio de disponibilidad en tiempo real
export const renderRealtimeServices = async (req, res, next) => {
  try {
    const services = await servicesService.getServices();
    res.render("realtimeservices", { title: "Gestión de servicios", services });
  } catch (error) {
    next(error);
  }
};

// GET /bookings  -> reservas con sus servicios
export const renderBookings = async (req, res, next) => {
  try {
    const { bookings, services } = await viewsService.getBookingsData();
    res.render("bookings", { title: "Reservas", bookings, availableServices: services });
  } catch (error) {
    next(error);
  }
};
