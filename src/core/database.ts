import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, type PoolClient } from 'pg';
import logger from '../shared/utils/logger';
import * as schema from './database.schemas';
import { config } from './server/config';

const poolConfig = {
  ...config.db,
  timezone: 'America/Argentina/Buenos_Aires',
  max: 20, // Número máximo de clientes en el pool
  idleTimeoutMillis: 30000, // Tiempo máximo de inactividad
  connectionTimeoutMillis: 2000, // Tiempo máximo para establecer conexión
  ssl: config.env === 'production' ? { rejectUnauthorized: false } : undefined,
};

const pool: Pool = new Pool(poolConfig);

// Manejo de eventos del pool
pool.on('connect', () => {
  logger.debug(`🔄 Nueva conexión establecida con la base de datos`);
});

pool.on('error', (err: Error) => {
  logger.error('💥 Error inesperado en el pool de conexiones:', err);
});

export const db = drizzle(pool, { schema });

// Conexión y desconexión
export const connectDB = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    logger.info('✅ Conectado a la base de datos PostgreSQL');
    client.release();
    return true;
  } catch (error) {
    logger.error('❌ Error al conectar a la base de datos:', error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<boolean> => {
  try {
    await pool.end();
    logger.info('🚪 Conexión con la base de datos cerrada');
    return true;
  } catch (error) {
    logger.error('❌ Error al desconectar de la base de datos:', error);
    throw error;
  }
};

// Health check mejorado
export const checkDBHealth = async () => {
  let client: PoolClient | null = null;
  try {
    client = await pool.connect();
    const startTime = Date.now();

    // Consulta más completa para health check
    const { rows } = await client.query(`
      SELECT 
        NOW() as current_time,
        version(),
        (SELECT count(*) FROM pg_stat_activity) as active_connections,
        (SELECT setting FROM pg_settings WHERE name = 'max_connections') as max_connections
    `);

    const pingTime = Date.now() - startTime;

    return {
      status: 'healthy',
      timestamp: rows[0].current_time,
      ping: `${pingTime}ms`,
      database_version: rows[0].version,
      connections: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
        active: parseInt(rows[0].active_connections),
        max_allowed: parseInt(rows[0].max_connections),
      },
      utilization: {
        pool: `${((pool.totalCount / parseInt(rows[0].max_connections)) * 100).toFixed(1)}%`,
        system: `${(
          (parseInt(rows[0].active_connections) / parseInt(rows[0].max_connections)) * 100
        ).toFixed(1)}%`,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      connections: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
      },
    };
  } finally {
    if (client) client.release();
  }
};
