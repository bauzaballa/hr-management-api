import { ActivityService } from "@components/Activity/services";
import { db } from "@core/database";
import { socketClient } from "@core/server/services/socket.service";
import { applicant } from "@schemas/applicant";
import { task } from "@schemas/task.schema";
import { taskStep } from "@schemas/taskStep.schema";
import { taskTemplate } from "@schemas/taskTemplate.schema";
import { AppError, successResponse } from "@shared/utils";
import { eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const activityService = new ActivityService();
    // const { error: requestValuesError, value } = TaskSchema.validate(req.body);
    // if (requestValuesError) {
    //   const formatted = formatJoiError(requestValuesError);
    //   throw new AppError("Error de validación", 400, formatted);
    // }

    const data = req.body;

    const newTasksData = {
      title: data.title,
      departmentId: data.departmentId,
      userIds: Array.isArray(data.userIds) ? JSON.stringify(data.userIds) : data.userIds,
      priority: data.priority,
      status: data.status,
      description: data.description,
      startDate: data.startDate || null,
      dueDate: data.dueDate || null,
      isDraft: false, // Siempre false en create según tu lógica original
      subareaId: data.subareaId,
      position: data.position,
      category: data.category || "No comercial",
      unitId: data.unitId,
      userIdCreated: data.userIdCreated,
      requestId: data.requestId,
      taskTemplateName: data.taskTemplateName,
      taskTemplateId: data.templateId,
    };

    const result = await processCreateTaskWithSteps(data, newTasksData);

    // ==== HISTORIAL ====
    if (result.taskId && data.firstNameUser) {
      await activityService.createTaskActivity(
        data.firstNameUser || "Usuario Desconocido",
        "se creo una task",
        result.taskId,
        "history"
      );
    }

    // ==== Notificacion ====

    // socketClient.emit("receiveNotification", {
    //   userId,
    //   userIdReceive: el.id,
    //   roomId: el.id, // o requestId, depende de tu diseño
    //   content: `Nueva solicitud de ${validatedRequest.fullName}`,
    //   type: "notificacion-simple",
    //   urlRedirect: `/panel/solicitudes?requestId=${createdRequest.id}`,
    //   metadata: { requestId: createdRequest.id, comment: true },
    //   departmentName: validatedRequest.departmentName,
    // });
    socketClient.emit("updateTable", {});

    successResponse(res, {
      data: {
        taskId: result.taskId,
        message: result.message,
      },
      message: result.message,
      status: 201,
    });
  } catch (error) {
    next(error);
  }
};

const processCreateTaskWithSteps = async (data: any, taskData: any) => {
  return await db.transaction(async (tx) => {
    const { taskSteps, templateId } = data;

    // 1. Crear la tarea principal
    const [createdTask] = await tx.insert(task).values(taskData).returning();

    if (!createdTask) {
      throw new AppError("Failed to create task", 500);
    }

    const taskId = createdTask.id;

    // 2. Verificar si el template existe
    const [template] = await tx
      .select()
      .from(taskTemplate)
      .where(eq(taskTemplate.id, templateId))
      .limit(1);

    if (!template) {
      throw new AppError("Template not found", 404);
    }

    // 3. Validar taskSteps
    if (!taskSteps || !Array.isArray(taskSteps) || taskSteps.length === 0) {
      throw new AppError("No task steps provided", 400);
    }

    // 4. Procesar taskSteps
    const taskFieldValues = [];

    for (const step of taskSteps) {
      // Verificar si el step existe
      const [existingStep] = await tx
        .select()
        .from(taskStep)
        .where(eq(taskStep.id, step.id))
        .limit(1);

      if (!existingStep) {
        throw new AppError(`Step with ID ${step.id} not found`, 404);
      }

      // Procesar fields del step
      if (step?.taskFields?.length > 0) {
      }

      //   // Procesar applicants del step
      if (step?.applicants?.length > 0) {
        for (const applicantData of step.applicants) {
          // Crear el applicant
          const [applicantRecord] = await tx
            .insert(applicant)
            .values({
              taskId: taskId,
              taskStepId: step.id,
              status: applicantData.status || "pending",
              statusDirector: applicantData.statusDirector || false,
              statusColaborador: applicantData.statusColaborador || false,
              statusRequest: applicantData.statusRequest || false,
            })
            .returning();

          if (!applicantRecord) {
            throw new AppError("Failed to create applicant", 500);
          }

          //       // Procesar fields del applicant
          if (applicantData?.taskFields?.length > 0) {
          }
        }
      }
    }

    return {
      success: true,
      message: `Task created successfully. ID: ${taskId}`,
      taskId,
      // taskFieldValues,
    };
  });
};
