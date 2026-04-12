import { db } from "@core/database";
import { applicant } from "@schemas/applicant";
import { task } from "@schemas/task.schema";
import { taskField } from "@schemas/taskField.schema";
import { taskStep } from "@schemas/taskStep.schema";
import { taskTemplate } from "@schemas/taskTemplate.schema";
import { successResponse } from "@shared/utils";
import { eq, inArray } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const templateId = Number(req.params.id);

    if (!Number(templateId)) {
      res.status(400).json({
        success: false,
        message: "ID de template inválido",
      });
      return;
    }
    await db.transaction(async (tx) => {
      const [template] = await tx
        .select()
        .from(taskTemplate)
        .where(eq(taskTemplate.id, templateId))
        .limit(1);

      if (!template) {
        throw new Error("Template not found");
      }

      // Verificar si hay tareas usando este template
      const tasksUsingTemplate = await tx
        .select({ id: task.id })
        .from(task)
        .where(eq(task.taskTemplateId, templateId));

      if (tasksUsingTemplate.length > 0) {
        throw new Error("No se puede eliminar el template porque hay tareas que lo utilizan");
      }

      const steps = await tx
        .select({ id: taskStep.id })
        .from(taskStep)
        .where(eq(taskStep.taskTemplateId, templateId));

      const stepIds = steps.map((step) => step.id);

      if (stepIds.length > 0) {
        const applicants = await tx
          .select({ id: applicant.id })
          .from(applicant)
          .where(inArray(applicant.taskStepId, stepIds));

        const applicantIds = applicants.map((applicant) => applicant.id);

        if (applicantIds.length > 0) {
          // Eliminar taskFields asociados a applicants
          await tx.delete(taskField).where(inArray(taskField.applicantId, applicantIds));

          // Eliminar applicants
          await tx.delete(applicant).where(inArray(applicant.id, applicantIds));
        }

        // Eliminar taskFields que no tienen applicantId (null)
        await tx.delete(taskField).where(inArray(taskField.taskStepId, stepIds));

        // Eliminar pasos
        await tx.delete(taskStep).where(inArray(taskStep.id, stepIds));
      }

      // Eliminar el template
      await tx.delete(taskTemplate).where(eq(taskTemplate.id, templateId));
    });

    successResponse(res, {
      data: {},
      message: "Template delete successfully",
      status: 201,
    });
  } catch (error) {
    next(error);
  }
};
