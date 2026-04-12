import { db } from "@core/database";
import { request } from "@schemas/request.schema";
import { AppError, successResponse } from "@shared/utils";
import { searchIdSchema } from "@shared/validations";
import { eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";

export const getRequestById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { error, value } = searchIdSchema.validate(req.params, { abortEarly: false });
    if (error) throw error;

    const { id } = value;

    const requestWithRelations = await db.query.request.findFirst({
      where: eq(request.id, id),
      with: {
        requestTemplate: true,
        activities: {
          orderBy: (activities, { desc }) => [desc(activities.createdAt)],
          limit: 50,
        },
        task: true,
      },
    });

    if (!requestWithRelations) {
      throw new AppError("Solicitud no encontrada", 404);
    }

    successResponse(res, {
      data: {
        request: requestWithRelations,
      },
    });
  } catch (error) {
    next(error);
  }
};
