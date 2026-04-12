import type { QuerySearch, QuerySearchAdvanced } from "@shared/types";
import Joi from "joi";

export const paginationSchema = Joi.object<QuerySearch>({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1),
  sortBy: Joi.string().valid("createdAt", "updatedAt").default("createdAt"),
  order: Joi.string().valid("asc", "desc").default("asc"),
  search: Joi.string().allow("").optional(),
});

export const advancedQuerySchema = Joi.object<QuerySearchAdvanced>({
  status: Joi.string().valid("pendiente", "aceptada", "finalizada", "rechazada").optional(),
  priority: Joi.string().valid("urgente", "media", "baja").optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  type: Joi.string().valid("sent", "receive"),
});

export const searchIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "El ID debe ser un número",
    "number.integer": "El ID debe ser un número entero",
    "number.positive": "El ID debe ser un número positivo",
    "any.required": "El ID del template es requerido",
  }),
});
