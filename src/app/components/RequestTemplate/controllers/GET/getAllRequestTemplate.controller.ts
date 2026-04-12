import { db } from "@core/database";
import {
  type RequestTemplate,
  type RequestTemplateField,
  requestTemplate,
  requestTemplateField,
} from "@schemas/index";
import { successResponse } from "@shared/utils";
import { inArray } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";

type ProcessedTemplate = RequestTemplate & {
  fields: Array<RequestTemplateField & { options: string[] | null }>;
};

export const getAllRequestTemplate = async (
  _: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const templates = await db.select().from(requestTemplate).orderBy(requestTemplate.title);

    if (!templates.length) {
      successResponse(res, {
        data: [],
        message: "RequestTemplate fetched successfully",
        status: 200,
      });
      return;
    }

    const templateIds = templates.map((t) => t.id);

    const fields = await db
      .select()
      .from(requestTemplateField)
      .where(inArray(requestTemplateField.templateId, templateIds))
      .orderBy(requestTemplateField.order);

    // Parsear opciones JSON
    const parseJsonOptions = (options: unknown): string[] | null => {
      if (!options) return null;

      try {
        const parsed = typeof options === "string" ? JSON.parse(options) : options;
        return Array.isArray(parsed) ? parsed.map(String) : null;
      } catch {
        return null;
      }
    };

    // Mapear fields procesados por templateId
    const fieldsMap = fields.reduce((map, field) => {
      const processedField = {
        ...field,
        options: parseJsonOptions(field.options),
      };

      const current = map.get(field.templateId) || [];
      map.set(field.templateId, [...current, processedField]);
      return map;
    }, new Map<number, Array<RequestTemplateField & { options: string[] | null }>>());

    const response: ProcessedTemplate[] = templates.map((template) => ({
      ...template,
      fields: fieldsMap.get(template.id) || [],
    }));

    successResponse(res, {
      data: response,
      message: "RequestTemplate fetched successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching RequestTemplate:", error);
    next(error);
  }
};
