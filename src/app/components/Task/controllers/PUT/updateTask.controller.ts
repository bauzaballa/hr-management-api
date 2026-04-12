import { db } from "@core/database";
import { applicant, taskField, taskStep, taskTemplate } from "@schemas/index";
import { AppError, formatJoiError, successResponse } from "@shared/utils";
import { templateTaskSchema } from "@shared/validations";
import { and, eq, inArray, isNull } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
import { taskTemplateService } from "../services/taskTemplate.service";

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const templateId = Number(req.params.id);

    // Validación del ID
    if (isNaN(templateId) || templateId <= 0) {
      throw new AppError("ID de template inválido", 400);
    }

    // ✅ Usar el schema de UPDATE (más flexible)
    const { error: requestValuesError, value } = templateTaskSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: false, // No eliminar campos
      allowUnknown: true, // Permitir campos adicionales como timestamps
    });

    if (requestValuesError) {
      const formatted = formatJoiError(requestValuesError);
      throw new AppError("Error de validación", 400, formatted);
    }

    const { title, taskSteps = [], subarea } = value;

    // Verificar si el template existe
    const [existingTemplate] = await db
      .select()
      .from(taskTemplate)
      .where(eq(taskTemplate.id, templateId))
      .limit(1);

    if (!existingTemplate) {
      throw new AppError("Template no encontrado", 404);
    }

    // Iniciar transacción
    const result = await db.transaction(async (tx) => {
      // 1. Actualizar el template principal (solo si se envió title)
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (title !== undefined) updateData.title = title;
      if (subarea !== undefined) updateData.subarea = subarea || null;

      const [updatedTemplate] = await tx
        .update(taskTemplate)
        .set(updateData)
        .where(eq(taskTemplate.id, templateId))
        .returning({ id: taskTemplate.id });

      // Si no se envían taskSteps, retornar temprano (solo actualizó título/subarea)
      if (!taskSteps || taskSteps.length === 0) {
        return updatedTemplate;
      }

      // Obtener steps existentes
      const existingSteps = await tx
        .select({ id: taskStep.id })
        .from(taskStep)
        .where(eq(taskStep.taskTemplateId, templateId));

      const existingStepIds = existingSteps.map((step) => step.id);
      const incomingStepIds: number[] = [];

      // 2. Procesar cada step
      for (const [stepIndex, step] of taskSteps.entries()) {
        if (step.id && existingStepIds.includes(step.id)) {
          // UPDATE step existente
          const stepUpdateData: any = {
            updatedAt: new Date(),
          };

          if (step.title !== undefined) stepUpdateData.title = step.title;
          if (step.subTitle !== undefined) stepUpdateData.subTitle = step.subTitle || null;
          if (step.typeStep !== undefined) stepUpdateData.typeStep = step.typeStep;
          if (step.order !== undefined) stepUpdateData.order = step.order;

          const [updatedStep] = await tx
            .update(taskStep)
            .set(stepUpdateData)
            .where(eq(taskStep.id, step.id))
            .returning({ id: taskStep.id });

          incomingStepIds.push(updatedStep.id);

          // ✅ Procesar fields del step (si se enviaron)
          if (step.taskFields !== undefined) {
            if (Array.isArray(step.taskFields) && step.taskFields.length > 0) {
              await taskTemplateService.processFieldsForUpdate(
                tx,
                step.id,
                step.taskFields,
                false // no es applicant
              );
            } else {
              // Si se envió array vacío [], eliminar los existentes
              await tx
                .delete(taskField)
                .where(and(eq(taskField.taskStepId, step.id), isNull(taskField.applicantId)));
            }
          }
          // Si no se envió taskFields, NO hacer nada (mantener los existentes)

          // ✅ Procesar applicants del step (SOLO si se envió applicant)
          if (step.applicant !== undefined) {
            if (step.applicant) {
              await processApplicantsForUpdate(tx, step.id, step.applicant);
            } else {
              // Si se envió null o false, eliminar applicants existentes
              await tx.delete(applicant).where(eq(applicant.taskStepId, step.id));
              // También eliminar sus fields
              const existingApplicants = await tx
                .select({ id: applicant.id })
                .from(applicant)
                .where(eq(applicant.taskStepId, step.id));

              const applicantIds = existingApplicants.map((app) => app.id);
              if (applicantIds.length > 0) {
                await tx.delete(taskField).where(inArray(taskField.applicantId, applicantIds));
              }
            }
          }
          // Si no se envió applicant, NO hacer nada (mantener los existentes)
        } else {
          // CREATE nuevo step
          const [newStep] = await tx
            .insert(taskStep)
            .values({
              title: step.title || `Paso ${stepIndex + 1}`,
              subTitle: step.subTitle || null,
              typeStep: step.typeStep || "director",
              stepStatus: false,
              order: step.order || stepIndex + 1,
              taskTemplateId: templateId,
            })
            .returning({ id: taskStep.id });

          incomingStepIds.push(newStep.id);

          // ✅ Procesar fields del nuevo step (si se enviaron)
          if (step.taskFields && Array.isArray(step.taskFields) && step.taskFields.length > 0) {
            const fieldsToCreate = await taskTemplateService.processFields(
              step.taskFields,
              newStep.id,
              null
            );

            if (fieldsToCreate.length > 0) {
              await tx.insert(taskField).values(fieldsToCreate);
            }
          }

          // ✅ Procesar applicant del nuevo step (si se envió)
          if (step.applicant) {
            await processApplicantsForCreate(tx, newStep.id, step.applicant);
          }
        }
      }

      // 3. Eliminar steps que no están en el nuevo array
      const stepsToDelete = existingStepIds.filter((id) => !incomingStepIds.includes(id));
      if (stepsToDelete.length > 0) {
        // Primero eliminar los fields y applicants asociados
        await tx
          .delete(taskField)
          .where(and(inArray(taskField.taskStepId, stepsToDelete), isNull(taskField.applicantId)));

        // Eliminar fields de applicants
        const applicantsToDelete = await tx
          .select({ id: applicant.id })
          .from(applicant)
          .where(inArray(applicant.taskStepId, stepsToDelete));

        const applicantIds = applicantsToDelete.map((app) => app.id);
        if (applicantIds.length > 0) {
          await tx.delete(taskField).where(inArray(taskField.applicantId, applicantIds));
        }

        // Eliminar applicants
        await tx.delete(applicant).where(inArray(applicant.taskStepId, stepsToDelete));

        // Luego eliminar los steps
        await tx.delete(taskStep).where(inArray(taskStep.id, stepsToDelete));
      }

      return updatedTemplate;
    });

    // Obtener el template completo actualizado
    const fullTemplate = await getCompleteTemplate(templateId);

    successResponse(res, {
      data: {
        templateId: result.id,
        taskTemplate: fullTemplate,
      },
      message: "Template actualizado exitosamente",
      status: 200,
    });
  } catch (error: any) {
    console.error("Error updating template:", error);

    if (error.code === "23505") {
      next(new AppError("A template with this title already exists", 409));
    } else if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError("Internal server error", 500, error.message));
    }
  }
};

