import Joi from "joi";

export const requestTemplateSchema = Joi.object({
  title: Joi.string().min(1).max(255).required().messages({
    "string.empty": "El título es requerido",
    "string.min": "El título debe tener al menos 1 carácter",
    "string.max": "El título no puede exceder los 255 caracteres",
  }),

  description: Joi.string().allow(null, "").max(2000).optional().messages({
    "string.max": "La descripción no puede exceder los 2000 caracteres",
  }),

  unit: Joi.number().integer().min(0).optional().messages({
    "number.base": "El unit debe ser un número",
    "number.integer": "El unit debe ser un número entero",
    "number.min": "El unit no puede ser negativo",
  }),

  departmentIds: Joi.array().items(Joi.number().integer().positive()).optional().messages({
    "array.base": "departmentIds debe ser un array",
    "number.base": "Cada departmentId debe ser un número",
    "number.integer": "Cada departmentId debe ser un número entero",
    "number.positive": "Cada departmentId debe ser un número positivo",
  }),

  fields: Joi.array()
    .items(
      Joi.object({
        label: Joi.string().min(1).max(255).required().messages({
          "string.empty": "El label del campo es requerido",
          "string.min": "El label debe tener al menos 1 carácter",
          "string.max": "El label no puede exceder los 255 caracteres",
        }),

        type: Joi.string()
          .valid(
            "texto",
            "textarea",
            "number",
            "email",
            "date",
            "dropdown",
            "checkbox",
            "radio",
            "file",
            "opcion-multiple"
          )
          .required()
          .messages({
            "any.only": "Tipo de campo inválido",
            "string.empty": "El tipo de campo es requerido",
          }),

        required: Joi.boolean().default(false).optional(),

        options: Joi.array()
          .items(Joi.string().min(1))
          .optional()
          .allow(null)
          .custom((value, helpers) => {
            const { type } = helpers.state.ancestors[0];
            const requiresOptions = ["dropdown", "checkbox", "radio", "opcion-multiple"].includes(
              type
            );

            if (requiresOptions && (!value || value.length === 0)) {
              return helpers.error("array.required", { type });
            }

            return value;
          })
          .messages({
            "array.base": "Las opciones deben ser un array",
            "array.required": "Los campos de tipo {#type} requieren opciones",
          }),

        placeholder: Joi.string().allow(null, "").max(500).optional().messages({
          "string.max": "El placeholder no puede exceder los 500 caracteres",
        }),

        validation: Joi.object({
          min: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
          max: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
          minLength: Joi.number().integer().positive().optional(),
          maxLength: Joi.number().integer().positive().optional(),
          pattern: Joi.string().optional(),
          customMessage: Joi.string().optional(),
        })
          .optional()
          .allow(null),

        order: Joi.number().integer().min(0).optional().messages({
          "number.base": "El orden debe ser un número",
          "number.integer": "El orden debe ser un número entero",
          "number.min": "El orden no puede ser negativo",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Los campos deben ser un array",
      "array.min": "Debe incluir al menos un campo en el formulario",
      "array.includesRequiredUnknowns": "Cada campo debe tener la estructura correcta",
    }),
});

// Schema para actualización (todos los campos opcionales)
export const updateRequestTemplateSchema = Joi.object({
  title: Joi.string().min(1).max(255).optional().messages({
    "string.empty": "El título no puede estar vacío",
    "string.min": "El título debe tener al menos 1 carácter",
    "string.max": "El título no puede exceder los 255 caracteres",
  }),

  description: Joi.string().allow(null, "").max(2000).optional(),

  unit: Joi.string().allow(null, "").max(255).optional(),

  status: Joi.string().valid("active", "inactive").optional().messages({
    "any.only": 'El estado debe ser "active" o "inactive"',
  }),

  departmentIds: Joi.array().items(Joi.number().integer().positive()).optional(),

  fields: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().positive().optional().messages({
          "number.base": "El ID del campo debe ser un número",
          "number.integer": "El ID del campo debe ser un número entero",
          "number.positive": "El ID del campo debe ser positivo",
        }),

        label: Joi.string().min(1).max(255).optional(),

        type: Joi.string()
          .valid(
            "texto",
            "textarea",
            "number",
            "email",
            "date",
            "dropdown",
            "checkbox",
            "radio",
            "file",
            "opcion-multiple"
          )
          .optional(),

        required: Joi.boolean().optional(),

        options: Joi.array()
          .items(Joi.string().min(1))
          .optional()
          .allow(null)
          .custom((value, helpers) => {
            const { type } = helpers.state.ancestors[0];
            const requiresOptions = ["dropdown", "checkbox", "radio", "opcion-multiple"].includes(
              type
            );

            if (requiresOptions && (!value || value.length === 0)) {
              return helpers.error("array.required", { type });
            }

            return value;
          })
          .messages({
            "array.base": "Las opciones deben ser un array",
            "array.required": "Los campos de tipo {#type} requieren opciones",
          }),

        placeholder: Joi.string().allow(null, "").max(500).optional(),

        validation: Joi.object({
          min: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
          max: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
          minLength: Joi.number().integer().positive().optional(),
          maxLength: Joi.number().integer().positive().optional(),
          pattern: Joi.string().optional(),
          customMessage: Joi.string().optional(),
        })
          .optional()
          .allow(null),

        order: Joi.number().integer().min(0).optional(),

        _deleted: Joi.boolean().optional().default(false),
      })
    )
    .optional(),
})
  .min(1) // Al menos un campo para actualizar
  .messages({
    "object.min": "Debe proporcionar al menos un campo para actualizar",
  });
