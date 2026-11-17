// Carga datos de ejemplo si las colecciones están vacías: npm run seed
import mongoose from "mongoose";
import { connectDB } from "../config/db.config.js";
import { Service, Booking } from "../models/index.js";

const services = [
  { name: "Corte de pelo", description: "Corte clásico con lavado incluido", duration: 30, price: 5000, category: "peluquería", available: true },
  { name: "Masaje descontracturante", description: "Masaje de espalda y cuello", duration: 60, price: 12000, category: "bienestar", available: true },
  { name: "Manicura", description: "Manicura con esmaltado semipermanente", duration: 45, price: 7000, category: "estética", available: false },
];

try {
  await connectDB();

  if ((await Service.countDocuments()) === 0) {
    const created = await Service.insertMany(services);
    console.log(`Servicios cargados: ${created.length}`);

    if ((await Booking.countDocuments()) === 0) {
      await Booking.create({
        customerName: "Ana Gómez",
        customerEmail: "ana@example.com",
        date: "2026-11-02",
        time: "10:00",
        services: [created[0]._id],
      });
      console.log("Reserva de ejemplo cargada");
    }
  } else {
    console.log("La colección de servicios ya tiene datos: no se cargó nada");
  }
} catch (error) {
  console.error(`Error al cargar datos: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
