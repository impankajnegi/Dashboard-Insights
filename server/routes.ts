import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { workspaces, metrics } from "@shared/schema";

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

  // Seed Data Endpoint (Auto-run logic usually better, but endpoint helps verify)
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getWorkspaces();
  if (existing.length > 0) return;

  console.log("Seeding database...");

  // 1. Create 9 Workspaces
  const workspaceNames = [
    "North America Sales",
    "Europe Operations",
    "APAC Support",
    "Global HR Bot",
    "IT Helpdesk",
    "Customer Service",
    "Finance Assistant",
    "Legal Compliance",
    "Product Onboarding"
  ];

  const createdWorkspaces = await storage.createWorkspaces(
    workspaceNames.map(name => ({ name }))
  );

  // 2. Generate metrics for last 12 months for each workspace
  const allMetrics = [];
  const today = new Date();
  
  for (const ws of createdWorkspaces) {
    // Random baseline for this workspace
    const baseUsers = Math.floor(Math.random() * 500) + 50; 
    const baseBots = Math.floor(Math.random() * 10) + 1;
    
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const dateStr = d.toISOString().split('T')[0];
      
      // Random variations
      const sessions = Math.floor(Math.random() * 5000) + 1000 + (baseUsers * 10);
      const activeBots = Math.max(0, baseBots + Math.floor(Math.random() * 3) - 1);
      const totalUsers = Math.max(0, baseUsers + Math.floor(Math.random() * 50) - 20);
      const decommissionedBots = Math.random() > 0.8 ? 1 : 0; // Occasional decommission
      const ticketsHandled = Math.floor(sessions * 0.15) + Math.floor(Math.random() * 100);

      allMetrics.push({
        workspaceId: ws.id,
        date: dateStr,
        sessions,
        activeBots,
        totalUsers,
        decommissionedBots,
        ticketsHandled
      });
    }
  }

  await storage.createMetrics(allMetrics);
  console.log("Database seeded with 9 workspaces and 12 months of metrics.");
}
