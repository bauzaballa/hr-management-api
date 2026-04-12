export const requestTemplateSwagger = {
  paths: {
    // GET /request-template/get-all
    "/request-template/get-all": {
      get: {
        summary: "Get all request templates",
        description: "Obtener todas las plantillas de solicitud con sus campos",
        tags: ["Request Templates"],
        security: [{ BearerAuth: [] }],
        responses: {
          "200": {
            description: "Templates retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "RequestTemplate fetched successfully" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/RequestTemplateWithFields" },
                    },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },

    // GET PUT DELETE /request-template/{id}
    "/request-template/{id}": {
      get: {
        summary: "Get request template by ID",
        description:
          "Obtener una plantilla de solicitud específica con sus campos y departamentos asociados",
        tags: ["Request Templates"],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID de la plantilla",
            schema: {
              type: "number",
              minimum: 1,
            },
            example: 1,
          },
        ],
        responses: {
          "200": {
            description: "Template retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Plantilla obtenida correctamente" },
                    data: { $ref: "#/components/schemas/RequestTemplateDetail" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "404": { $ref: "#/components/responses/NotFound" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },

      put: {
        summary: "Update a request template",
        description:
          "Actualizar una plantilla de solicitud existente. Se pueden actualizar campos, departamentos y otros datos",
        tags: ["Request Templates"],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID de la plantilla a actualizar",
            schema: {
              type: "number",
              minimum: 1,
            },
            example: 1,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                minProperties: 1,
                properties: {
                  title: {
                    type: "string",
                    maxLength: 255,
                    example: "Formulario actualizado de materiales",
                  },
                  description: {
                    type: "string",
                    nullable: true,
                    example: "Formulario actualizado para solicitar materiales",
                  },
                  unit: {
                    type: "string",
                    nullable: true,
                    example: "Unidad de logística actualizada",
                  },
                  status: {
                    type: "string",
                    enum: ["active", "inactive"],
                    example: "active",
                  },
                  departmentIds: {
                    type: "array",
                    items: {
                      type: "string",
                      example: "dep-001",
                    },
                    description: "IDs de departamentos (se reemplazan todos los existentes)",
                  },
                  fields: {
                    type: "array",
                    description:
                      "Campos actualizados. Campos existentes requieren ID, nuevos campos no",
                    items: {
                      type: "object",
                      required: ["label", "type"],
                      properties: {
                        id: {
                          type: "number",
                          nullable: true,
                          description:
                            "ID del campo existente (requerido para actualizar, omitir para nuevo)",
                          example: 1,
                        },
                        label: {
                          type: "string",
                          example: "Material solicitado actualizado",
                        },
                        type: {
                          type: "string",
                          enum: [
                            "texto",
                            "opcion-multiple",
                            "dropdown",
                            "checkbox",
                            "textarea",
                            "number",
                            "email",
                            "date",
                            "radio",
                            "file",
                          ],
                          example: "texto",
                        },
                        required: {
                          type: "boolean",
                          default: false,
                          example: true,
                        },
                        placeholder: {
                          type: "string",
                          nullable: true,
                          example: "Ingrese el nombre del material",
                        },
                        options: {
                          oneOf: [
                            { type: "string" },
                            {
                              type: "array",
                              items: { type: "string" },
                            },
                          ],
                          nullable: true,
                          example: ["Opción 1", "Opción 2", "Opción 3"],
                        },
                        order: {
                          type: "number",
                          minimum: 1,
                          example: 1,
                        },
                        _deleted: {
                          type: "boolean",
                          description: "Marcar como true para eliminar un campo existente",
                          example: false,
                        },
                      },
                    },
                  },
                },
                example: {
                  title: "Solicitud de materiales actualizada",
                  description: "Formulario actualizado",
                  status: "active",
                  departmentIds: ["dep-001", "dep-003"],
                  fields: [
                    {
                      id: 1,
                      label: "Material solicitado",
                      type: "texto",
                      required: true,
                      order: 1,
                    },
                    {
                      label: "Unidad de medida",
                      type: "dropdown",
                      required: false,
                      options: ["Unidades", "Metros", "Litros"],
                      order: 2,
                    },
                  ],
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Template updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Template actualizado exitosamente" },
                    data: { $ref: "#/components/schemas/RequestTemplateDetail" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "404": { $ref: "#/components/responses/NotFound" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },

      delete: {
        summary: "Delete (deactivate) a request template",
        description:
          "Desactivar una plantilla de solicitud (soft delete - cambia estado a inactive)",
        tags: ["Request Templates"],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID de la plantilla a desactivar",
            schema: {
              type: "number",
              minimum: 1,
            },
            example: 1,
          },
        ],
        responses: {
          "200": {
            description: "Template deactivated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Template desactivado exitosamente" },
                    data: { $ref: "#/components/schemas/RequestTemplate" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "404": { $ref: "#/components/responses/NotFound" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },

    // POST /request-template
    "/request-template": {
      post: {
        summary: "Create a new request template",
        description: "Crear una nueva plantilla de solicitud con campos y departamentos asociados",
        tags: ["Request Templates"],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "fields"],
                properties: {
                  title: {
                    type: "string",
                    maxLength: 255,
                    example: "Formulario de solicitud de materiales",
                  },
                  description: {
                    type: "string",
                    nullable: true,
                    example: "Formulario para solicitar materiales de oficina",
                  },
                  unit: {
                    type: "string",
                    nullable: true,
                    example: "Unidad de logística",
                  },
                  status: {
                    type: "string",
                    enum: ["active", "inactive"],
                    default: "active",
                    example: "active",
                  },
                  departmentIds: {
                    type: "array",
                    items: {
                      type: "string",
                      example: "dep-001",
                    },
                    description: "IDs de departamentos que pueden usar esta plantilla",
                  },
                  fields: {
                    type: "array",
                    minItems: 1,
                    description: "Campos del formulario",
                    items: {
                      type: "object",
                      required: ["label", "type"],
                      properties: {
                        label: {
                          type: "string",
                          example: "Nombre del material",
                        },
                        type: {
                          type: "string",
                          enum: [
                            "texto",
                            "opcion-multiple",
                            "dropdown",
                            "checkbox",
                            "textarea",
                            "number",
                            "email",
                            "date",
                            "radio",
                            "file",
                          ],
                          example: "texto",
                        },
                        required: {
                          type: "boolean",
                          default: false,
                          example: true,
                        },
                        placeholder: {
                          type: "string",
                          nullable: true,
                          example: "Ingrese el nombre del material",
                        },
                        options: {
                          oneOf: [
                            { type: "string" },
                            {
                              type: "array",
                              items: { type: "string" },
                            },
                          ],
                          nullable: true,
                          description: "Opciones para campos de tipo select, checkbox, radio, etc.",
                          example: ["Opción 1", "Opción 2", "Opción 3"],
                        },
                        order: {
                          type: "number",
                          minimum: 1,
                          example: 1,
                        },
                      },
                    },
                  },
                },
                example: {
                  title: "Solicitud de materiales",
                  description: "Formulario para solicitar materiales de oficina",
                  unit: "Unidad de logística",
                  departmentIds: ["dep-001", "dep-002"],
                  fields: [
                    {
                      label: "Material solicitado",
                      type: "texto",
                      required: true,
                      placeholder: "Ej: Resmas de papel A4",
                      order: 1,
                    },
                    {
                      label: "Cantidad",
                      type: "number",
                      required: true,
                      order: 2,
                    },
                    {
                      label: "Prioridad",
                      type: "dropdown",
                      required: true,
                      options: ["Baja", "Media", "Alta"],
                      order: 3,
                    },
                  ],
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Template created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Request Template creado exitosamente" },
                    data: { $ref: "#/components/schemas/RequestTemplateDetail" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
  },

  components: {
    schemas: {
      RequestTemplate: {
        type: "object",
        properties: {
          id: {
            type: "number",
            example: 1,
          },
          title: {
            type: "string",
            example: "Formulario de solicitud de materiales",
          },
          description: {
            type: "string",
            nullable: true,
            example: "Formulario para solicitar materiales de oficina",
          },
          unit: {
            type: "string",
            nullable: true,
            example: "Unidad de logística",
          },
          status: {
            type: "string",
            enum: ["active", "inactive"],
            example: "active",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2024-01-15T10:30:00Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2024-01-15T10:30:00Z",
          },
        },
      },

      RequestTemplateField: {
        type: "object",
        properties: {
          id: {
            type: "number",
            example: 1,
          },
          templateId: {
            type: "number",
            example: 1,
          },
          label: {
            type: "string",
            example: "Material solicitado",
          },
          type: {
            type: "string",
            enum: [
              "text",
              "multiple",
              "select",
              "checkbox",
              "textarea",
              "number",
              "email",
              "date",
              "radio",
              "file",
            ],
            example: "text",
          },
          required: {
            type: "boolean",
            example: true,
          },
          placeholder: {
            type: "string",
            nullable: true,
            example: "Ingrese el nombre del material",
          },
          options: {
            type: "array",
            nullable: true,
            items: { type: "string" },
            example: ["Opción 1", "Opción 2", "Opción 3"],
          },
          order: {
            type: "number",
            example: 1,
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2024-01-15T10:30:00Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2024-01-15T10:30:00Z",
          },
        },
      },

      RequestTemplateWithFields: {
        type: "object",
        allOf: [
          { $ref: "#/components/schemas/RequestTemplate" },
          {
            type: "object",
            properties: {
              fields: {
                type: "array",
                items: { $ref: "#/components/schemas/RequestTemplateField" },
              },
            },
          },
        ],
      },

      RequestTemplateDetail: {
        type: "object",
        allOf: [
          { $ref: "#/components/schemas/RequestTemplate" },
          {
            type: "object",
            properties: {
              fields: {
                type: "array",
                items: { $ref: "#/components/schemas/RequestTemplateField" },
              },
              departmentIds: {
                type: "array",
                items: { type: "string" },
                example: ["dep-001", "dep-002"],
              },
            },
          },
        ],
      },
    },

    responses: {
      ValidationError: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean", example: false },
                message: { type: "string", example: "Error de validación" },
                errors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      field: { type: "string", example: "title" },
                      message: { type: "string", example: "El título es obligatorio" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      Unauthorized: {
        description: "Unauthorized access",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean", example: false },
                message: { type: "string", example: "No autorizado" },
              },
            },
          },
        },
      },
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean", example: false },
                message: { type: "string", example: "Template no encontrado" },
              },
            },
          },
        },
      },
      InternalError: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean", example: false },
                message: { type: "string", example: "Error interno del servidor" },
              },
            },
          },
        },
      },
    },

    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Introduce el token JWT en el formato: Bearer {token}",
      },
    },
  },
};
