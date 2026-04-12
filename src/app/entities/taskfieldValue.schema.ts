// taskFieldValue.schema.ts

import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { task } from "./task.schema";
import { taskField } from "./taskField.schema";

export const taskFieldValue = pgTable("task_field_value", {
  id: serial().primaryKey(),
  taskFieldId: integer("task_field_id")
    .references(() => taskField.id, { onDelete: "cascade" })
    .notNull(),
  taskId: integer("task_id")
    .references(() => task.id, { onDelete: "cascade" })
    .notNull(),
  value: text("value"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tipos TypeScript
export type TaskFieldValue = typeof taskFieldValue.$inferSelect;
export type NewTaskFieldValue = typeof taskFieldValue.$inferInsert;

// Relaciones
export const taskFieldValueRelations = relations(taskFieldValue, ({ one }) => ({
  taskField: one(taskField, {
    fields: [taskFieldValue.taskFieldId],
    references: [taskField.id],
  }),
  task: one(task, {
    fields: [taskFieldValue.taskId],
    references: [task.id],
  }),
}));
