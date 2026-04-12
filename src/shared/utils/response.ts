import type { Response } from 'express';

interface SuccessResponse {
  message?: string;
  data?: any;
  status?: number;
}

interface ErrorResponse {
  message: string;
  status?: number;
  error?: any;
  details?: any;
  path?: string;
}

/**
 * Respuesta exitosa estandarizada
 */
export function successResponse(res: Response, data: SuccessResponse) {
  return res.status(data.status || 200).json({
    success: true,
    message: data.message || 'Operación exitosa.',
    data: data.data ?? null,
  });
}

/**
 * Respuesta de error estandarizada
 */
export function errorResponse(res: Response, data: ErrorResponse) {
  return res.status(data.status || 500).json({
    success: false,
    message: data.message || 'Error interno del servidor.',
    ...(data.details ? { details: data.details } : {}),
    ...(data.path ? { path: data.path } : {}),
    ...(process.env.NODE_ENV === 'development' && data.error ? { error: data.error } : {}),
  });
}
