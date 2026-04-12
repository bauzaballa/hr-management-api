import { db } from "@core/database";
import { requestDepartment } from "@schemas/requestDepartment.schema";
import { requestTemplate } from "@schemas/requestTemplate.schema";
import { requestTemplateField } from "@schemas/requestTemplateField.schema";
import { AppError, successResponse } from "@shared/utils";
import { searchIdSchema } from "@shared/validations";
import { eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";

export const getRequestTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { error, value } = searchIdSchema.validate(req.params, { abortEarly: false });
    if (error) throw error;

    const { id } = value;

    const [template] = await db.select().from(requestTemplate).where(eq(requestTemplate.id, id));

    if (!template) {
      throw new AppError(`No se encontró ninguna plantilla para el ID: ${id}`, 404);
    }

    const fields = await db
      .select()
      .from(requestTemplateField)
      .where(eq(requestTemplateField.templateId, id))
      .orderBy(requestTemplateField.order);

    const departments = await db
      .select()
      .from(requestDepartment)
      .where(eq(requestDepartment.templateId, id));

    const parsedFields = fields.map((field) => ({
      ...field,
      options: field.options
        ? typeof field.options === "string"
          ? JSON.parse(field.options)
          : field.options
        : null,
    }));

    const response = {
      ...template,
      fields: parsedFields,
      departmentIds: departments.map((dept) => dept.departmentId),
    };

    successResponse(res, { data: response, message: "Plantilla obtenida correctamente" });
  } catch (error) {
    next(error);
  }
};
