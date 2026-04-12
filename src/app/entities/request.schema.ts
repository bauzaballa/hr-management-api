// request.schema.ts
import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  json,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { activity } from "./activity.schema";
import { requestTemplate } from "./requestTemplate.schema";
import { task } from "./task.schema";

// Enums
export const requestPriorityEnum = pgEnum("request_priority", ["urgente", "media", "baja"]);

export const requestStatusEnum = pgEnum("request_status", [
  "pendiente",
  "aceptada",
  "finalizada",
  "rechazada",
]);

export const request = pgTable("request", {
  id: serial().primaryKey(),
  title: varchar({ length: 255 }).notNull(),
  departmentId: integer("department_id"),
  requestedByDepartmentId: integer("requested_by_department_id"),
  unitId: integer("unit_id"),
  receiverUserId: uuid("receiver_user_id"),
  createdByUserId: uuid("created_by_user_id").notNull(),
  requestTemplateId: integer("request_template_id").references(() => requestTemplate.id, {
    onDelete: "set null",
  }),
  priority: requestPriorityEnum("priority"),
  content: text("content"),
  timeline: json("timeline"),
  formResponse: json("form_response"),
  status: requestStatusEnum("status").default("pendiente"),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tipos TypeScript
export type Request = typeof request.$inferSelect;
export type NewRequest = typeof request.$inferInsert;

// Relaciones
export const requestRelations = relations(request, ({ one, many }) => ({
  requestTemplate: one(requestTemplate, {
    fields: [request.requestTemplateId],
    references: [requestTemplate.id],
  }),
  task: one(task, {
    fields: [request.id],
    references: [task.requestId],
  }),
  activities: many(activity),
}));
