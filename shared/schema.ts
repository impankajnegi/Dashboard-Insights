import { pgTable, text, serial, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").references(() => workspaces.id).notNull(),
  date: date("date").notNull(), // Recorded date (usually 1st of month for monthly stats)
  
  // Metric values
  sessions: integer("sessions").default(0),
  activeBots: integer("active_bots").default(0),
  totalUsers: integer("total_users").default(0),
  decommissionedBots: integer("decommissioned_bots").default(0),
  ticketsHandled: integer("tickets_handled").default(0),
});

// === SCHEMAS ===

export const insertWorkspaceSchema = createInsertSchema(workspaces).omit({ id: true, createdAt: true });
export const insertMetricSchema = createInsertSchema(metrics).omit({ id: true });

// === TYPES ===

export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;

export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = z.infer<typeof insertMetricSchema>;

// API Response Types
export type DashboardSummary = {
  totalSessions: number;
  totalActiveBots: number;
  totalUsers: number;
  totalDecommissionedBots: number;
  totalTicketsHandled: number;
};

export type WorkspaceWithMetrics = Workspace & {
  metrics: Metric[];
};
