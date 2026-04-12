import 'dotenv/config';
import Joi from 'joi';
import type { AppConfig, DBConfig } from '../../shared/types';

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  APP_PORT: Joi.number().default(3000),
  APP_WHITELIST: Joi.string().default(''),

  DB_HOST: Joi.string().default('localhost'),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),

  MICROSERVICE_AUTH_API: Joi.string().required(),
  MICROSERVICE_AUTH_API_KEY: Joi.string().required(),

  SECRET_JWT_KEY: Joi.string().required(),

  MICROSERVICE_SOCKET_URL: Joi.string().required(),

  DIRECTION_API: Joi.string().required(),
})
  .unknown()
  .required();

const { value: envVars, error } = envSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  const details = error.details
    .map((d) => `- ${d.message} (variable: ${d.context?.key})`)
    .join('\n');

  console.error(`❌ Config validation error:\n${details}`);
  process.exit(1);
}

const nodeEnv = envVars.NODE_ENV as 'development' | 'production' | 'test';

const dbConfig: Record<typeof nodeEnv, DBConfig> = {
  development: {
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    user: envVars.DB_USER,
    password: envVars.DB_PASS,
    database: `${envVars.DB_NAME}-dev`,
  },

  test: {
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    user: envVars.DB_USER,
    password: envVars.DB_PASS,
    database: `${envVars.DB_NAME}-test`,
  },

  production: {
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    user: envVars.DB_USER,
    password: envVars.DB_PASS,
    database: `${envVars.DB_NAME}-prod`,
  },
};

export const config: AppConfig = {
  env: nodeEnv,
  port: envVars.APP_PORT,
  secretJwtKey: envVars.SECRET_JWT_KEY,
  apiAuthUrl: envVars.MICROSERVICE_AUTH_API,
  apiAuthKey: envVars.MICROSERVICE_AUTH_API_KEY,
  whiteList: envVars.APP_WHITELIST
    ? envVars.APP_WHITELIST.split(',').map((url: string) => url.trim())
    : [],
  db: dbConfig[nodeEnv],
  socketApi: envVars.MICROSERVICE_SOCKET_URL,
  apiDirectionUrl: envVars.DIRECTION_API,
};

//==================CORS==================
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // En desarrollo, permite localhost y sin origen (Postman, etc.)
    if (config.env === 'development') {
      const allowedOrigins = config.whiteList;

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // En producción, usa la whitelist
      // biome-ignore lint/style/noNonNullAssertion: <>
      if (config.whiteList.includes(origin!) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true, // Permite enviar cookies y headers de autenticación
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Api-Key',
    'X-User-Id',
    'X-User-Departments',
  ],
  exposedHeaders: ['Authorization'],
  maxAge: 86400, // 24 horas en caché
};
