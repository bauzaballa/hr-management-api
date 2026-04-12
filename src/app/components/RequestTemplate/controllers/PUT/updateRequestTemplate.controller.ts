import { db } from "@core/database";
import {
  type NewRequestDepartment,
  type RequestTemplateField,
  requestDepartment,
  requestTemplate,
  requestTemplateField,
} from "@schemas/index";
import { AppError, formatJoiError, successResponse } from "@shared/utils";
import { searchIdSchema, updateRequestTemplateSchema } from "@shared/validations";
import { eq, inArray } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";

type FieldOptions = string[] | null;

export const updateRequestTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    /* ===========================
       Validaciones
    ============================ */
    const { error: idError, value: idValue } = searchIdSchema.validate(req.params, {
      abortEarly: false,
    });
    if (idError) {
      throw new AppError("ID inválido", 400, formatJoiError(idError));
    }

    const { error: bodyError, value } = updateRequestTemplateSchema.validate(req.body, {
      abortEarly: false,
    });

    if (bodyError) {
      throw new AppError("Datos inválidos", 400, formatJoiError(bodyError));
    }

    const { id } = idValue;
    const { title, description, unit, status, departmentIds, fields } = value;

    /* ===========================
       Verificar template
    ============================ */
    const [templateExists] = await db
      .select()
      .from(requestTemplate)
      .where(eq(requestTemplate.id, id))
      .limit(1);

    if (!templateExists) {
      throw new AppError(`Template ${id} no encontrado`, 404);
    }

    /* ===========================
       Utilidades locales
    ============================ */
    const mapFieldType = (type: string): RequestTemplateField["type"] => {
      const map: Record<string, RequestTemplateField["type"]> = {
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
      return map[type] ?? (type as RequestTemplateField["type"]);
    };

    const parseOptions = (options: unknown): FieldOptions => {
      if (!options) return null;
      if (Array.isArray(options)) return options.map(String);
      if (typeof options === "string") {
        try {
          const parsed = JSON.parse(options);
          return Array.isArray(parsed) ? parsed.map(String) : null;
        } catch {
          return null;
        }
      }
      return null;
    };

    const requiresOptions = (type: RequestTemplateField["type"]) =>
      ["multiple", "select", "checkbox", "radio"].includes(type);

    /* ===========================
       Transacción
    ============================ */
    const result = await db.transaction(async (tx) => {
      /* ---------- Template ---------- */
      const [updatedTemplate] = await tx
        .update(requestTemplate)
        .set({
          title: title?.trim(),
          description: description?.trim() ?? null,
          unit: unit ?? null,
          status,
          updatedAt: new Date(),
        })
        .where(eq(requestTemplate.id, id))
        .returning();

      if (!updatedTemplate) {
        throw new AppError("Error al actualizar template", 500);
      }

      /* ---------- Departamentos ---------- */
      if (departmentIds !== undefined) {
        await tx.delete(requestDepartment).where(eq(requestDepartment.templateId, id));

        if (departmentIds.length) {
          const rows: NewRequestDepartment[] = departmentIds.map((departmentId: string) => ({
            templateId: id,
            departmentId,
          }));
          await tx.insert(requestDepartment).values(rows);
        }
      }

      /* ---------- Campos ---------- */
      if (Array.isArray(fields)) {
        const existing = await tx
          .select({ id: requestTemplateField.id })
          .from(requestTemplateField)
          .where(eq(requestTemplateField.templateId, id));

        const toDelete = new Set(existing.map((f) => f.id));

        for (const [index, field] of fields.entries()) {
          if (field._deleted) continue;

          const type = mapFieldType(field.type);
          const options = parseOptions(field.options);

          if (requiresOptions(type) && (!options || !options.length)) {
            throw new AppError(`El campo "${field.label}" requiere opciones`, 400);
          }

          const baseData = {
            label: field.label.trim(),
            type,
            required: !!field.required,
            order: field.order ?? index + 1,
            options,
            placeholder: field.placeholder?.trim() ?? null,
            updatedAt: new Date(),
          };

          if (field.id) {
            toDelete.delete(field.id);
            await tx
              .update(requestTemplateField)
              .set(baseData)
              .where(eq(requestTemplateField.id, field.id));
          } else {
            await tx.insert(requestTemplateField).values({
              ...baseData,
              templateId: id,
            });
          }
        }

        if (toDelete.size) {
          await tx
            .delete(requestTemplateField)
            .where(inArray(requestTemplateField.id, Array.from(toDelete)));
        }
      }

      /* ---------- Respuesta ---------- */
      const departments = await tx
        .select()
        .from(requestDepartment)
        .where(eq(requestDepartment.templateId, id));

      const templateFields = await tx
        .select()
        .from(requestTemplateField)
        .where(eq(requestTemplateField.templateId, id))
        .orderBy(requestTemplateField.order);

      return {
        ...updatedTemplate,
        departments: departments.map((d) => d.departmentId),
        fields: templateFields.map((f) => ({
          ...f,
          required: !!f.required,
          options: parseOptions(f.options),
        })),
      };
    });

    successResponse(res, {
      data: result,
      message: "Template actualizado exitosamente",
      status: 200,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
