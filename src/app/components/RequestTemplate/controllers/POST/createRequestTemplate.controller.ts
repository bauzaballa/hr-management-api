import { db } from "@core/database";
import { requestDepartment, requestTemplate, requestTemplateField } from "@schemas/index";
import { AppError, formatJoiError, successResponse } from "@shared/utils";
import { requestTemplateSchema } from "@shared/validations";
import { eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";

export const createRequestTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validar los datos de entrada
    const { error: validationError, value } = requestTemplateSchema.validate(req.body);
    if (validationError) {
      const formatted = formatJoiError(validationError);
      throw new AppError("Error de validación", 400, formatted);
    }

    const { title, description, unit, departmentIds, fields } = value;

    if (!title) {
      throw new AppError("El título es requerido", 400);
    }

    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      throw new AppError("Debe incluir al menos un campo en el formulario", 400);
    }

    // Crear el template en una transacción
    const result = await db.transaction(async (tx) => {
      const [newTemplate] = await tx
        .insert(requestTemplate)
        .values({
          title: title.trim(),
          description: description ? description.trim() : null,
          unit: unit ? unit : null,
          departmentIds: departmentIds ? JSON.stringify(departmentIds) : null,
          status: "active",
        })
        .returning();

      if (!newTemplate) {
        throw new AppError("Error al crear el template", 500);
      }

      // 2. Asociar departamentos si se proporcionan
      if (departmentIds && Array.isArray(departmentIds) && departmentIds.length > 0) {
        const templateDepartmentsData = departmentIds.map((departmentId) => ({
          templateId: newTemplate.id,
          departmentId,
        }));

        await tx.insert(requestDepartment).values(templateDepartmentsData);
      }

      // 3. Crear los campos del formulario
      if (fields && Array.isArray(fields)) {
        const templateFieldsData = fields.map((field, index) => {
          if (!field.label || !field.type) {
            throw new AppError(`El campo en posición ${index + 1} debe tener label y type`, 400);
          }
          const fieldTypeMap: Record<string, string> = {
            texto: "text",
            "opcion-multiple": "multiple",
            dropdown: "select",
            checkbox: "checkbox",
            textarea: "textarea",
            number: "number",
            email: "email",
            date: "date",
            radio: "radio",
            file: "file",
          };

          const mappedType = fieldTypeMap[field.type] || field.type;

          if (["multiple", "select", "checkbox", "radio"].includes(mappedType)) {
            if (!field.options || !Array.isArray(field.options) || field.options.length === 0) {
              throw new AppError(
                `El campo "${field.label}" de tipo "${field.type}" requiere opciones válidas`,
                400
              );
            }
          }

          // Preparar los datos del campo
          const fieldData = {
            templateId: newTemplate.id,
            label: field.label.trim(),
            type: mappedType,
            required: field.required || false,
            order: index + 1,
            options: field.options ? field.options : null,
            placeholder: field.placeholder ? field.placeholder.trim() : null,
          };

          if (field.options) {
            if (Array.isArray(field.options)) {
              fieldData.options = field.options;
            } else if (typeof field.options === "string") {
              try {
                fieldData.options = JSON.parse(field.options);
              } catch {
                fieldData.options = [field.options];
              }
            }
          }

          return fieldData;
        });

        await tx.insert(requestTemplateField).values(templateFieldsData);
      }

      // 4. Obtener el template creado con relaciones
      const [createdTemplate] = await tx
        .select()
        .from(requestTemplate)
        .where(eq(requestTemplate.id, newTemplate.id))
        .limit(1);

      // Obtener departamentos asociados
      const templateDepartments = await tx
        .select()
        .from(requestDepartment)
        .where(eq(requestDepartment.templateId, newTemplate.id));

      // Obtener campos del formulario
      const templateFields = await tx
        .select()
        .from(requestTemplateField)
        .where(eq(requestTemplateField.templateId, newTemplate.id))
        .orderBy(requestTemplateField.order);

      return {
        ...createdTemplate,
        departments: templateDepartments.map((td) => td.departmentId),
        fields: templateFields.map((field) => ({
          id: field.id,
          label: field.label,
          type: field.type,
          required: field.required,
          options: field.options || null,
          placeholder: field.placeholder,
          order: field.order,
          createdAt: field.createdAt,
          updatedAt: field.updatedAt,
        })),
      };
    });

    successResponse(res, {
      data: result,
      message: "Request Template creado exitosamente",
      status: 201,
    });
  } catch (error) {
    next(error);
  }
};
