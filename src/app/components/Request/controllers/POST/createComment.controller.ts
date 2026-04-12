import { ActivityService } from '@components/Activity/services';
import { db } from '@core/database';
import { socketClient } from '@core/server/services/socket.service';
import { request } from '@schemas/index';
import type { User } from '@shared/types';
import { AppError, formatJoiError, successResponse } from '@shared/utils';
import apiAuth from '@shared/utils/apiAuth';
import { eq } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

// Schema para validar parámetros de la URL
const getRequestSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const CommentRequestSchema = Joi.object({
  fullName: Joi.string(),
  userId: Joi.string(),
  departmentId: Joi.string(),
  description: Joi.string(),
  userIdReceive: Joi.string(),
});

const activityService = new ActivityService();

export const createCommentRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validar parámetros de la URL
    const { error: paramsError, value: paramsValue } = getRequestSchema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (paramsError) {
      const formatted = formatJoiError(paramsError);
      throw new AppError('Error de validación', 400, formatted);
    }

    // Validar cuerpo de la petición
    const { error: bodyError, value: bodyValue } = CommentRequestSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (bodyError) {
      const formatted = formatJoiError(bodyError);
      throw new AppError('Error de validación', 400, formatted);
    }

    const { id } = paramsValue;
    const { fullName, userId, departmentId, description } = bodyValue;

    // Buscar la solicitud existente
    const foundRequest = await db.query.request.findFirst({
      where: eq(request.id, id),
    });

    if (!foundRequest) {
      res.status(404).json({ message: 'Solicitud no encontrada' });
      return;
    }

    await activityService.createComment(id, fullName, description);

    //==============Notitifaction
    const respDirectorMkt = await apiAuth.get(
      `/user/get-all-users?departmentName=Marketing&role=director`
    );

    respDirectorMkt?.data.rows.map(async (el: User) => {
      socketClient.emit('receiveNotification', {
        userId: userId,
        userIdReceive: el.id,
        content: `${fullName} agregó un comentario a la solicitud`,
        type: 'notificacion-simple',
        urlRedirect: `/panel/solicitudes?requestId=${id}`,
        metadata: JSON.stringify({ requestId: foundRequest.id, comment: true }),
        departmentId: departmentId,
      });
    });

    successResponse(res, {
      message: 'Comentario agregado a la solicitud exitosamente',
      status: 201,
    });
  } catch (error) {
    next(error);
  }
};
