import { applicant } from "@schemas/applicant";
import { type TaskField, taskField } from "@schemas/taskField.schema";
import { AppError } from "@shared/utils";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export class TaskTemplateService {
  // ========== FUNCIONES DE PROCESAMIENTO DE FIELDS ==========

  async processFields(
    fields: any[],
    taskStepId: number | null = null,
    applicantId: string | null = null
  ) {
    try {
      const fieldsToCreate: any[] = [];

      for (const field of fields) {
        // Validar campo mínimo
        if (!field || typeof field !== "object") {
          throw new Error(`Campo no es un objeto válido`);
        }

        if (!field.type) {
          throw new Error(`Campo falta type`);
        }

        const fieldData: any = {
          label: field.label || null,
          showRequest: field.showRequest || false,
          required: field.required || false,
          options: field.options ? JSON.stringify(field.options) : null,
          isMultiple: field.isMultiple || false,
          limitFile: field.limitFile || null,
          order: field.order || 0,
          text: field.text || null,
          placeHolder: field.placeHolder || null,
          type: field.type,
          directionMapOption: field.directionMapOption || null,
          taskStepId: applicantId ? null : taskStepId,
          applicantId: applicantId || null,
        };

        // Validar directionMapOption
        if (
          field.directionMapOption &&
          !["row", "column", "grid"].includes(field.directionMapOption)
        ) {
          fieldData.directionMapOption = "row";
        }

        // Procesar campos anidados
        if (field.fields && Array.isArray(field.fields)) {
          fieldData.fields = JSON.stringify(field.fields);
        }

        fieldsToCreate.push(fieldData);
      }

      return fieldsToCreate;
    } catch (error: any) {
      throw new AppError("Error processing fields", 400, error.message);
    }
  }

  async processFieldsForUpdate(
    tx: any,
    parentId: number,
    fields: any[],
    isApplicant: boolean = false
  ) {
    try {
      if (!parentId) {
        throw new Error("parentId es requerido");
      }

      if (!Array.isArray(fields)) {
        throw new Error("fields debe ser un array");
      }

      const whereCondition = isApplicant
        ? eq(taskField.applicantId, String(parentId))
        : and(eq(taskField.taskStepId, parentId), isNull(taskField.applicantId));

      const existingFields = await tx
        .select()
        .from(taskField)
        .where(whereCondition)
        .orderBy(taskField.order);

      const existingFieldsMap = new Map(existingFields.map((field: any) => [field.id, field]));
      const fieldsToKeep: number[] = [];

      for (const [index, field] of fields.entries()) {
        if (!field || typeof field !== "object") {
          throw new Error(`Campo en posición ${index} no es un objeto válido`);
        }

        if (!field.label || !field.type) {
          throw new Error(`Campo en posición ${index} falta label o type`);
        }

        const fieldData: any = {
          label: field.label,
          type: field.type,
          required: Boolean(field.required),
          options: field.options ? JSON.stringify(field.options) : null,
          text: field.text || null,
          placeHolder: field.placeHolder || null,
          order: field.order !== undefined ? field.order : index,
          directionMapOption: field.directionMapOption || null,
          isMultiple: Boolean(field.isMultiple),
          showRequest: Boolean(field.showRequest),
          limitFile: field.limitFile || null,
          updatedAt: new Date(),
        };

        if (field.fields && Array.isArray(field.fields)) {
          fieldData.fields = JSON.stringify(field.fields);
        }

        if (isApplicant) {
          fieldData.applicantId = String(parentId);
          fieldData.taskStepId = null;
        } else {
          fieldData.taskStepId = parentId;
          fieldData.applicantId = null;
        }

        if (field.id && existingFieldsMap.has(field.id)) {
          await tx.update(taskField).set(fieldData).where(eq(taskField.id, field.id));
          fieldsToKeep.push(field.id);
          existingFieldsMap.delete(field.id);
        } else {
          const [newField] = await tx.insert(taskField).values(fieldData).returning();
          fieldsToKeep.push(newField.id);
        }
      }

      // Eliminar campos que ya no existen
      const fieldsToDelete = Array.from(existingFieldsMap.keys());
      if (fieldsToDelete.length > 0) {
        // Opción 1: Usar inArray con números
        const numericFieldsToDelete = fieldsToDelete.map((id) => Number(id));
        await tx.delete(taskField).where(inArray(taskField.id, numericFieldsToDelete));

        // Opción alternativa: Usar SQL raw si inArray falla
        // await tx.execute(sql`
        //   DELETE FROM task_field
        //   WHERE id = ANY(${fieldsToDelete})
        // `);
      }

      return { success: true, fieldsProcessed: fieldsToKeep.length };
    } catch (error: any) {
      console.error("Error en processFieldsForUpdate:", error);
      throw new AppError("Error processing fields for update", 400, error.message);
    }
  }

  async processApplicantsForUpdate(tx: any, taskStepId: number, applicantsData: any[]) {
    try {
      const existingApplicants = await tx
        .select()
        .from(applicant)
        .where(eq(applicant.taskStepId, taskStepId));

      const existingApplicantsMap = new Map(existingApplicants.map((app: any) => [app.id, app]));
      const applicantsToKeep: string[] = [];

      for (const [index, appData] of applicantsData.entries()) {
        let currentApplicantId: string;

        // Verificar el formato de los datos
        const applicantFields = appData.taskFields || (Array.isArray(appData) ? appData : []);

        const applicantUpdateData = {
          status: appData.status || "pending",
          updatedAt: new Date(),
          taskStepId,
        };

        if (appData.id && existingApplicantsMap.has(appData.id)) {
          await tx.update(applicant).set(applicantUpdateData).where(eq(applicant.id, appData.id));
          currentApplicantId = appData.id;
          applicantsToKeep.push(appData.id);
          existingApplicantsMap.delete(appData.id);
        } else {
          const uuidId = uuidv4();
          const [newApplicant] = await tx
            .insert(applicant)
            .values({
              id: uuidId,
              ...applicantUpdateData,
              statusDirector: false,
              statusColaborador: false,
              statusRequest: false,
            })
            .returning();
          currentApplicantId = newApplicant.id;
          applicantsToKeep.push(newApplicant.id);
        }

        // Procesar fields del applicant
        if (applicantFields.length > 0) {
          // Convertir applicantId a número para processFieldsForUpdate
          const applicantIdNum = parseInt(currentApplicantId, 10);
          if (!isNaN(applicantIdNum)) {
            await this.processFieldsForUpdate(tx, applicantIdNum, applicantFields, true);
          } else {
            console.warn(`Invalid applicant ID: ${currentApplicantId}`);
          }
        }
      }

      // Eliminar applicants que ya no existen
      const remainingApplicantIds = Array.from(existingApplicantsMap.keys()) as readonly string[];
      if (remainingApplicantIds.length > 0) {
        // applicant.id es UUID (string)
        await tx.delete(applicant).where(inArray(applicant.id, remainingApplicantIds));
      }

      return { success: true, applicantsProcessed: applicantsToKeep.length };
    } catch (error: any) {
      console.error("Error in processApplicantsForUpdate:", error);
      throw new AppError("Error processing applicants", 400, error.message);
    }
  }

  parseFields(fields: TaskField[]) {
    return fields.map((field) => {
      const parsedField = { ...field };

      // Parsear options si es string
      if (parsedField.options && typeof parsedField.options === "string") {
        try {
          parsedField.options = JSON.parse(parsedField.options);
        } catch (error) {
          console.warn(`Error parsing options for field ${field.id}:`, error);
          parsedField.options = null;
        }
      }

      return parsedField;
    });
  }
}

export const taskTemplateService = new TaskTemplateService();
