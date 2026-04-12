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
import { applicant } from "./applicant";
import { taskFieldValue } from "./taskFieldValue.schema";
import { taskStep } from "./taskStep.schema";

// Enums (mantener los mismos)
export const directionMapOptionTaskEnum = pgEnum("direction_map_option", [
  "row",
  "columns",
  "grid",
]);
export const taskFieldTypeEnum = pgEnum("task_field_type", [
  "texto",
  "opcion-multiple",
  "checkbox",
  "dropdown",
  "grupo-texto-corto",
  "imagen",
  "fecha",
  "url",
  "nota",
  "archivo",
  "none",
  "textarea",
  "numero",
]);

export const taskField = pgTable("task_field", {
  id: serial().primaryKey(),
  label: varchar({ length: 255 }),
  showRequest: boolean("show_request").default(true),
  required: boolean("required").default(false),
  options: json("options"),
  isMultiple: boolean("is_multiple").default(false),
  limitFile: integer("limit_file"),
  order: integer("order").notNull(),
  text: text("text"),
  placeHolder: text("place_holder"),
  type: taskFieldTypeEnum("type").notNull(),
  directionMapOption: directionMapOptionTaskEnum("direction_map_option"),
  applicantId: uuid("applicant_id").references(() => applicant.id),
  taskStepId: integer("task_step_id").references(() => taskStep.id, { onDelete: "cascade" }), // Agregado onDelete
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TaskField = typeof taskField.$inferSelect;
export type NewTaskField = typeof taskField.$inferInsert;

export const taskFieldRelations = relations(taskField, ({ one, many }) => ({
  taskStep: one(taskStep, {
    fields: [taskField.taskStepId],
    references: [taskStep.id],
    relationName: "taskStepFields",
  }),
  applicant: one(applicant, {
    fields: [taskField.applicantId],
    references: [applicant.id],
  }),
  values: many(taskFieldValue),
}));
