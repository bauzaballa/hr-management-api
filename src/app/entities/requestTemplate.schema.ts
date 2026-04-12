import { relations } from "drizzle-orm";
import { pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { request } from "./request.schema";
import { requestDepartment } from "./requestDepartment.schema";
import { requestTemplateField } from "./requestTemplateField.schema";

// Enums
export const formStatusEnum = pgEnum("form_status", ["active", "inactive"]);

export const requestTemplate = pgTable("request_template", {
  id: serial().primaryKey(),
  title: varchar({ length: 255 }).notNull(),
  description: text("description"),
  departmentIds: varchar("department_id"),
  departmentName: varchar({ length: 255 }),
  unit: varchar({ length: 255 }),
  status: formStatusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tipos TypeScript
export type RequestTemplate = typeof requestTemplate.$inferSelect;
export type NewRequestTemplate = typeof requestTemplate.$inferInsert;

// Relaciones - directamente con fields, sin steps
export const requestTemplateRelations = relations(requestTemplate, ({ many }) => ({
  fields: many(requestTemplateField),
  requests: many(request),
  departments: many(requestDepartment),
}));