// Función auxiliar para procesar applicants en update
async function processApplicantsForUpdate(tx: any, taskStepId: number, applicantData: any) {
  try {
    // Verificar si applicantData es un array de fields (formato antiguo)
    // o un objeto con taskFields (formato correcto)
    let applicantFields = [];
    let applicantStatus = "pending";

    if (Array.isArray(applicantData)) {
      // Formato antiguo: applicant es directamente un array de fields
      applicantFields = applicantData;
    } else if (applicantData && Array.isArray(applicantData.taskFields)) {
      // Formato correcto: applicant es objeto con taskFields
      applicantFields = applicantData.taskFields;
      applicantStatus = applicantData.status || "pending";
    }

    // Obtener applicant existente para este step
    const [existingApplicant] = await tx
      .select()
      .from(applicant)
      .where(eq(applicant.taskStepId, taskStepId))
      .limit(1);

    if (existingApplicant) {
      // Actualizar applicant existente
      await tx
        .update(applicant)
        .set({
          status: applicantStatus,
          updatedAt: new Date(),
        })
        .where(eq(applicant.id, existingApplicant.id));

      // Procesar fields del applicant
      if (applicantFields.length > 0) {
        await taskTemplateService.processFieldsForUpdate(
          tx,
          Number(existingApplicant.id),
          applicantFields,
          true // es applicant
        );
      } else {
        // Eliminar fields del applicant si no hay nuevos
        await tx.delete(taskField).where(eq(taskField.applicantId, existingApplicant.id));
      }
    } else if (applicantFields.length > 0) {
      // Crear nuevo applicant si no existe pero hay fields
      await processApplicantsForCreate(tx, taskStepId, applicantData);
    }
  } catch (error) {
    console.error("Error processing applicants for update:", error);
    throw error;
  }
}

// Función auxiliar para crear applicants (similar al create)
async function processApplicantsForCreate(tx: any, taskStepId: number, applicantData: any) {
  let applicantFields = [];

  if (Array.isArray(applicantData)) {
    applicantFields = applicantData;
  } else if (applicantData && Array.isArray(applicantData.taskFields)) {
    applicantFields = applicantData.taskFields;
  }

  if (applicantFields.length > 0) {
    const { v4: uuidv4 } = require("uuid");

    const [createdApplicant] = await tx
      .insert(applicant)
      .values({
        id: uuidv4(),
        status: applicantData.status || "pending",
        taskStepId: taskStepId,
        statusDirector: false,
        statusColaborador: false,
        statusRequest: false,
      })
      .returning();

    const applicantFieldsToCreate = await taskTemplateService.processFields(
      applicantFields,
      taskStepId,
      createdApplicant.id
    );

    if (applicantFieldsToCreate.length > 0) {
      await tx.insert(taskField).values(applicantFieldsToCreate);
    }
  }
}

// Función para obtener template completo
async function getCompleteTemplate(templateId: number) {
  // Obtener template
  const [template] = await db.select().from(taskTemplate).where(eq(taskTemplate.id, templateId));

  if (!template) return null;

  // Obtener steps
  const steps = await db
    .select()
    .from(taskStep)
    .where(eq(taskStep.taskTemplateId, templateId))
    .orderBy(taskStep.order);

  // Obtener details para cada step
  const stepsWithDetails = await Promise.all(
    steps.map(async (step) => {
      const [fields, applicants] = await Promise.all([
        // Fields del step
        db
          .select()
          .from(taskField)
          .where(and(eq(taskField.taskStepId, step.id), isNull(taskField.applicantId)))
          .orderBy(taskField.order),

        // Applicants del step
        db.select().from(applicant).where(eq(applicant.taskStepId, step.id)),
      ]);

      // Obtener fields de cada applicant
      const applicantsWithFields = await Promise.all(
        applicants.map(async (app) => {
          const appFields = await db
            .select()
            .from(taskField)
            .where(eq(taskField.applicantId, app.id))
            .orderBy(taskField.order);

          return {
            ...app,
            taskFields: taskTemplateService.parseFields(appFields),
          };
        })
      );

      return {
        ...step,
        taskFields: taskTemplateService.parseFields(fields),
        applicants: applicantsWithFields,
      };
    })
  );

  return {
    ...template,
    taskSteps: stepsWithDetails,
  };
}
