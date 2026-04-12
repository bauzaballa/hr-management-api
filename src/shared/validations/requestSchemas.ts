// request.validation.ts
import Joi from "joi";

export const createRequestSchema = Joi.object({
  title: Joi.string().max(255).required().messages({
    "string.base": "El título debe ser un texto",
    "string.empty": "El título es obligatorio",
    "string.max": "El título no puede exceder los 255 caracteres",
    "any.required": "El título es obligatorio",
  }),

  content: Joi.string().allow("").optional().messages({
    "string.base": "El contenido debe ser un texto",
  }),

  departmentId: Joi.number().integer().positive().required().messages({
    "number.base": "El ID de departamento debe ser un número",
    "number.integer": "El ID de departamento debe ser un número entero",
    "number.positive": "El ID de departamento debe ser un número positivo",
    "any.required": "El ID de departamento es obligatorio",
  }),

  requestTemplateId: Joi.number().integer().positive().required().messages({
    "number.base": "El ID de plantilla debe ser un número",
    "number.integer": "El ID de plantilla debe ser un número entero",
    "number.positive": "El ID de plantilla debe ser un número positivo",
    "any.required": "El ID de plantilla es obligatorio",
  }),

  formResponse: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().positive().required().messages({
          "number.base": "El ID del campo del formulario debe ser un número",
          "number.integer": "El ID del campo del formulario debe ser un número entero",
          "number.positive": "El ID del campo del formulario debe ser un número positivo",
          "any.required": "El ID del campo del formulario es obligatorio",
        }),

        label: Joi.string().required().messages({
          "string.base": "La etiqueta debe ser un texto",
          "string.empty": "La etiqueta es obligatoria",
          "any.required": "La etiqueta es obligatoria",
        }),

        type: Joi.string()
          .valid("texto", "numero", "fecha", "booleano", "seleccion", "archivo")
          .required()
          .messages({
            "string.base": "El tipo debe ser un texto",
            "any.only":
              "El tipo debe ser uno de los siguientes valores: texto, numero, fecha, booleano, seleccion, archivo",
            "any.required": "El tipo es obligatorio",
          }),

        value: Joi.alternatives()
          .try(
            Joi.string().allow("").optional(),
            Joi.number().optional(),
            Joi.date().iso().optional(),
            Joi.boolean().optional()
          )
          .messages({
            "string.uri": "Para archivos debe proporcionar una URL válida",
            "date.format": "La fecha debe estar en formato ISO (YYYY-MM-DD)",
          }),
      })
    )
    .min(1)
    .optional()
    .messages({
      "array.base": "Las respuestas del formulario deben ser un array",
      "array.min": "Debe haber al menos una respuesta en el formulario",
      "array.includesRequiredUnknowns":
        "Las respuestas del formulario deben tener la estructura correcta",
    }),

  priority: Joi.string().valid("urgente", "media", "baja").default("media").messages({
    "string.base": "La prioridad debe ser un texto",
    "any.only": "La prioridad debe ser una de: urgente, media, baja",
  }),

  unitId: Joi.number().integer().positive().optional().messages({
    "number.base": "El ID de unidad debe ser un número",
    "number.integer": "El ID de unidad debe ser un número entero",
    "number.positive": "El ID de unidad debe ser un número positivo",
  }),

  userId: Joi.string().uuid({ version: "uuidv4" }).required().messages({
    "string.base": "El ID de usuario debe ser un texto",
    "string.guid": "El ID de usuario debe ser un UUID válido",
    "any.required": "El ID de usuario es obligatorio",
  }),

  // Campos opcionales adicionales que podrías necesitar
  receiverUserId: Joi.string().uuid({ version: "uuidv4" }).optional().messages({
    "string.base": "El ID de usuario receptor debe ser un texto",
    "string.guid": "El ID de usuario receptor debe ser un UUID válido",
  }),

  requestedByDepartmentId: Joi.number().integer().positive().optional().messages({
    "number.base": "El ID de departamento solicitante debe ser un número",
    "number.integer": "El ID de departamento solicitante debe ser un número entero",
    "number.positive": "El ID de departamento solicitante debe ser un número positivo",
  }),

  metadata: Joi.object().optional().messages({
    "object.base": "Los metadatos deben ser un objeto",
  }),

  attachments: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        url: Joi.string().uri().required(),
        type: Joi.string().required(),
      })
    )
    .optional()
    .messages({
      "array.base": "Los archivos adjuntos deben ser un array",
      "array.includesRequiredUnknowns": "Los archivos adjuntos deben tener la estructura correcta",
    }),
}).messages({
  "object.unknown": "El campo {#label} no está permitido",
});

// Schema para actualización parcial
export const updateRequestSchema = Joi.object({
  title: Joi.string().max(255).optional().messages({
    "string.base": "El título debe ser un texto",
    "string.max": "El título no puede exceder los 255 caracteres",
  }),

  content: Joi.string().allow("").optional().messages({
    "string.base": "El contenido debe ser un texto",
  }),

  priority: Joi.string()
    .valid("urgente", "alto", "media", "medio", "baja", "bajo")
    .optional()
    .messages({
      "string.base": "La prioridad debe ser un texto",
      "any.only": "La prioridad debe ser una de: urgente, alto, media, medio, baja, bajo",
    }),

  status: Joi.string()
    .valid("pendiente", "aceptada", "finalizada", "rechazada")
    .optional()
    .messages({
      "string.base": "El estado debe ser un texto",
      "any.only": "El estado debe ser uno de: pendiente, aceptada, finalizada, rechazada",
    }),

  isCompleted: Joi.boolean().optional().messages({
    "boolean.base": "El estado de completado debe ser verdadero o falso",
  }),

  formResponse: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().positive().required(),
        label: Joi.string().required(),
        type: Joi.string()
          .valid("texto", "numero", "fecha", "booleano", "seleccion", "archivo")
          .required(),
        value: Joi.alternatives()
          .try(
            Joi.string().allow("").optional(),
            Joi.number().optional(),
            Joi.date().iso().optional(),
            Joi.boolean().optional()
          )
          .optional(),
      })
    )
    .optional(),

  timeline: Joi.array()
    .items(
      Joi.object({
        status: Joi.string().required(),
        timestamp: Joi.date().iso().required(),
        userId: Joi.string().uuid().required(),
        note: Joi.string().optional(),
      })
    )
    .optional()
    .messages({
      "array.base": "El timeline debe ser un array",
      "array.includesRequiredUnknowns": "El timeline debe tener la estructura correcta",
    }),
})
  .min(1) // Debe haber al menos un campo para actualizar
  .messages({
    "object.min": "Debe proporcionar al menos un campo para actualizar",
    "object.unknown": "El campo {#label} no está permitido",
  });

// Schema para cambiar estado
export const changeStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pendiente", "aceptada", "finalizada", "rechazada")
    .required()
    .messages({
      "string.base": "El estado debe ser un texto",
      "any.only": "El estado debe ser uno de: pendiente, aceptada, finalizada, rechazada",
      "any.required": "El estado es obligatorio",
    }),

  note: Joi.string().max(500).optional().messages({
    "string.base": "La nota debe ser un texto",
    "string.max": "La nota no puede exceder los 500 caracteres",
  }),

  userId: Joi.string().uuid({ version: "uuidv4" }).required().messages({
    "string.base": "El ID de usuario debe ser un texto",
    "string.guid": "El ID de usuario debe ser un UUID válido",
    "any.required": "El ID de usuario es obligatorio",
  }),
});

// Exportar todos los schemas
export const requestValidationSchemas = {
  createRequestSchema,
  updateRequestSchema,
  changeStatusSchema,
};
