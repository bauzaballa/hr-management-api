import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../../../shared/utils/errorHandler';
import { config } from '../config';

export const extractUserContext = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] || req.headers['X-User-Id'];
    const departmentsName = (req.headers['x-user-departments'] ||
      req.headers['X-User-Departments']) as string;

    if (!userId) throw new AppError('Sin autorización: falta el id del usuario', 403);
    if (!departmentsName)
      throw new AppError('Sin autorización: falta el nombre del departamento', 403);

    const departmentsUser: string[] = departmentsName.split(',');

    req.decodedToken = {
      id: String(userId),
      departments: departmentsUser,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const verifyToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bearerHeader = req.headers.authorization || (req.headers.Authorization as string);
    if (!bearerHeader) throw new AppError('Sin autorización: token faltante', 403);

    const token = bearerHeader.split(' ')[1];
    if (!token) throw new AppError('Sin autorización: token inválido');

    const isValid = token === config.apiAuthKey;

    if (!isValid) throw new AppError('Sin autorización: token expirado o inválido', 403);
    next();
  } catch (error) {
    next(error);
  }
};
