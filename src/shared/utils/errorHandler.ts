import { NextFunction, Request, Response } from 'express';
import { DatabaseError } from 'pg';
import Joi from 'joi';

import { errorResponse } from './response';

/**
 * Error controlado que puede lanzar el servicio o controlador
 * Ejemplo:
 *    throw new AppError("Usuario no encontrado", 404)
 */
export class AppError extends Error {
  statusCode: number;
  cause?: any;

  constructor(message: string, statusCode = 400, cause?: any) {
    super(message);
    this.statusCode = statusCode;
    this.cause = cause;
  }
}

interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  cause?: any;
}

/**
 * Middleware global para manejo uniforme de errores
 */
export function errorHandler(err: CustomError, req: Request, res: Response, _next: NextFunction) {
  console.error('🔥 Error capturado:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';
  let details: any = null;

  // ───────────────────────────────────────────────
  // 🧱 Errores de base de datos (Drizzle/PostgreSQL)
  // ───────────────────────────────────────────────
  if (err instanceof DatabaseError) {
    switch (err.code) {
      case '23505': // unique_violation
        statusCode = 409;
        message = 'Registro duplicado. Ya existe un elemento con esos datos.';
        break;

      case '23503': // foreign_key_violation
        statusCode = 400;
        message = 'Violación de integridad referencial (foreign key constraint).';
        break;

      case '22P02': // invalid_text_representation
        statusCode = 400;
        message = 'Formato o tipo de dato inválido.';
        break;

      default:
        statusCode = 500;
        message = 'Error en la base de datos.';
        break;
    }
  }

  // ───────────────────────────────────────────────
  // 🧩 Errores de validación con Joi
  // ───────────────────────────────────────────────
  else if (Joi.isError(err)) {
    statusCode = 400;
    message = 'Error de validación en los datos enviados.';
    details = err.details.map((d) => ({
      path: d.path.join('.'),
      message: d.message,
    }));
  }

  // ───────────────────────────────────────────────
  // 🧱 Errores personalizados (AppError)
  // ───────────────────────────────────────────────
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.cause || null;
  }

  // ───────────────────────────────────────────────
  // 🔄 Enviar respuesta estandarizada
  // ───────────────────────────────────────────────
  return errorResponse(res, {
    message,
    status: statusCode,
    details,
    path: req.originalUrl,
  });
}
