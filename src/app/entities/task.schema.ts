// task.schema.ts - Versión corregida
import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { activity } from "./activity.schema";
import { request } from "./request.schema";
import { taskFieldValue } from "./taskFieldValue.schema";
import { taskTemplate } from "./taskTemplate.schema";

// Enums
export const taskPriorityEnum = pgEnum("task_priority", ["urgente", "media", "baja"]);
export const taskStatusEnum = pgEnum("task_status", [
  "pendiente",
  "en-proceso",
  "completada",
  "vencida",
  "cancelada",
]);
export const taskCategoryEnum = pgEnum("task_category", ["Comercial", "No comercial"]);

export const task = pgTable("task", {
  id: serial().primaryKey(),
  title: varchar({ length: 255 }).notNull(),
  departmentId: integer("department_id"),
  userIds: text("user_ids"),
  userIdCreated: text("user_id_created").notNull(),
  description: text("description"),
  startDate: date("start_date"),
  dueDate: date("due_date"),
  isDraft: boolean("is_draft").default(true),
  subareaId: integer("subarea_id"),
  position: text("position"),
  unitId: integer("unit_id"),
  status: taskStatusEnum("status").default("pendiente"),
  priority: taskPriorityEnum("priority").default("media"),
  category: taskCategoryEnum("category").default("No comercial"),
  requestId: integer("request_id").references(() => request.id),
  taskTemplateId: integer("task_template_id").references(() => taskTemplate.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tipos TypeScript
export type Task = typeof task.$inferSelect;
export type NewTask = typeof task.$inferInsert;

// CORRECCIÓN de la relación:
export const taskRelations = relations(task, ({ one, many }) => ({
  taskTemplate: one(taskTemplate, {
    fields: [task.taskTemplateId],
    references: [taskTemplate.id],
  }),
  request: one(request, {
    fields: [task.requestId],
    references: [request.id],
  }),
  activities: many(activity),
  fieldValues: many(taskFieldValue, {
    relationName: "taskFieldValues",
  }),
}));
