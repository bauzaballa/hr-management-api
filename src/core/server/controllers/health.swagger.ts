export const healthSwagger = {
  paths: {
    '/health': {
      get: {
        summary: 'Get server health information',
        description:
          'Informacion del servidor incluyendo Status, Database, Memory, CPU, and application info',
        tags: ['Health'],
        responses: {
          '200': {
            description: 'Server health information retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'OK',
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time',
                      example: '2024-01-15T10:30:00.000Z',
                    },
                    uptime: {
                      type: 'number',
                      example: 3600.5,
                    },
                    server: {
                      type: 'object',
                      properties: {
                        node_version: {
                          type: 'string',
                          example: 'v18.17.0',
                        },
                        platform: {
                          type: 'string',
                          example: 'linux',
                        },
                        arch: {
                          type: 'string',
                          example: 'x64',
                        },
                        memory: {
                          type: 'object',
                          properties: {
                            total: {
                              type: 'string',
                              example: '16.00 GB',
                            },
                            free: {
                              type: 'string',
                              example: '4.50 GB',
                            },
                            used: {
                              type: 'string',
                              example: '11.50 GB',
                            },
                            usage_percentage: {
                              type: 'string',
                              example: '71.88%',
                            },
                          },
                        },
                        cpu: {
                          type: 'object',
                          properties: {
                            cores: {
                              type: 'number',
                              example: 8,
                            },
                            load_average: {
                              type: 'array',
                              items: { type: 'number' },
                              example: [1.2, 1.5, 1.8],
                            },
                          },
                        },
                      },
                    },
                    application: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                          example: 'marketing-api',
                        },
                        version: {
                          type: 'string',
                          example: '1.0.0',
                        },
                        environment: {
                          type: 'string',
                          example: 'development',
                        },
                      },
                    },
                    database: {
                      type: 'object',
                      properties: {
                        status: {
                          type: 'string',
                          example: 'connected',
                        },
                        timestamp: {
                          type: 'string',
                          format: 'date-time',
                          example: '2024-01-15T10:30:00.000Z',
                        },
                        response_time: {
                          type: 'string',
                          example: '15.25 ms',
                        },
                      },
                    },
                    system: {
                      type: 'object',
                      properties: {
                        hostname: {
                          type: 'string',
                          example: 'server-prod-01',
                        },
                        user: {
                          type: 'string',
                          example: 'appuser',
                        },
                        uptime: {
                          type: 'number',
                          example: 86400,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'error' },
                    message: { type: 'string', example: 'Could not retrieve server information' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  components: {
    schemas: {
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['OK', 'error'] },
          timestamp: { type: 'string', format: 'date-time' },
          uptime: { type: 'number' },
          server: { $ref: '#/components/schemas/ServerInfo' },
          application: { $ref: '#/components/schemas/ApplicationInfo' },
          database: { $ref: '#/components/schemas/DatabaseHealth' },
          system: { $ref: '#/components/schemas/SystemInfo' },
        },
      },
      ServerInfo: {
        type: 'object',
        properties: {
          node_version: { type: 'string' },
          platform: { type: 'string' },
          arch: { type: 'string' },
          memory: { $ref: '#/components/schemas/MemoryInfo' },
          cpu: { $ref: '#/components/schemas/CPUInfo' },
        },
      },
      MemoryInfo: {
        type: 'object',
        properties: {
          total: { type: 'string' },
          free: { type: 'string' },
          used: { type: 'string' },
          usage_percentage: { type: 'string' },
        },
      },
      CPUInfo: {
        type: 'object',
        properties: {
          cores: { type: 'number' },
          load_average: {
            type: 'array',
            items: { type: 'number' },
          },
        },
      },
      ApplicationInfo: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          version: { type: 'string' },
          environment: { type: 'string' },
        },
      },
      DatabaseHealth: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['connected', 'disconnected', 'error'] },
          timestamp: { type: 'string', format: 'date-time' },
          response_time: { type: 'string' },
        },
      },
      SystemInfo: {
        type: 'object',
        properties: {
          hostname: { type: 'string' },
          user: { type: 'string' },
          uptime: { type: 'number' },
        },
      },
    },
  },
};
