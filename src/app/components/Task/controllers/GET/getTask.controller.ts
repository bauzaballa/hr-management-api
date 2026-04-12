import { db } from "@core/database";
import { taskField } from "@schemas/taskField.schema";
import { taskStep } from "@schemas/taskStep.schema";
import { taskTemplate } from "@schemas/taskTemplate.schema";
import { AppError, successResponse } from "@shared/utils";
import { eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
import Joi from "joi";

const getTaskIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const getTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = getTaskIdSchema.validate(req.params, { abortEarly: false });
    if (error) throw error;

    const { id } = value;

    // 1. Obtener el template
    const [template] = await db.select().from(taskTemplate).where(eq(taskTemplate.id, id));

    if (!template) {
      throw new AppError(`No se encontró ninguna plantilla para el ID: ${id}`, 400);
    }

    // 2. Obtener los steps del template
    const steps = await db
      .select()
      .from(taskStep)
      .where(eq(taskStep.taskTemplateId, id))
      .orderBy(taskStep.order);

    // 3. Para cada step, obtener sus fields
    const stepsWithFields = await Promise.all(
      steps.map(async (step) => {
        const fields = await db
          .select()
          .from(taskField)
          .where(eq(taskField.taskStepId, step.id))
          .orderBy(taskField.order);

        return {
          ...step,
          taskFields: fields,
        };
      })
    );

    const response = {
      ...template,
      taskSteps: stepsWithFields,
    };

    successResponse(res, { data: response, message: "Plantilla obtenida correctamente" });
  } catch (error) {
    next(error);
  }
};
