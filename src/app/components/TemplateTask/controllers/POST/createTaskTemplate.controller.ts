import { db } from "@core/database";
import { taskField, taskStep, taskTemplate } from "@schemas/index";
import { AppError, formatJoiError, successResponse } from "@shared/utils";
import { templateTaskSchema } from "@shared/validations";
import type { NextFunction, Request, Response } from "express";

export const createTaskTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { error: requestValuesError, value } = templateTaskSchema.validate(req.body);
    if (requestValuesError) {
      const formatted = formatJoiError(requestValuesError);
      throw new AppError("Error de validación", 400, formatted);
    }

    const { title, taskSteps = [], subarea } = value;

    if (!title) {
      throw new AppError("Missing required fields", 400, { missing: "title" });
    }

    const result = await db.transaction(async (tx) => {
      // Crear el template principal
      const [createdTaskTemplate] = await tx
        .insert(taskTemplate)
        .values({
          title,
          subarea: subarea || null,
        })
        .returning();

      if (taskSteps.length > 0) {
        for (const [stepIndex, step] of taskSteps.entries()) {
          // Crear el step
          const [createdTaskStep] = await tx
            .insert(taskStep)
            .values({
              title: step.title || `Paso ${stepIndex + 1}`,
              subTitle: step.subTitle || null,
              typeStep: step.typeStep || "director",
              stepStatus: false,
              order: step.order || stepIndex + 1,
              taskTemplateId: createdTaskTemplate.id,
            })
            .returning();

          //PROCESO LOS STEP.TASKFIELDS
          if (step.fields && step.fields.length > 0) {
            for (const field of step.fields) {
              await tx
                .insert(taskField)
                .values({
                  label: field.label || "",
                  showRequest: field.showRequest || false,
                  required: field.required || false,
                  options: field.options || [],
                  isMultiple: field.isMultiple || true,
                  limitFile: field.limitFile,
                  order: field.order,
                  text: field.text || "",
                  placeHolder: field.placeHolder || "",
                  type: field.type,
                  directionMapOption: field.directionMapOption,
                  applicantId: field.applicantId || null,
                  taskStepId: createdTaskStep.id,
                })
                .returning();
            }
          }

          //PROCESO LOS STEP.Applicants
          if (step.applicant && step.applicant.length > 0) {
            for (const field of step.applicant) {
              await tx
                .insert(taskField)
                .values({
                  label: field.label || "",
                  type: field.type,
                  required: field.required || false,
                  placeHolder: field.placeHolder || "",
                  directionMapOption: field.directionMapOption,
                  order: field.order,
                  taskStepId: createdTaskStep.id,
                  isMultiple: field.isMultiple || false,
                  options: field.options || [],
                  showRequest: false,
                  applicantId: null,
                  limitFile: field.limitFile,
                  text: field.text || "",
                })
                .returning();
            }
          }
        }
      }

      return createdTaskTemplate;
    });

    successResponse(res, {
      data: result,
      message: "Template created successfully",
      status: 201,
    });
  } catch (error) {
    next(error);
  }
};
