import { Server } from "socket.io";
import { servicesService, viewsService } from "../container.js";
import { eventBus, EVENTS } from "../events/event-bus.js";
import { AppError } from "../utils/errors.js";

// Socket.io: escucha los eventos de dominio (cambios en servicios y reservas, vengan de la API REST
// o de un socket) y avisa a todos los navegadores conectados. Las acciones que llegan por socket
// pasan por los mismos services que la API REST, así que las reglas y validaciones son las mismas.
export const initSocket = (httpServer) => {
  const io = new Server(httpServer);

  const broadcastServices = async () => io.emit("services:updated", await servicesService.getServices());
  const broadcastBookings = async () => io.emit("bookings:updated", await viewsService.getBookingsData());

  // Un error al emitir no debe tirar el servidor (ni afectar la operación que ya se guardó)
  const safe = (fn) => async () => {
    try {
      await fn();
    } catch (error) {
      console.error("Error al emitir evento en tiempo real:", error);
    }
  };

  eventBus.on(
    EVENTS.SERVICES_CHANGED,
    safe(async () => {
      await broadcastServices();
      await broadcastBookings(); // los nombres de servicios aparecen también en las reservas
    })
  );
  eventBus.on(EVENTS.BOOKINGS_CHANGED, safe(broadcastBookings));

  io.on("connection", (socket) => {
    // Cada evento del cliente responde con un "acknowledgement": { status, message?, errors? }
    const handle = (event, action) =>
      socket.on(event, async (payload, ack) => {
        const reply = typeof ack === "function" ? ack : () => {};
        try {
          await action(payload);
          reply({ status: "success" });
        } catch (error) {
          if (error instanceof AppError) {
            reply({ status: "error", message: error.message, errors: error.errors });
          } else {
            console.error(error);
            reply({ status: "error", message: "Error interno del servidor" });
          }
        }
      });

    handle("services:create", (data) => servicesService.createService(data));
    handle("services:update", (payload) => servicesService.updateService(payload?.id, payload?.data));
    handle("services:delete", (id) => servicesService.deleteService(id));
  });

  return io;
};
