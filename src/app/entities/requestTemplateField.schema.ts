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
  varchar,
} from "drizzle-orm/pg-core";
import { requestTemplate } from "./requestTemplate.schema";
import { requestTemplateFieldValue } from "./requestTemplateFieldValue.schema";

// Enums para tipos de campo
export const formFieldTypeEnum = pgEnum("form_field_type", [
  "text",
  "textarea",
  "number",
  "email",
  "date",
  "select",
  "checkbox",
  "radio",
  "file",
  "multiple",
]);

export const requestTemplateField = pgTable("request_field", {
  id: serial().primaryKey(),
  templateId: integer("template_id")
    .references(() => requestTemplate.id, { onDelete: "cascade" })
    .notNull(),
  label: varchar({ length: 255 }).notNull(),
  type: formFieldTypeEnum("type").notNull(),
  options: json("options"),
  placeholder: text("placeholder"),
  required: boolean("required").default(false),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tipos TypeScript
export type RequestTemplateField = typeof requestTemplateField.$inferSelect;
export type NewRequestTemplateField = typeof requestTemplateField.$inferInsert;

// Relaciones sin step
export const requestTemplateFieldRelations = relations(requestTemplateField, ({ one, many }) => ({
  template: one(requestTemplate, {
    fields: [requestTemplateField.templateId],
    references: [requestTemplate.id],
  }),
  fieldValues: many(requestTemplateFieldValue),
}));
