import { db } from "@core/database";
import { taskTemplate } from "@schemas/index";
import { successResponse } from "@shared/utils";
import type { NextFunction, Request, Response } from "express";

export const getTaskTemplates = async (
  _: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const templates = await db.select().from(taskTemplate).orderBy(taskTemplate.title);

    successResponse(res, {
      data: templates,
      message: "Templates fetched successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    next(error);
  }
};
