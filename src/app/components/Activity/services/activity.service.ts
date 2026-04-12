import { db } from "@core/database";
import { activity, type activityInsert, type activityTypeEnum } from "@schemas/index";
import { AppError } from "@shared/utils";
import { and, desc, eq, sql } from "drizzle-orm";

export class ActivityService {
  // CREATE - Crear una nueva actividad
  async createActivity(activityData: activityInsert) {
    try {
      // Validar que al menos uno de los IDs esté presente
      if (!activityData.requestId && !activityData.taskId) {
        throw new AppError("Debe proporcionar requestId o taskId", 400);
      }

      // Validar que fullName y description no estén vacíos
      if (!activityData.fullName?.trim() || !activityData.description?.trim()) {
        throw new AppError("fullName y description son requeridos", 400);
      }

      const [newActivity] = await db
        .insert(activity)
        .values({
          ...activityData,
          fullName: activityData.fullName.trim(),
          description: activityData.description.trim(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return newActivity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Error al crear actividad", 400, error);
    }
  }

  // READ - Obtener todas las actividades
  async getAllActivities() {
    try {
      const query = db.select().from(activity).orderBy(desc(activity.createdAt));

      const activities = await query;
      return activities;
    } catch (error) {
      throw new AppError("Error al obtener todas las actividades", 400, error);
    }
  }

  // READ - Obtener actividad por ID
  async getActivityById(id: number) {
    try {
      const [foundActivity] = await db.select().from(activity).where(eq(activity.id, id));

      if (!foundActivity) {
        throw new AppError("Actividad no encontrada", 404);
      }

      return foundActivity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Error al obtener actividad por id", 400, error);
    }
  }

  // READ - Obtener actividades por requestId
  async getActivitiesByRequestId(requestId: number) {
    try {
      const query = db
        .select()
        .from(activity)
        .where(eq(activity.requestId, requestId))
        .orderBy(desc(activity.createdAt));

      const activities = await query;
      return activities;
    } catch (error) {
      throw new AppError("Error al obtener actividad por solicitud", 400, error);
    }
  }

  // READ - Obtener actividades por taskId
  async getActivitiesByTaskId(taskId: number) {
    try {
      const query = db
        .select()
        .from(activity)
        .where(eq(activity.taskId, taskId))
        .orderBy(desc(activity.createdAt));

      const activities = await query;
      return activities;
    } catch (error) {
      throw new AppError("Error al obtener actividad por tarea", 400, error);
    }
  }

  // READ - Obtener actividades por entidad (requestId O taskId)
  async getActivitiesByEntity(options: {
    requestId?: number;
    taskId?: number;
    type?: (typeof activityTypeEnum.enumValues)[number];
    limit?: number;
  }) {
    try {
      const { requestId, taskId, type } = options;

      if (!requestId && !taskId) {
        throw new AppError("Debe proporcionar requestId o taskId", 400);
      }

      const conditions = [];

      if (requestId) {
        conditions.push(eq(activity.requestId, requestId));
      }

      if (taskId) {
        conditions.push(eq(activity.taskId, taskId));
      }

      if (type) {
        conditions.push(eq(activity.type, type));
      }

      const query = db
        .select()
        .from(activity)
        .where(and(...conditions))
        .orderBy(desc(activity.createdAt));

      const activities = await query;
      return activities;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Error al obtener actividades por entidad", 400, error);
    }
  }

  // READ - Obtener actividades por tipo
  async getActivitiesByType(type: (typeof activityTypeEnum.enumValues)[number]) {
    try {
      const query = db
        .select()
        .from(activity)
        .where(eq(activity.type, type))
        .orderBy(desc(activity.createdAt));

      const activities = await query;
      return activities;
    } catch (error) {
      throw new AppError("Error al obtener actividad por tipo de solicitud", 400, error);
    }
  }

  // READ - Obtener actividades recientes con información de entidad
  async getRecentActivities(limit: number = 20) {
    try {
      const activities = await db
        .select({
          id: activity.id,
          fullName: activity.fullName,
          description: activity.description,
          type: activity.type,
          requestId: activity.requestId,
          taskId: activity.taskId,
          createdAt: activity.createdAt,
          entityType: sql<string>`CASE 
            WHEN ${activity.requestId} IS NOT NULL THEN 'request' 
            WHEN ${activity.taskId} IS NOT NULL THEN 'task' 
            ELSE 'unknown' 
          END`.as("entityType"),
        })
        .from(activity)
        .orderBy(desc(activity.createdAt))
        .limit(limit);

      return activities;
    } catch (error) {
      throw new AppError("Error al obtener actividades recientes", 400, error);
    }
  }

  // Método específico para crear comentarios
  async createComment(
    fullName: string,
    description: string,
    options: {
      requestId?: number;
      taskId?: number;
    }
  ) {
    const { requestId, taskId } = options;

    return this.createActivity({
      fullName: fullName.trim(),
      description: description.trim(),
      type: "comment",
      requestId,
      taskId,
    });
  }

  // Método específico para crear historial
  async createHistory(
    fullName: string,
    description: string,
    options: {
      requestId?: number;
      taskId?: number;
    }
  ) {
    const { requestId, taskId } = options;

    return this.createActivity({
      fullName: fullName.trim(),
      description: description.trim(),
      type: "history",
      requestId,
      taskId,
    });
  }

  // Método específico para crear actividad de tarea
  async createTaskActivity(
    fullName: string,
    description: string,
    taskId: number,
    type: "comment" | "history" = "history"
  ) {
    return this.createActivity({
      fullName: fullName.trim(),
      description: description.trim(),
      type,
      taskId,
      requestId: null,
    });
  }

  // Método específico para crear actividad de solicitud
  async createRequestActivity(
    fullName: string,
    description: string,
    requestId: number,
    type: "comment" | "history" = "history"
  ) {
    return this.createActivity({
      fullName: fullName.trim(),
      description: description.trim(),
      type,
      requestId,
      taskId: null,
    });
  }

  // Obtener conteo de actividades por entidad
  async getActivityCounts(options: { requestId?: number; taskId?: number }) {
    try {
      const { requestId, taskId } = options;

      const conditions = [];

      if (requestId) {
        conditions.push(eq(activity.requestId, requestId));
      }

      if (taskId) {
        conditions.push(eq(activity.taskId, taskId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const result = await db
        .select({
          total: sql<number>`COUNT(*)`,
          comments: sql<number>`COUNT(CASE WHEN type = 'comment' THEN 1 END)`,
          history: sql<number>`COUNT(CASE WHEN type = 'history' THEN 1 END)`,
        })
        .from(activity)
        .where(whereClause);

      return result[0] || { total: 0, comments: 0, history: 0 };
    } catch (error) {
      throw new AppError("Error al obtener conteos de actividades", 400, error);
    }
  }

  // Buscar actividades por texto (búsqueda en description)
  async searchActivities(searchText: string, limit: number = 50) {
    try {
      const activities = await db
        .select()
        .from(activity)
        .where(sql`LOWER(${activity.description}) LIKE LOWER(${"%" + searchText + "%"})`)
        .orderBy(desc(activity.createdAt))
        .limit(limit);

      return activities;
    } catch (error) {
      throw new AppError("Error al buscar actividades", 400, error);
    }
  }

  // Obtener actividades por rango de fechas
  async getActivitiesByDateRange(
    startDate: Date,
    endDate: Date,
    options?: {
      requestId?: number;
      taskId?: number;
      type?: (typeof activityTypeEnum.enumValues)[number];
    }
  ) {
    try {
      const { requestId, taskId, type } = options || {};

      const conditions = [
        sql`${activity.createdAt} >= ${startDate}`,
        sql`${activity.createdAt} <= ${endDate}`,
      ];

      if (requestId) {
        conditions.push(eq(activity.requestId, requestId));
      }

      if (taskId) {
        conditions.push(eq(activity.taskId, taskId));
      }

      if (type) {
        conditions.push(eq(activity.type, type));
      }

      const activities = await db
        .select()
        .from(activity)
        .where(and(...conditions))
        .orderBy(desc(activity.createdAt));

      return activities;
    } catch (error) {
      throw new AppError("Error al obtener actividades por rango de fechas", 400, error);
    }
  }
}
