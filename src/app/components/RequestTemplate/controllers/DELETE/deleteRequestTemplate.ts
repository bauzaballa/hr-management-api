import { db } from "@core/database";
import { requestTemplate } from "@schemas/index";
import { AppError, formatJoiError, successResponse } from "@shared/utils";
import { searchIdSchema } from "@shared/validations";
import { eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";

export const deleteRequestTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { error: idError, value: idValue } = searchIdSchema.validate(req.params, {
      abortEarly: false,
    });
    if (idError) {
      const formatted = formatJoiError(idError);
      throw new AppError("Error de validación del ID", 400, formatted);
    }

    const { id } = idValue;

    const result = await db.transaction(async (tx) => {
      const [existingTemplate] = await tx
        .select()
        .from(requestTemplate)
        .where(eq(requestTemplate.id, id))
        .limit(1);

      if (!existingTemplate) {
        throw new AppError(`No se encontró el template con ID: ${id}`, 404);
      }

      if (existingTemplate.status === "inactive") {
        throw new AppError(`El template con ID: ${id} ya está inactivo`, 400);
      }

      const [deletedTemplate] = await tx
        .update(requestTemplate)
        .set({
          status: "inactive",
        })
        .where(eq(requestTemplate.id, id))
        .returning();

      if (!deletedTemplate) {
        throw new AppError("Error al desactivar el template", 500);
      }
      return deletedTemplate;
    });

    successResponse(res, {
      data: result,
      message: "Template desactivado exitosamente",
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    next(error);
  }
};
