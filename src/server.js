import { createServer } from "node:http";
import app from "./app.js";
import { config } from "./config/env.config.js";
import { connectDB } from "./config/db.config.js";
import { initSocket } from "./realtime/socket.js";

try {
  await connectDB();
} catch (error) {
  console.error(`No se pudo conectar a MongoDB: ${error.message}`);
  process.exit(1);
}

// Express y Socket.io comparten el mismo servidor HTTP
const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(config.port, () => {
  console.log(`Servidor escuchando en http://localhost:${config.port} (${config.nodeEnv})`);
});
