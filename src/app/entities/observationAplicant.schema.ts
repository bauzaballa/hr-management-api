// observationApplicant.schema.ts

import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { applicant } from "./applicant";
import { taskStep } from "./taskStep.schema";

// Enums
export const observationTypeEnum = pgEnum("observation_type", ["request", "task"]);

export const observationApplicant = pgTable("observation_applicant", {
  id: uuid("id").primaryKey().defaultRandom(),
  description: text("description").notNull(),
  type: observationTypeEnum("type").default("task"),
  applicantId: uuid("applicant_id")
    .references(() => applicant.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id"),
  taskStepId: integer("task_step_id").references(() => taskStep.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tipos TypeScript
export type ObservationApplicant = typeof observationApplicant.$inferSelect;
export type NewObservationApplicant = typeof observationApplicant.$inferInsert;

// Relaciones
export const observationApplicantRelations = relations(observationApplicant, ({ one }) => ({
  applicant: one(applicant, {
    fields: [observationApplicant.applicantId],
    references: [applicant.id],
    relationName: "applicantObservations",
  }),
  taskStep: one(taskStep, {
    fields: [observationApplicant.taskStepId],
    references: [taskStep.id],
  }),
}));
