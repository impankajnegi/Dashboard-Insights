import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Workspaces
  app.get(api.workspaces.list.path, async (req, res) => {
    const list = await storage.getWorkspaces();
    res.json(list);
  });

  app.get(api.workspaces.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const item = await storage.getWorkspace(id);
    if (!item) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    res.json(item);
  });

  // Metrics
  app.get(api.metrics.list.path, async (req, res) => {
    const workspaceId = req.query.workspaceId ? Number(req.query.workspaceId) : undefined;
    const list = await storage.getMetrics(workspaceId);
    res.json(list);
  });

  app.get(api.metrics.summary.path, async (req, res) => {
    const workspaceId = req.query.workspaceId ? Number(req.query.workspaceId) : undefined;
    const summary = await storage.getDashboardSummary(workspaceId);
    res.json(summary);
  });

  return httpServer;
}
