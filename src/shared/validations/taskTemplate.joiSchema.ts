import Joi from "joi";

export const fieldTaskSchema = Joi.object({
  label: Joi.string().max(255).optional().allow(null, ""),
  directionMapOption: Joi.string().valid("row", "columns", "grid").default("row"),
  type: Joi.string()
    .valid(
      "texto",
      "opcion-multiple",
      "checkbox",
      "dropdown",
      "grupo-texto-corto",
      "imagen",
      "fecha",
      "url",
      "nota",
      "archivo",
      "none",
      "textarea",
      "numero"
    )
    .required(),
  required: Joi.boolean().default(false),

  options: Joi.alternatives()
    .try(Joi.array().items(Joi.string()), Joi.valid(null))
    .optional()
    .default(null),

  order: Joi.number().integer().min(0).default(0),
  placeHolder: Joi.string().max(500).optional().allow(null, ""),
  isMultiple: Joi.boolean().default(false),
  limitFile: Joi.number().integer().min(1).optional().allow(null, ""),
  showRequest: Joi.boolean().default(true),
  text: Joi.string().optional().allow(null, ""),
  applicantId: Joi.number().integer().optional().allow(null, ""),
  taskStepId: Joi.number().integer().optional().allow(null, ""),
  // Agregar el campo fields para permitir campos anidados
  fields: Joi.array().items(Joi.link("#fieldTaskSchema")).optional().default([]),
}).id("fieldTaskSchema");

export const stepTaskSchema = Joi.object({
  title: Joi.string().max(100).required(),
  subTitle: Joi.string().max(100).required(),
  stepStatus: Joi.boolean().valid(false, true).default(false),
  order: Joi.number().integer().min(0).required(),
  typeStep: Joi.string().valid("director", "colaborador").default("director"),
  taskTemplateId: Joi.number().integer().optional(),
  fields: Joi.array().items(fieldTaskSchema).default([]), // Cambiado a default([])
  applicant: Joi.array().items(fieldTaskSchema).default([]), // Agregado para manejar applicants
}).custom((value, helpers) => {
  // Validación personalizada: al menos taskFields o applicant debe tener elementos
  if (
    (!value.fields || value.fields.length === 0) &&
    (!value.applicant || value.applicant.length === 0)
  ) {
    return helpers.error("any.invalid", {
      message: "Debe proporcionar al menos fields o applicant",
    });
  }
  return value;
});

export const templateTaskSchema = Joi.object({
  title: Joi.string().max(100).required(),
  subarea: Joi.string().max(100),
  taskSteps: Joi.array().items(stepTaskSchema).min(1).required(),
});
