import mongoose from "mongoose";
import { config } from "./env.config.js";

// Conexión a MongoDB Atlas. No se loguea la URI porque contiene credenciales.
export const connectDB = async () => {
  await mongoose.connect(config.mongoUri);
  console.log("Conectado a MongoDB");
};
