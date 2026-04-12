import { healthController } from "@core/server/controllers/healthController";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { createServer } from "node:http";
import routes from "../../app/routes";
import { errorHandler } from "../../shared/utils/errorHandler";
import { config, corsOptions } from "./config"; // Importa corsOptions desde config
import { extractUserContext, verifyToken } from "./middleware/verifyToken";
import { socketClient } from "./services/socket.service";
import { setupSwagger } from "./swagger";

const app = express();
const server = createServer(app);

if (config.env === "development") app.use(morgan("dev"));

app.use(express.json());
app.use(cookieParser());

// Usa la configuración CORS desde config.ts
app.use(cors(corsOptions));

socketClient.connect();

// Configurar Swagger
setupSwagger(app);

// Ruta de health check
app.get("/rrhh/api/v1/health", healthController.getServerInfo.bind(healthController));
app.use(extractUserContext);

routes.forEach((route) => {
  app.use("/rrhh/api/v1/", verifyToken, route);
});

app.use(errorHandler);

export { server };
export default app;
