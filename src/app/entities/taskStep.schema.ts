import { relations } from "drizzle-orm";
import { boolean, integer, pgEnum, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { applicant } from "./applicant";
import { observationApplicant } from "./observationAplicant.schema";
import { taskField } from "./taskField.schema";
import { taskTemplate } from "./taskTemplate.schema";

// Enums
export const typeStepEnum = pgEnum("type_step", ["director", "colaborador"]);

export const taskStep = pgTable("task_step", {
  id: serial().primaryKey(),
  title: varchar({ length: 255 }),
  subTitle: varchar({ length: 255 }),
  typeStep: typeStepEnum("type_step").default("director"),
  stepStatus: boolean("step_status").default(false),
  order: integer("order"),
  taskTemplateId: integer("task_template_id").references(() => taskTemplate.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TaskStep = typeof taskStep.$inferSelect;
export type NewTaskStep = typeof taskStep.$inferInsert;

// Relaciones
export const taskStepRelations = relations(taskStep, ({ one, many }) => ({
  taskTemplate: one(taskTemplate, {
    fields: [taskStep.taskTemplateId],
    references: [taskTemplate.id],
  }),
  taskFields: many(taskField),
  applicants: many(applicant),
  observations: many(observationApplicant),
}));
