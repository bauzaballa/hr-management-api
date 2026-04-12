export const taskTemplateSwagger = {
  paths: {
    // GET /template/all
    "/template/all": {
      get: {
        summary: "Get all templates",
        description: "Traer todos los templates",
        tags: ["Templates"],
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "List of templates retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Template" },
                    },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          "404": {
            description: "No templates found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    // GET /template/{id}
    "/template/{id}": {
      get: {
        summary: "Get template by ID",
        description: "Traer template por id, con sus steps y sus fields",
        tags: ["Templates"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID of the template",
            schema: {
              type: "number",
              example: 1,
            },
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
                    data: { $ref: "#/components/schemas/TemplateDetail" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid template ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Template not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      put: {
        summary: "Actualizar template",
        description: "Update an existing template with its steps and fields",
        tags: ["Templates"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID of the template to update",
            schema: {
              type: "number",
              example: 1,
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "availableDepartments", "steps"],
                properties: {
                  title: {
                    type: "string",
                    example: "Template de Campaña Email Actualizado",
                  },
                  availableDepartments: {
                    type: "array",
                    items: { type: "string" },
                    example: ["Marketing", "Ventas", "Diseño"],
                  },
                  steps: {
                    type: "array",
                    minItems: 1,
                    items: {
                      type: "object",
                      required: ["title", "stepStatus", "order"],
                      properties: {
                        id: {
                          type: "number",
                          example: 1,
                          nullable: true,
                        },
                        title: {
                          type: "string",
                          example: "Información Básica Actualizada",
                        },
                        subTitle: {
                          type: "string",
                          example: "Complete los datos principales actualizados",
                          nullable: true,
                        },
                        stepStatus: {
                          type: "string",
                          example: "completed",
                        },
                        order: {
                          type: "number",
                          example: 1,
                        },
                        fields: {
                          type: "array",
                          items: {
                            type: "object",
                            required: ["label", "type", "required", "order"],
                            properties: {
                              id: {
                                type: "number",
                                example: 1,
                                nullable: true,
                              },
                              label: {
                                type: "string",
                                example: "Título de la campaña actualizado",
                              },
                              directionMapOption: {
                                type: "string",
                                example: "updated_campaign_title",
                                nullable: true,
                              },
                              type: {
                                type: "string",
                                enum: ["text", "textarea", "select", "number", "date", "email"],
                                example: "textarea",
                              },
                              required: {
                                type: "boolean",
                                example: true,
                              },
                              options: {
                                type: "array",
                                items: { type: "string" },
                                example: ["Opción 1", "Opción 2", "Opción 3"],
                                nullable: true,
                              },
                              order: {
                                type: "number",
                                example: 1,
                              },
                              placeHolder: {
                                type: "string",
                                example: "Ingrese el título actualizado...",
                                nullable: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
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
                    data: {
                      type: "object",
                      properties: {
                        templateId: { type: "number" },
                      },
                    },
                    message: { type: "string" },
                    status: { type: "number" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid template ID or validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Template not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    // POST /template
    "/template": {
      post: {
        summary: "Create a new template",
        description: "Crear template con steps y fields asociados",
        tags: ["Templates"],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "availableDepartments", "steps"],
                properties: {
                  title: {
                    type: "string",
                    example: "Template de Campaña Email",
                  },
                  availableDepartments: {
                    type: "array",
                    items: { type: "string" },
                    example: ["Marketing", "Ventas"],
                  },
                  steps: {
                    type: "array",
                    minItems: 1,
                    items: {
                      type: "object",
                      required: ["title", "stepStatus", "order"],
                      properties: {
                        title: {
                          type: "string",
                          example: "Información Básica",
                        },
                        subTitle: {
                          type: "string",
                          example: "Complete los datos principales",
                          nullable: true,
                        },
                        stepStatus: {
                          type: "string",
                          example: "pending",
                        },
                        order: {
                          type: "number",
                          example: 1,
                        },
                        fields: {
                          type: "array",
                          items: {
                            type: "object",
                            required: ["label", "type", "required", "order"],
                            properties: {
                              label: {
                                type: "string",
                                example: "Título de la campaña",
                              },
                              directionMapOption: {
                                type: "string",
                                example: "campaign_title",
                                nullable: true,
                              },
                              type: {
                                type: "string",
                                enum: ["text", "textarea", "select", "number", "date", "email"],
                                example: "text",
                              },
                              required: {
                                type: "boolean",
                                example: true,
                              },
                              options: {
                                type: "array",
                                items: { type: "string" },
                                example: ["Opción 1", "Opción 2"],
                                nullable: true,
                              },
                              order: {
                                type: "number",
                                example: 1,
                              },
                              placeHolder: {
                                type: "string",
                                example: "Ingrese el título...",
                                nullable: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
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
                    data: {
                      type: "object",
                      properties: {
                        templateId: { type: "number" },
                      },
                    },
                    message: { type: "string" },
                    status: { type: "number" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
  },

  components: {
    schemas: {
      Template: {
        type: "object",
        properties: {
          id: { type: "number" },
          title: { type: "string" },
          availableDepartments: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },

      TemplateDetail: {
        type: "object",
        properties: {
          id: { type: "number" },
          title: { type: "string" },
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "number" },
                title: { type: "string" },
                subTitle: { type: "string", nullable: true },
                stepStatus: { type: "string" },
                order: { type: "number" },
                fields: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      label: { type: "string" },
                      directionMapOption: { type: "string", nullable: true },
                      type: {
                        type: "string",
                        enum: ["text", "textarea", "select", "number", "date", "email"],
                      },
                      required: { type: "boolean" },
                      options: { type: "string", nullable: true },
                      order: { type: "number" },
                      placeHolder: { type: "string", nullable: true },
                    },
                  },
                },
              },
            },
          },
        },
      },

      TemplateStep: {
        type: "object",
        required: ["title", "stepStatus", "order"],
        properties: {
          id: { type: "number", nullable: true },
          title: { type: "string" },
          subTitle: { type: "string", nullable: true },
          stepStatus: { type: "string" },
          order: { type: "number" },
          fields: {
            type: "array",
            items: { $ref: "#/components/schemas/TemplateField" },
          },
        },
      },

      TemplateField: {
        type: "object",
        required: ["label", "type", "required", "order"],
        properties: {
          id: { type: "number", nullable: true },
          label: { type: "string" },
          directionMapOption: { type: "string", nullable: true },
          type: {
            type: "string",
            enum: ["text", "textarea", "select", "number", "date", "email"],
          },
          required: { type: "boolean" },
          options: {
            type: "array",
            items: { type: "string" },
            nullable: true,
          },
          order: { type: "number" },
          placeHolder: { type: "string", nullable: true },
        },
      },
    },
  },
};
