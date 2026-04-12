import { ActivityService } from "@components/Activity/services";
import { db } from "@core/database";
import { socketClient } from "@core/server/services/socket.service";
import { type Request as RequestType, request } from "@schemas/request.schema";
import type { User } from "@shared/types";
import { AppError, apiAuth, formatJoiError, successResponse } from "@shared/utils";
import { searchIdSchema, updateRequestSchema } from "@shared/validations";
import { eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";

export const updateRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const activityService = new ActivityService();
    const { error: idError, value: idValue } = searchIdSchema.validate(req.params);
    if (idError) {
      throw new AppError("ID inválido", 400);
    }

    const { id: requestId } = idValue;

    const { error: validationError, value: updateData } = updateRequestSchema.validate(req.body);
    if (validationError) {
      const formatted = formatJoiError(validationError);
      throw new AppError("Error de validación", 400, formatted);
    }

    // 3. Verificar existencia
    const [existingRequest] = await db
      .select()
      .from(request)
      .where(eq(request.id, requestId))
      .limit(1);

    if (!existingRequest) {
      throw new AppError("Solicitud no encontrada", 404);
    }

    // 4. Preparar actualización
    const updatePayload: RequestType = {
      ...updateData,
      updatedAt: new Date(),
    };

    // 5. Manejar timeline si cambia estado
    if (updateData.status && updateData.status !== existingRequest.status) {
      const timeline = Array.isArray(existingRequest.timeline) ? existingRequest.timeline : [];

      timeline.push({
        status: updateData.status,
        timestamp: new Date().toISOString(),
        userId: req.body.userId || "system",
        note: updateData.note || `Estado cambiado a ${updateData.status}`,
      });

      updatePayload.timeline = timeline;

      // Marcar como completado si es finalizado o rechazado
      if (updateData.status === "finalizada" || updateData.status === "rechazada") {
        updatePayload.isCompleted = true;
      }
    }

    // 6. Actualizar
    const [updatedRequest] = await db
      .update(request)
      .set(updatePayload)
      .where(eq(request.id, requestId))
      .returning();

    // ========= NOTIFICACION ===========
    if (updateData.status && updateData.status !== existingRequest.status) {
      try {
        const updatingUserId = req.body.userId;

        const respDirectorMkt = await apiAuth.get(
          `/user/get-all-users?departmentName=RRHH&role=director`
        );

        if (respDirectorMkt?.data?.rows) {
          // Filtrar para no enviar notificación al mismo usuario que actualiza
          const directorsFilters = respDirectorMkt.data.rows.filter(
            (el: User) => el.id !== updatingUserId
          );

          // Obtener información del usuario (puedes hacer una petición adicional si necesitas)
          const userInfo = await apiAuth.get(`/user/${updatingUserId}`);
          const fullName = userInfo?.data?.fullName || "un usuario";

          // Enviar notificaciones a cada director
          directorsFilters?.forEach(async (el: User) => {
            socketClient.emit("receiveNotification", {
              userId: updatingUserId, // Quien envía
              userIdReceive: el.id, // Quien recibe
              roomId: el.id, // ID de la sala
              content: `Solicitud actualizada: ${existingRequest.title} por ${fullName}`,
              type: "request-updated",
              urlRedirect: `/panel/solicitudes?requestId=${updatedRequest.id}`,
              metadata: {
                requestId: updatedRequest.id,
                oldStatus: existingRequest.status,
                newStatus: updateData.status,
              },
              departmentName: "RRHH",
            });
          });
        }
      } catch (notificationError) {
        console.error("Error enviando notificaciones:", notificationError);
      }
    }

    // ========= HISTORIAL ==========
    try {
      // Si tienes un activityService, asegúrate de importarlo
      await activityService.createRequestActivity(
        req.body.userId || "system",
        `Solicitud actualizada: ${existingRequest.title}`,
        updatedRequest.id,
        "history"
      );
    } catch (activityError) {
      console.error("Error creando actividad:", activityError);
    }

    successResponse(res, {
      data: {
        request: updatedRequest,
      },
      message: "Solicitud actualizada exitosamente",
    });
  } catch (error) {
    next(error);
  }
};
