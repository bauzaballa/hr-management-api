import type { InferInsertModel } from 'drizzle-orm';
import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const seedersLog = pgTable('seeders_log', {
  name: varchar('name', { length: 255 }).primaryKey(),
  executedAt: timestamp('executed_at').defaultNow(),
});

export type seedersLogInsert = InferInsertModel<typeof seedersLog>;
