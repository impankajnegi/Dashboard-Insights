import { db } from "./db";
import {
  workspaces,
  metrics,
  type Workspace,
  type InsertWorkspace,
  type Metric,
  type InsertMetric,
  type DashboardSummary
} from "@shared/schema";
import { eq, and, gte, lte, sum, sql } from "drizzle-orm";

export interface IStorage {
  // Workspaces
  getWorkspaces(): Promise<Workspace[]>;
  getWorkspace(id: number): Promise<Workspace | undefined>;
  createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;

  // Metrics
  getMetrics(workspaceId?: number, startDate?: Date, endDate?: Date): Promise<Metric[]>;
  createMetric(metric: InsertMetric): Promise<Metric>;
  getDashboardSummary(workspaceId?: number): Promise<DashboardSummary>;
  
  // Bulk insert for seeding
  createWorkspaces(workspacesList: InsertWorkspace[]): Promise<Workspace[]>;
  createMetrics(metricsList: InsertMetric[]): Promise<Metric[]>;
}

export class DatabaseStorage implements IStorage {
  async getWorkspaces(): Promise<Workspace[]> {
    return await db.select().from(workspaces).orderBy(workspaces.id);
  }

  async getWorkspace(id: number): Promise<Workspace | undefined> {
    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id));
    return workspace;
  }

  async createWorkspace(workspace: InsertWorkspace): Promise<Workspace> {
    const [newWorkspace] = await db.insert(workspaces).values(workspace).returning();
    return newWorkspace;
  }

  async createWorkspaces(workspacesList: InsertWorkspace[]): Promise<Workspace[]> {
    return await db.insert(workspaces).values(workspacesList).returning();
  }

  async getMetrics(workspaceId?: number, startDate?: Date, endDate?: Date): Promise<Metric[]> {
    const conditions = [];
    if (workspaceId) conditions.push(eq(metrics.workspaceId, workspaceId));
    
    // Simple date filtering if needed, though for this dashboard we mostly dump all data 
    // or filtered by workspace. Timestamps are strings in schema but let's assume valid ISO dates.
    // Ideally we'd use 'date' type and proper comparison.
    
    if (workspaceId) {
      return await db.select().from(metrics)
        .where(eq(metrics.workspaceId, workspaceId))
        .orderBy(metrics.date);
    }
    
    return await db.select().from(metrics).orderBy(metrics.date);
  }

  async createMetric(metric: InsertMetric): Promise<Metric> {
    const [newMetric] = await db.insert(metrics).values(metric).returning();
    return newMetric;
  }

  async createMetrics(metricsList: InsertMetric[]): Promise<Metric[]> {
    return await db.insert(metrics).values(metricsList).returning();
  }

  async getDashboardSummary(workspaceId?: number): Promise<DashboardSummary> {
    const conditions = workspaceId ? [eq(metrics.workspaceId, workspaceId)] : [];
    
    // Calculate aggregates
    // For 'activeBots' and 'totalUsers', these are snapshots. 
    // If we want the "current" total, we should probably take the latest record per workspace.
    // For simplicity in this MVP, we will assume the data seeded is "current" or sum specific columns.
    
    // HOWEVER: 'sessions', 'decommissionedBots', 'ticketsHandled' are additive over time.
    // 'activeBots', 'totalUsers' are status values.
    
    // To get "Total Active Bots", we should sum the LATEST activeBots count from each workspace.
    // To get "Total Sessions", we sum ALL sessions over time.
    
    // Let's implement a smarter query for snapshot values
    
    const snapshotQuery = db.select({
      workspaceId: metrics.workspaceId,
      maxDate: sql`MAX(${metrics.date})`.as('max_date')
    })
    .from(metrics)
    .groupBy(metrics.workspaceId);
    
    if (workspaceId) {
      // If single workspace, just sum/avg
      const result = await db.select({
        totalSessions: sum(metrics.sessions),
        totalDecommissionedBots: sum(metrics.decommissionedBots),
        totalTicketsHandled: sum(metrics.ticketsHandled),
        // For snapshots, we'll just take the average or max for the period to approximate current state 
        // if we don't do complex latest-record logic.
        // Better: let's just fetch the latest record separately.
      })
      .from(metrics)
      .where(eq(metrics.workspaceId, workspaceId));

      // Get latest status
      const latest = await db.select()
        .from(metrics)
        .where(eq(metrics.workspaceId, workspaceId))
        .orderBy(sql`${metrics.date} DESC`)
        .limit(1);

      const latestRecord = latest[0] || { activeBots: 0, totalUsers: 0 };
      const agg = result[0] || { totalSessions: 0, totalDecommissionedBots: 0, totalTicketsHandled: 0 };

      return {
        totalSessions: Number(agg.totalSessions) || 0,
        totalActiveBots: latestRecord.activeBots || 0,
        totalUsers: latestRecord.totalUsers || 0,
        totalDecommissionedBots: Number(agg.totalDecommissionedBots) || 0,
        totalTicketsHandled: Number(agg.totalTicketsHandled) || 0,
      };
    } else {
      // For global view
      // 1. Sum up additive metrics across all time/workspaces
      const aggregates = await db.select({
        totalSessions: sum(metrics.sessions),
        totalDecommissionedBots: sum(metrics.decommissionedBots),
        totalTicketsHandled: sum(metrics.ticketsHandled),
      }).from(metrics);
      
      // 2. Sum up SNAPSHOT metrics (Active Bots, Users) by taking the latest value for EACH workspace
      // This is a bit complex in one query, so we'll do it in code for 9 workspaces (fast enough).
      const allWorkspaces = await this.getWorkspaces();
      let totalActiveBots = 0;
      let totalUsers = 0;

      for (const ws of allWorkspaces) {
        const latest = await db.select()
          .from(metrics)
          .where(eq(metrics.workspaceId, ws.id))
          .orderBy(sql`${metrics.date} DESC`)
          .limit(1);
        
        if (latest.length > 0) {
          totalActiveBots += (latest[0].activeBots || 0);
          totalUsers += (latest[0].totalUsers || 0);
        }
      }

      return {
        totalSessions: Number(aggregates[0].totalSessions) || 0,
        totalActiveBots: totalActiveBots,
        totalUsers: totalUsers,
        totalDecommissionedBots: Number(aggregates[0].totalDecommissionedBots) || 0,
        totalTicketsHandled: Number(aggregates[0].totalTicketsHandled) || 0,
      };
    }
  }
}

export const storage = new DatabaseStorage();
