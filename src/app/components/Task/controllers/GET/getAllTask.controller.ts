import { db } from "@core/database";
import { task } from "@schemas/index";
import { successResponse } from "@shared/utils";
import type { NextFunction, Request, Response } from "express";

export const getAllTask = async (_: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tasksFound = await db.select().from(task).orderBy(task.title);

    successResponse(res, {
      data: tasksFound,
      message: "Task fetched successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching Task:", error);
    next(error);
  }
};
