import { type InferInsertModel, relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { request } from "./request.schema";
import { requestTemplateField } from "./requestTemplateField.schema";

export const requestTemplateFieldValue = pgTable("request_field_value", {
  id: serial().primaryKey(),
  fieldId: integer("field_id")
    .references(() => requestTemplateField.id, { onDelete: "cascade" })
    .notNull(),
  requestId: integer("request_id")
    .references(() => request.id, { onDelete: "cascade" })
    .notNull(),
  value: text("value"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type RequestFieldValue = typeof requestTemplateFieldValue.$inferSelect;
export type NewRequestFieldValue = typeof requestTemplateFieldValue.$inferInsert;
export type RequestFieldValueInsert = InferInsertModel<typeof requestTemplateFieldValue>;

export const requestTemplateFieldValueRelations = relations(
  requestTemplateFieldValue,
  ({ one }) => ({
    field: one(requestTemplateField, {
      fields: [requestTemplateFieldValue.fieldId],
      references: [requestTemplateField.id],
    }),
    request: one(request, {
      fields: [requestTemplateFieldValue.requestId],
      references: [request.id],
    }),
  })
);
