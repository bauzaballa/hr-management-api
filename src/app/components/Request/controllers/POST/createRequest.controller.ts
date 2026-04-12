import { ActivityService } from "@components/Activity/services";
import { db } from "@core/database";
import { socketClient } from "@core/server/services/socket.service";
import { request } from "@schemas/request.schema";
import type { User } from "@shared/types";
import { AppError, apiAuth, formatJoiError, successResponse } from "@shared/utils";
import { createRequestSchema } from "@shared/validations";
import type { NextFunction, Request, Response } from "express";

export const createRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Validar datos de entrada
    const activityService = new ActivityService();
    const { error: requestValuesError, value: validatedRequest } = createRequestSchema.validate(
      req.body,
      {
        abortEarly: false,
        stripUnknown: true,
      }
    );

    if (requestValuesError) {
      const formatted = formatJoiError(requestValuesError);
      throw new AppError("Error de validación", 400, formatted);
    }

    const {
      title,
      content,
      departmentId,
      requestTemplateId,
      receiverUserId,
      formResponse,
      priority,
      unitId,
      userId,
    } = validatedRequest;

    const createdRequest = await db.transaction(async (tx) => {
      const timeline = [
        {
          status: "pendiente",
          timestamp: new Date().toISOString(),
          userId: userId,
          note: "Solicitud creada",
        },
      ];

      const [newRequest] = await tx
        .insert(request)
        .values({
          title,
          content: content || null,
          departmentId,
          requestedByDepartmentId: departmentId,
          unitId: unitId || null,
          receiverUserId: receiverUserId || null,
          createdByUserId: userId,
          requestTemplateId: requestTemplateId || null,
          priority: priority || "media",
          formResponse: formResponse || null,
          timeline: timeline,
          status: "pendiente",
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return newRequest;
    });

    // ========= NOTIFICACION ===========
    const { fullName, departmentName } = validatedRequest;

    try {
      const respDirectorMkt = await apiAuth.get(
        `/user/get-all-users?departmentName=RRHH&role=director`
      );

      if (respDirectorMkt?.data?.rows) {
        const directorsFilters = respDirectorMkt.data.rows.filter((el: User) => el.id !== userId);

        // Enviar notificaciones a cada director
        directorsFilters?.forEach(async (el: User) => {
          socketClient.emit("receiveNotification", {
            userId, // Quien envía (el creador)
            userIdReceive: el.id, // Quien recibe (el director)
            roomId: el.id, // ID de la sala (usualmente el ID del receptor)
            content: `Nueva solicitud de ${fullName || "un usuario"}`,
            type: "notificacion-simple",
            urlRedirect: `/panel/solicitudes?requestId=${createdRequest.id}`,
            metadata: {
              requestId: createdRequest.id,
              comment: true,
            },
            departmentName: departmentName || "Sin departamento",
          });
        });
      }
    } catch (notificationError) {
      console.error("Error enviando notificaciones:", notificationError);
    }

    //==========HISTORIAL==========
    await activityService.createRequestActivity(
      fullName,
      `Nueva solicitud de ${fullName || "un usuario"}`,
      createdRequest.id,
      "history"
    );

    successResponse(res, {
      message: "Solicitud creada exitosamente",
      data: {
        request: createdRequest,
      },
    });
  } catch (error) {
    next(error);
  }
};
