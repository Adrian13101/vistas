import ServicesDAO from "./dao/services.dao.js";
import BookingsDAO from "./dao/bookings.dao.js";
import MessagesDAO from "./dao/messages.dao.js";
import ServicesRepository from "./repositories/services.repository.js";
import BookingsRepository from "./repositories/bookings.repository.js";
import MessagesRepository from "./repositories/messages.repository.js";
import ServicesService from "./services/services.service.js";
import BookingsService from "./services/bookings.service.js";
import MessagesService from "./services/messages.service.js";
import ViewsService from "./services/views.service.js";

// Punto único donde se "arma" la aplicación: DAO -> Repository -> Service.
const servicesRepository = new ServicesRepository(new ServicesDAO());
const bookingsRepository = new BookingsRepository(new BookingsDAO());
const messagesRepository = new MessagesRepository(new MessagesDAO());

export const servicesService = new ServicesService(servicesRepository);
export const bookingsService = new BookingsService(bookingsRepository, servicesService);
export const messagesService = new MessagesService(messagesRepository);
export const viewsService = new ViewsService(servicesService, bookingsService);
