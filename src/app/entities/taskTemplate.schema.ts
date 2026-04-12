// taskTemplate.schema.ts

import { relations } from "drizzle-orm";
import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { taskStep } from "./taskStep.schema";

export const taskTemplate = pgTable("task_template", {
  id: serial().primaryKey(),
  title: varchar({ length: 255 }).notNull(),
  subarea: varchar({ length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TaskTemplate = typeof taskTemplate.$inferSelect;
export type NewTaskTemplate = typeof taskTemplate.$inferInsert;

export const taskTemplateRelations = relations(taskTemplate, ({ many }) => ({
  taskSteps: many(taskStep, {
    relationName: "templateTaskSteps",
  }),
}));
