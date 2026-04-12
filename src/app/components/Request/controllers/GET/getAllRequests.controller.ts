import { db } from "@core/database";
import { request } from "@schemas/request.schema";
import { AppError, formatJoiError, successResponse } from "@shared/utils";
import { advancedQuerySchema, paginationSchema } from "@shared/validations";
import { and, asc, desc, eq, gte, ilike, lte, sql } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";

export const getAllRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Validar parámetros
    const { error: paginationError, value: pagination } = paginationSchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    const { error: advancedError, value: advancedFilters } = advancedQuerySchema.validate(
      req.query,
      {
        abortEarly: false,
        stripUnknown: true,
      }
    );

    // Manejar errores de validación
    if (paginationError) {
      const formatted = formatJoiError(paginationError);
      throw new AppError("Error de validación", 400, formatted);
    }

    if (advancedError) {
      const formatted = formatJoiError(advancedError);
      throw new AppError("Error de validación", 400, formatted);
    }

    // 2. Extraer valores
    const { page = 1, limit = 20, sortBy = "createdAt", order = "asc", search = "" } = pagination;
    const { status, priority, startDate, endDate, type } = advancedFilters;

    const pageNum = page;
    const limitNum = limit;
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];

    // ========== Filtros ==========
    if (status) {
      conditions.push(eq(request.status, status));
    }

    if (priority) {
      conditions.push(eq(request.priority, priority));
    }

    if (startDate) {
      conditions.push(gte(request.createdAt, new Date(startDate)));
    }

    if (endDate) {
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);
      conditions.push(lte(request.createdAt, endDateObj));
    }

    // Búsqueda por texto
    if (search && search.trim() !== "") {
      conditions.push(ilike(request.title, `%${search}%`));
    }

    const userId = req.query.userId as string;
    if (type && userId) {
      if (type === "sent") {
        conditions.push(eq(request.createdByUserId, userId));
      } else if (type === "receive") {
        conditions.push(eq(request.receiverUserId, userId));
      }
    }

    // ========== Filtros ==========

    const orderByField = sortBy === "updatedAt" ? request.updatedAt : request.createdAt;
    const orderDirection = order.toLowerCase() === "desc" ? desc : asc;

    const requests = await db
      .select()
      .from(request)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limitNum)
      .offset(offset)
      .orderBy(orderDirection(orderByField));

    const totalResult = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(request)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limitNum);

    successResponse(res, {
      data: {
        requests,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
        message: "Template actualizado exitosamente",
        status: 200,
      },
    });
  } catch (error) {
    next(error);
  }
};
