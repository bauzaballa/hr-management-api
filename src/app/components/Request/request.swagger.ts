export const requestSwagger = {
  paths: {
    // POST /request/create
    "/request/create": {
      post: {
        summary: "Create a new request",
        description: "Crear una nueva solicitud con notificaciones a directores",
        tags: ["Requests"],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "departmentId", "userId"],
                properties: {
                  title: {
                    type: "string",
                    maxLength: 255,
                    example: "Nueva campaña de marketing",
                  },
                  content: {
                    type: "string",
                    nullable: true,
                    example: "Descripción detallada de la solicitud",
                  },
                  departmentId: {
                    type: "number",
                    example: 3,
                  },
                  requestedByDepartmentId: {
                    type: "number",
                    nullable: true,
                    example: 3,
                  },
                  unitId: {
                    type: "number",
                    nullable: true,
                    example: 1,
                  },
                  userId: {
                    type: "string",
                    format: "uuid",
                    example: "18e442d3-714e-4dd7-9235-25e29d5ca315",
                  },
                  receiverUserId: {
                    type: "string",
                    format: "uuid",
                    nullable: true,
                    example: "28e442d3-714e-4dd7-9235-25e29d5ca315",
                  },
                  requestTemplateId: {
                    type: "number",
                    nullable: true,
                    example: 1,
                  },
                  priority: {
                    type: "string",
                    enum: ["urgente", "alto", "media", "medio", "baja", "bajo"],
                    default: "media",
                    example: "medio",
                  },
                  formResponse: {
                    type: "array",
                    nullable: true,
                    items: {
                      type: "object",
                      required: ["id", "label", "type"],
                      properties: {
                        id: { type: "number", example: 1 },
                        label: { type: "string", example: "Etiqueta del campo" },
                        type: {
                          type: "string",
                          enum: ["texto", "numero", "fecha", "booleano", "seleccion", "archivo"],
                          example: "texto",
                        },
                        value: {
                          oneOf: [
                            { type: "string" },
                            { type: "number" },
                            { type: "boolean" },
                            { type: "null" },
                          ],
                          nullable: true,
                          example: "Valor del campo",
                        },
                      },
                    },
                  },
                  // Campos para notificaciones
                  fullName: {
                    type: "string",
                    nullable: true,
                    example: "Juan Pérez",
                  },
                  departmentName: {
                    type: "string",
                    nullable: true,
                    example: "Marketing",
                  },
                  // Campo legacy (para compatibilidad)
                  fieldValues: {
                    type: "array",
                    nullable: true,
                    items: {
                      type: "object",
                      required: ["fieldId"],
                      properties: {
                        fieldId: { type: "number", example: 1 },
                        value: {
                          type: "string",
                          nullable: true,
                          example: "Valor del campo",
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
            description: "Request created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Solicitud creada exitosamente" },
                    data: {
                      type: "object",
                      properties: {
                        request: { $ref: "#/components/schemas/Request" },
                      },
                    },
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

    // PUT /request/{id}
    "/request/{id}": {
      put: {
        summary: "Update a request",
        description:
          "Actualizar una solicitud existente, actualizando timeline si cambia el estado",
        tags: ["Requests"],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID de la solicitud a actualizar",
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
                    example: "Nueva campaña de marketing actualizada",
                  },
                  content: {
                    type: "string",
                    nullable: true,
                    example: "Descripción actualizada",
                  },
                  priority: {
                    type: "string",
                    enum: ["urgente", "alto", "media", "medio", "baja", "bajo"],
                    example: "urgente",
                  },
                  status: {
                    type: "string",
                    enum: ["pendiente", "aceptada", "finalizada", "rechazada"],
                    example: "aceptada",
                  },
                  receiverUserId: {
                    type: "string",
                    format: "uuid",
                    nullable: true,
                    example: "28e442d3-714e-4dd7-9235-25e29d5ca315",
                  },
                  departmentId: {
                    type: "number",
                    nullable: true,
                    example: 3,
                  },
                  unitId: {
                    type: "number",
                    nullable: true,
                    example: 1,
                  },
                  formResponse: {
                    type: "array",
                    nullable: true,
                    items: {
                      type: "object",
                      required: ["id", "label", "type"],
                      properties: {
                        id: { type: "number", example: 1 },
                        label: { type: "string", example: "Etiqueta del campo" },
                        type: {
                          type: "string",
                          enum: ["texto", "numero", "fecha", "booleano", "seleccion", "archivo"],
                          example: "texto",
                        },
                        value: {
                          oneOf: [
                            { type: "string" },
                            { type: "number" },
                            { type: "boolean" },
                            { type: "null" },
                          ],
                          nullable: true,
                        },
                      },
                    },
                  },
                  isCompleted: {
                    type: "boolean",
                    example: false,
                  },
                  note: {
                    type: "string",
                    maxLength: 500,
                    nullable: true,
                    example: "Nota adicional para el cambio de estado",
                  },
                  userId: {
                    type: "string",
                    format: "uuid",
                    nullable: true,
                    example: "18e442d3-714e-4dd7-9235-25e29d5ca315",
                    description: "ID del usuario que realiza la actualización (para timeline)",
                  },
                },
                example: {
                  status: "aceptada",
                  note: "Solicitud aprobada por el departamento",
                  userId: "18e442d3-714e-4dd7-9235-25e29d5ca315",
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Request updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Solicitud actualizada exitosamente" },
                    data: {
                      type: "object",
                      properties: {
                        request: { $ref: "#/components/schemas/Request" },
                      },
                    },
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
      get: {
        summary: "Get request by ID with relations",
        description:
          "Obtener una solicitud específica con sus relaciones (plantilla, actividades, tareas)",
        tags: ["Requests"],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID de la solicitud",
            schema: {
              type: "number",
              minimum: 1,
            },
            example: 1,
          },
        ],
        responses: {
          "200": {
            description: "Request retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Solicitud obtenida exitosamente" },
                    data: {
                      type: "object",
                      properties: {
                        request: { $ref: "#/components/schemas/RequestWithRelations" },
                      },
                    },
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

    // GET /requests
    "/requests": {
      get: {
        summary: "Get all requests with filters and pagination",
        description: "Obtener todas las solicitudes con filtros avanzados y paginación",
        tags: ["Requests"],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            description: "Número de página",
            schema: {
              type: "number",
              minimum: 1,
              default: 1,
            },
            example: 1,
          },
          {
            name: "limit",
            in: "query",
            description: "Límite de resultados por página",
            schema: {
              type: "number",
              minimum: 1,
              maximum: 100,
              default: 20,
            },
            example: 20,
          },
          {
            name: "search",
            in: "query",
            description: "Texto para buscar en el título",
            schema: {
              type: "string",
            },
            example: "marketing",
          },
          {
            name: "sortBy",
            in: "query",
            description: "Campo para ordenar",
            schema: {
              type: "string",
              enum: ["createdAt", "updatedAt"],
              default: "createdAt",
            },
            example: "createdAt",
          },
          {
            name: "order",
            in: "query",
            description: "Dirección del orden",
            schema: {
              type: "string",
              enum: ["asc", "desc"],
              default: "asc",
            },
            example: "desc",
          },
          {
            name: "status",
            in: "query",
            description: "Filtrar por estado",
            schema: {
              type: "string",
              enum: ["pendiente", "aceptada", "finalizada", "rechazada"],
            },
            example: "pendiente",
          },
          {
            name: "priority",
            in: "query",
            description: "Filtrar por prioridad",
            schema: {
              type: "string",
              enum: ["urgente", "media", "baja"],
            },
            example: "media",
          },
          {
            name: "startDate",
            in: "query",
            description: "Fecha de inicio (ISO 8601)",
            schema: {
              type: "string",
              format: "date-time",
            },
            example: "2024-01-01T00:00:00Z",
          },
          {
            name: "endDate",
            in: "query",
            description: "Fecha de fin (ISO 8601)",
            schema: {
              type: "string",
              format: "date-time",
            },
            example: "2024-12-31T23:59:59Z",
          },
          {
            name: "type",
            in: "query",
            description: "Tipo de solicitudes (sent/receive)",
            schema: {
              type: "string",
              enum: ["sent", "receive"],
            },
            example: "sent",
          },
          {
            name: "userId",
            in: "query",
            description: "ID del usuario (requerido cuando type está presente)",
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "18e442d3-714e-4dd7-9235-25e29d5ca315",
          },
          {
            name: "departmentId",
            in: "query",
            description: "Filtrar por ID de departamento",
            schema: {
              type: "number",
              minimum: 1,
            },
            example: 3,
          },
          {
            name: "unitId",
            in: "query",
            description: "Filtrar por ID de unidad",
            schema: {
              type: "number",
              minimum: 1,
            },
            example: 1,
          },
          {
            name: "requestTemplateId",
            in: "query",
            description: "Filtrar por ID de plantilla",
            schema: {
              type: "number",
              minimum: 1,
            },
            example: 1,
          },
        ],
        responses: {
          "200": {
            description: "Requests retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Solicitudes obtenidas exitosamente" },
                    data: {
                      type: "object",
                      properties: {
                        requests: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Request" },
                        },
                        pagination: {
                          type: "object",
                          properties: {
                            page: { type: "number", example: 1 },
                            limit: { type: "number", example: 20 },
                            total: { type: "number", example: 100 },
                            totalPages: { type: "number", example: 5 },
                            hasNextPage: { type: "boolean", example: true },
                            hasPrevPage: { type: "boolean", example: false },
                          },
                        },
                      },
                    },
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
      Request: {
        type: "object",
        properties: {
          id: {
            type: "number",
            example: 1,
          },
          title: {
            type: "string",
            example: "Nueva campaña de marketing",
          },
          content: {
            type: "string",
            nullable: true,
            example: "Descripción detallada",
          },
          departmentId: {
            type: "number",
            nullable: true,
            example: 3,
          },
          requestedByDepartmentId: {
            type: "number",
            nullable: true,
            example: 3,
          },
          unitId: {
            type: "number",
            nullable: true,
            example: 1,
          },
          receiverUserId: {
            type: "string",
            format: "uuid",
            nullable: true,
            example: "28e442d3-714e-4dd7-9235-25e29d5ca315",
          },
          createdByUserId: {
            type: "string",
            format: "uuid",
            example: "18e442d3-714e-4dd7-9235-25e29d5ca315",
          },
          requestTemplateId: {
            type: "number",
            nullable: true,
            example: 1,
          },
          priority: {
            type: "string",
            enum: ["urgente", "media", "baja"],
            example: "media",
          },
          timeline: {
            type: "array",
            items: {
              type: "object",
              properties: {
                status: { type: "string" },
                timestamp: { type: "string", format: "date-time" },
                userId: { type: "string" },
                note: { type: "string", nullable: true },
              },
            },
          },
          formResponse: {
            type: "array",
            nullable: true,
            items: {
              type: "object",
              properties: {
                id: { type: "number" },
                label: { type: "string" },
                type: { type: "string" },
                value: {
                  oneOf: [
                    { type: "string" },
                    { type: "number" },
                    { type: "boolean" },
                    { type: "null" },
                  ],
                },
              },
            },
          },
          status: {
            type: "string",
            enum: ["pendiente", "aceptada", "finalizada", "rechazada"],
            default: "pendiente",
            example: "pendiente",
          },
          isCompleted: {
            type: "boolean",
            default: false,
            example: false,
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
      RequestWithRelations: {
        type: "object",
        allOf: [
          { $ref: "#/components/schemas/Request" },
          {
            type: "object",
            properties: {
              requestTemplate: {
                type: "object",
                nullable: true,
                properties: {
                  id: { type: "number" },
                  title: { type: "string" },
                  description: { type: "string", nullable: true },
                },
              },
              activities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    type: { type: "string" },
                    description: { type: "string" },
                    author: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                  },
                },
              },
              task: {
                type: "object",
                nullable: true,
                properties: {
                  id: { type: "number" },
                  title: { type: "string" },
                  status: { type: "string" },
                },
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
                message: { type: "string", example: "Solicitud no encontrada" },
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
