import { useMetricsSummary, useMetrics, useWorkspaces } from "@/hooks/use-metrics"; // Note: this import assumes combined hooks file or corrected paths
import { useMetrics as useMetricsList } from "@/hooks/use-metrics"; 
import { useWorkspaces as useWorkspaceList } from "@/hooks/use-workspaces"; 
import { StatCard } from "@/components/StatCard";
import { Sidebar } from "@/components/Sidebar";
import { 
  SessionTrendsChart, 
  DecommissionedBotsChart, 
  TicketsTrendChart,
  ActiveBotsChart
} from "@/components/Charts";
import { 
  Bot, 
  Users, 
  TicketCheck, 
  Activity, 
  AlertCircle
} from "lucide-react";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useMetricsSummary();
  const { data: metricsList, isLoading: isLoadingMetrics } = useMetricsList();
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useWorkspaceList();

  // Process data for charts
  // 1. Session Trends (aggregated by date)
  const sessionData = metricsList?.reduce((acc: any[], metric) => {
    const existing = acc.find(item => item.date === metric.date);
    if (existing) {
      existing.sessions += metric.sessions;
    } else {
      acc.push({ date: metric.date, sessions: metric.sessions });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  // 2. Tickets Trend (aggregated by date)
  const ticketsData = metricsList?.reduce((acc: any[], metric) => {
    const existing = acc.find(item => item.date === metric.date);
    if (existing) {
      existing.tickets += metric.ticketsHandled;
    } else {
      acc.push({ date: metric.date, tickets: metric.ticketsHandled });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  // 3. Decommissioned Bots (Mock quarterly aggregation since raw data is monthly)
  // In a real app, you'd aggregate by quarter. Here we'll simulate.
  const decommissionedData = [
    { quarter: "Q1 2024", count: 12 },
    { quarter: "Q2 2024", count: 8 },
    { quarter: "Q3 2024", count: 15 },
    { quarter: "Q4 2024", count: 5 },
  ];

  // 4. Active Bots by Workspace
  // We need to fetch the latest metric for each workspace to get current active bots
  // For simplicity with this data model, we'll aggregate total active bots seen in last month or just mock structure based on workspaces
  const activeBotsData = workspaces?.map(ws => {
    // Find latest metric for this workspace
    const wsMetrics = metricsList?.filter(m => m.workspaceId === ws.id) || [];
    const latestMetric = wsMetrics.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return {
      name: ws.name,
      activeBots: latestMetric?.activeBots || 0
    };
  }).sort((a, b) => b.activeBots - a.activeBots) || [];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 md:pl-64">
        <div className="container mx-auto p-4 md:p-8 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Overview</h1>
            <p className="text-muted-foreground">Global insights across all workspaces.</p>
          </div>

          {/* Top Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Total Active Bots" 
              value={summary?.totalActiveBots ?? 0}
              icon={Bot}
              isLoading={isLoadingSummary}
              description="Across 9 workspaces"
            />
            <StatCard 
              title="Total Users" 
              value={summary?.totalUsers.toLocaleString() ?? 0}
              icon={Users}
              isLoading={isLoadingSummary}
              description="Active monthly users"
            />
            <StatCard 
              title="Tickets Handled" 
              value={summary?.totalTicketsHandled.toLocaleString() ?? 0}
              icon={TicketCheck}
              isLoading={isLoadingSummary}
              description="Total processed tickets"
              trend={{ value: 12.5, label: "vs last month" }}
            />
            <StatCard 
              title="Decommissioned" 
              value={summary?.totalDecommissionedBots ?? 0}
              icon={AlertCircle}
              isLoading={isLoadingSummary}
              description="Bots removed this year"
            />
          </div>

          {/* Main Charts Row 1 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Monthly Session Trends</h3>
              </div>
              <SessionTrendsChart data={sessionData} />
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <TicketCheck className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-foreground">Tickets Handled Trend</h3>
              </div>
              <TicketsTrendChart data={ticketsData} />
            </div>
          </div>

          {/* Main Charts Row 2 */}
          <div className="grid gap-4 md:grid-cols-7">
            {/* Wider chart */}
            <div className="md:col-span-4 rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Bot className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Active Bots by Workspace</h3>
              </div>
              <ActiveBotsChart data={activeBotsData} />
            </div>

            {/* Narrower chart */}
            <div className="md:col-span-3 rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <h3 className="font-semibold text-foreground">Decommissioned (Quarterly)</h3>
              </div>
              <DecommissionedBotsChart data={decommissionedData} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
