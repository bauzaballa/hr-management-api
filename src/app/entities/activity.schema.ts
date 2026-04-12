import { type InferInsertModel, relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { request } from "./request.schema";
import { task } from "./task.schema";

export const activityTypeEnum = pgEnum("activity_type", ["comment", "history"]);

export const activity = pgTable("activity", {
  id: serial().primaryKey(),
  fullName: varchar({ length: 100 }).notNull(),
  description: text("description").notNull(),
  type: activityTypeEnum("type").notNull(),
  requestId: integer("request_id"),
  taskId: integer("task_id"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type activityInsert = InferInsertModel<typeof activity>;

export const activityRelations = relations(activity, ({ one }) => ({
  request: one(request, {
    fields: [activity.requestId],
    references: [request.id],
  }),
  task: one(task, {
    fields: [activity.taskId],
    references: [task.id],
  }),
}));
