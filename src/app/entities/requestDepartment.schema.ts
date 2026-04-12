import { relations } from "drizzle-orm";
import { integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { requestTemplate } from "./requestTemplate.schema";

export const requestDepartment = pgTable("request_department", {
  // Cambiado de "form_department" a "request_department"
  id: uuid("id").primaryKey().defaultRandom(),
  templateId: integer("template_id") // Cambiado de formId a templateId
    .references(() => requestTemplate.id, { onDelete: "cascade" })
    .notNull(),
  departmentId: integer("department_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tipos TypeScript
export type RequestDepartment = typeof requestDepartment.$inferSelect;
export type NewRequestDepartment = typeof requestDepartment.$inferInsert;

// Relaciones
export const requestDepartmentRelations = relations(requestDepartment, ({ one }) => ({
  template: one(requestTemplate, {
    fields: [requestDepartment.templateId],
    references: [requestTemplate.id],
  }),
}));
