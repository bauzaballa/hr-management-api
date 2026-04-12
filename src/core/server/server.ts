import 'dotenv/config';

import logger from '../../shared/utils/logger';
import { checkDBHealth } from '../database';
import app from './app';
import { config } from './config';

const startServer = async () => {
  const PORT = config.port;

  logger.info('🧠 Verificando conexión con la base de datos...');
  const dbStatus = await checkDBHealth();

  if (dbStatus.status !== 'healthy') {
    logger.error('No se pudo conectar a la base de datos. Abortando inicio del servidor.');
    logger.error(dbStatus.error);
    process.exit(1);
  }

  logger.info('✅ Base de datos verificada correctamente.');

  const server = app.listen(PORT, () => {
    logger.info(`🚀 Servidor corriendo en el puerto: ${PORT}`);
    logger.info(`🌎 Entorno: ${config.env}`);
    logger.info(`📅 Iniciado el: ${new Date().toLocaleString()}`);
  });

  // Manejadores de errores del servidor
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`⚠️  El puerto ${PORT} está en uso`);
    } else {
      logger.error('💥 Error crítico en el servidor:', error);
    }
    process.exit(1);
  });

  const shutdown = (signal: string) => {
    logger.info(`🛑 Recibida señal ${signal}. Cerrando servidor...`);
    server.close(() => {
      logger.info('✅ Servidor cerrado correctamente');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('⏳ Timeout: Forzando cierre del servidor');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};
// Manejo global de errores
process.on('unhandledRejection', (reason: Error) => {
  logger.error('⚠️  Unhandled Rejection:', reason instanceof Error ? reason.stack : reason);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('💥 Uncaught Exception:', error.stack);
  process.exit(1);
});

const main = async () => {
  try {
    await startServer();
  } catch (error) {
    logger.error('⛔ Error durante el inicio:', error instanceof Error ? error.stack : error);
    process.exit(1);
  }
};

main();
