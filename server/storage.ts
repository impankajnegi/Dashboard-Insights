import {
  type Workspace,
  type Metric,
  type DashboardSummary
} from "@shared/schema";
import fs from "fs/promises";
import path from "path";

interface WorkspaceWithMetrics extends Workspace {
  metrics: Metric[];
}

export interface IStorage {
  getWorkspaces(): Promise<Workspace[]>;
  getWorkspace(id: number): Promise<Workspace | undefined>;
  getMetrics(workspaceId?: number): Promise<Metric[]>;
  getDashboardSummary(workspaceId?: number): Promise<DashboardSummary>;
}

export class JsonStorage implements IStorage {
  private dataPath = path.join(process.cwd(), "server", "data.json");

  private async readData(): Promise<WorkspaceWithMetrics[]> {
    const content = await fs.readFile(this.dataPath, "utf-8");
    return JSON.parse(content);
  }

  async getWorkspaces(): Promise<Workspace[]> {
    const data = await this.readData();
    return data.map(({ id, name }) => ({ id, name, createdAt: new Date() }));
  }

  async getWorkspace(id: number): Promise<Workspace | undefined> {
    const data = await this.readData();
    const ws = data.find(w => w.id === id);
    if (!ws) return undefined;
    return { id: ws.id, name: ws.name, createdAt: new Date() };
  }

  async getMetrics(workspaceId?: number): Promise<Metric[]> {
    const data = await this.readData();
    if (workspaceId) {
      const ws = data.find(w => w.id === workspaceId);
      return ws ? ws.metrics.map((m, i) => ({ ...m, id: i, workspaceId })) : [];
    }
    return data.flatMap(ws => ws.metrics.map((m, i) => ({ ...m, id: i, workspaceId: ws.id })));
  }

  async getDashboardSummary(workspaceId?: number): Promise<DashboardSummary> {
    const allMetrics = await this.getMetrics(workspaceId);
    const data = await this.readData();

    let totalSessions = 0;
    let totalDecommissionedBots = 0;
    let totalTicketsHandled = 0;
    
    allMetrics.forEach(m => {
      totalSessions += (m.sessions || 0);
      totalDecommissionedBots += (m.decommissionedBots || 0);
      totalTicketsHandled += (m.ticketsHandled || 0);
    });

    let totalActiveBots = 0;
    let totalUsers = 0;

    if (workspaceId) {
      const ws = data.find(w => w.id === workspaceId);
      if (ws && ws.metrics.length > 0) {
        const latest = ws.metrics[ws.metrics.length - 1];
        totalActiveBots = latest.activeBots || 0;
        totalUsers = latest.totalUsers || 0;
      }
    } else {
      data.forEach(ws => {
        if (ws.metrics.length > 0) {
          const latest = ws.metrics[ws.metrics.length - 1];
          totalActiveBots += (latest.activeBots || 0);
          totalUsers += (latest.totalUsers || 0);
        }
      });
    }

    return {
      totalSessions,
      totalActiveBots,
      totalUsers,
      totalDecommissionedBots,
      totalTicketsHandled
    };
  }
}

export const storage = new JsonStorage();
