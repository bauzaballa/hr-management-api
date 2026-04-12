import { config } from './src/core/server/config'

const isDevelopment = config.env === 'development'

export default {
  schema: './src/app/entities',
  out: './drizzle/migrations',
  dialect: 'postgresql',

  dbCredentials: {
    ...config.db,
    ssl: config.env === 'production' ? { rejectUnauthorized: false } : undefined,
  },

  // Configuración de migraciones
  verbose: isDevelopment, // Más logs en desarrollo
  strict: !isDevelopment, // Estricto solo en producción
  breakpoints: isDevelopment, // Permite puntos de ruptura en desarrollo
}
