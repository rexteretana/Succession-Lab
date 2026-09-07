import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const cases = sqliteTable("cases", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  grNo: text("gr_no"),
  decisionDate: text("decision_date"),
  payloadJson: text("payload_json").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [index("idx_cases_decision_date").on(table.decisionDate)]);
