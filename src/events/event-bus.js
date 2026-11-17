import { EventEmitter } from "node:events";

// Bus de eventos de dominio. Los services avisan "algo cambió" sin saber quién escucha:
// hoy escucha Socket.io (src/realtime/socket.js), pero los services no dependen de él.
export const eventBus = new EventEmitter();

export const EVENTS = {
  SERVICES_CHANGED: "services:changed",
  BOOKINGS_CHANGED: "bookings:changed",
};
