import { checkDBHealth, connectDB, disconnectDB } from '../core/database';
import logger from '../shared/utils/logger';

async function testConnection() {
  try {
    logger.info('🧪 Probando conexión a la base de datos...');

    // Intenta conectar
    const connected = await connectDB();
    if (connected) {
      logger.info('✅ Conexión exitosa a la base de datos');
    }

    // Verifica el estado de salud
    const health = await checkDBHealth();

    // Convertir el objeto a string para que se muestre correctamente
    logger.info('📊 Estado de salud de la DB: ' + JSON.stringify(health.status, null, 2));

    // Desconectar después de la prueba
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error en la conexión:', error);
    process.exit(1);
  }
}

// Manejar cierre graceful
process.on('SIGINT', async () => {
  logger.info('🛑 Cerrando conexión...');
  await disconnectDB();
  process.exit(0);
});

testConnection();
