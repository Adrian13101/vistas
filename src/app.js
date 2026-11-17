import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { engine } from "express-handlebars";
import servicesRouter from "./routes/services.router.js";
import bookingsRouter from "./routes/bookings.router.js";
import messagesRouter from "./routes/messages.router.js";
import viewsRouter from "./routes/views.router.js";
import { AppError } from "./utils/errors.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Handlebars: plantillas en src/views, archivos estáticos (css/js del navegador) en /public
app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    helpers: {
      formatPrice: (value) =>
        Number(value).toLocaleString("es-AR", { style: "currency", currency: "ARS" }),
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// Vistas
app.use("/", viewsRouter);

// API REST

app.use("/api/services", servicesRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/messages", messagesRouter);

// 404 para rutas inexistentes
app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Ruta no encontrada" });
});

// Manejo de errores (incluye JSON mal formado)
app.use((err, req, res, next) => {
  // Errores controlados lanzados por los services (400, 404, 409...)
  if (err instanceof AppError) {
    const body = { status: "error", message: err.message };
    if (err.errors) body.errors = err.errors;
    return res.status(err.statusCode).json(body);
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ status: "error", message: "JSON inválido" });
  }
  console.error(err);
  res.status(500).json({ status: "error", message: "Error interno del servidor" });
});

export default app;
