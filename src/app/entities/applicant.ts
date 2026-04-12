import { relations } from "drizzle-orm";
import { boolean, integer, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { observationApplicant } from "./observationAplicant.schema";
import { task } from "./task.schema";
import { taskField } from "./taskField.schema";
import { taskStep } from "./taskStep.schema";

// Enums
export const applicantStatusEnum = pgEnum("applicant_status", ["cancel", "pending", "approved"]);

export const applicant = pgTable("applicant", {
  id: uuid("id").primaryKey().defaultRandom(),
  status: applicantStatusEnum("status").default("pending"),
  statusDirector: boolean("status_director").default(false),
  statusColaborador: boolean("status_colaborador").default(false),
  statusRequest: boolean("status_request").default(false),
  taskStepId: integer("task_step_id").references(() => taskStep.id, { onDelete: "set null" }),
  taskId: integer("task_id").references(() => task.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tipos TypeScript
export type Applicant = typeof applicant.$inferSelect;
export type NewApplicant = typeof applicant.$inferInsert;

// Relaciones
export const applicantRelations = relations(applicant, ({ one, many }) => ({
  taskStep: one(taskStep, {
    fields: [applicant.taskStepId],
    references: [taskStep.id],
  }),
  task: one(task, {
    fields: [applicant.taskId],
    references: [task.id],
  }),
  observations: many(observationApplicant, {
    relationName: "applicantObservations",
  }),
  taskFields: many(taskField, {
    relationName: "applicantTaskFields",
  }),
}));
