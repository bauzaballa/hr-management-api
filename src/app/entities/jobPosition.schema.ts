import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const jobPosition = pgTable("jobPosition", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});
