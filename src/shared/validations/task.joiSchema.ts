// @shared/validations/index.ts
import Joi from "joi";
import { stepTaskSchema } from "./taskTemplate.joiSchema";

export const TaskSchema = Joi.object({
  title: Joi.string().max(255).required().messages({
    "string.empty": "El título es requerido",
    "string.max": "El título no debe exceder los 255 caracteres",
    "any.required": "El título es requerido",
  }),
  departmentId: Joi.number().integer().optional(),
  userIds: Joi.alternatives()
    .try(
      Joi.string(), // Para valores ya serializados como JSON string
      Joi.array().items(Joi.string().uuid()) // Para arrays de UUIDs
    )
    .optional(),
  priority: Joi.string().valid("urgente", "media", "baja").optional().default("media"),
  status: Joi.string()
    .valid("pendiente", "en-proceso", "completada", "vencida", "cancelada")
    .optional()
    .default("pendiente"),
  description: Joi.string().optional().allow("", null),
  firstName: Joi.string().optional(),
  userIdCreated: Joi.string().required().messages({
    "string.empty": "userIdCreated es requerido",
    "any.required": "userIdCreated es requerido",
  }),
  startDate: Joi.date().iso().optional(),
  dueDate: Joi.date().iso().min(Joi.ref("startDate")).optional().messages({
    "date.min": "La fecha de vencimiento debe ser posterior a la fecha de inicio",
  }),
  isDraft: Joi.boolean().default(false),
  subareaId: Joi.number().integer().optional(),
  position: Joi.string().optional().allow("", null),
  category: Joi.string().valid("Comercial", "No comercial").optional().default("No comercial"),
  unitId: Joi.number().integer().optional(),
  requestId: Joi.number().integer().optional(),
  templateId: Joi.number().integer().required().messages({
    "any.required": "templateId es requerido",
    "number.base": "templateId debe ser un número",
  }),
  taskTemplateName: Joi.string().optional(),
  taskSteps: Joi.array().items(stepTaskSchema).min(1).required().messages({
    "array.min": "Debe haber al menos un taskStep",
    "any.required": "taskSteps es requerido",
  }),
  firstNameUser: Joi.string().optional(),
}).options({
  stripUnknown: false, // Cambiado a false para debugging
  abortEarly: false, // Para ver todos los errores
});
