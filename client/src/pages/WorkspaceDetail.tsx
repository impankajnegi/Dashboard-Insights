import { useRoute } from "wouter";
import { useWorkspace } from "@/hooks/use-workspaces";
import { useMetrics, useMetricsSummary } from "@/hooks/use-metrics";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { SessionTrendsChart, TicketsTrendChart } from "@/components/Charts";
import { Bot, Users, TicketCheck, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function WorkspaceDetail() {
  const [, params] = useRoute("/workspace/:id");
  const id = params ? parseInt(params.id) : null;

  const { data: workspace, isLoading: isLoadingWorkspace } = useWorkspace(id);
  const { data: metricsList, isLoading: isLoadingMetrics } = useMetrics({ workspaceId: id ?? undefined });
  const { data: summary, isLoading: isLoadingSummary } = useMetricsSummary(id ?? undefined);

  if (!id) return <div>Invalid ID</div>;

  // Process specific charts
  const sessionData = metricsList?.map(m => ({
    date: m.date,
    sessions: m.sessions
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  const ticketsData = metricsList?.map(m => ({
    date: m.date,
    tickets: m.ticketsHandled
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  if (isLoadingWorkspace) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center flex-col gap-4">
        <h2 className="text-xl font-bold">Workspace not found</h2>
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 md:pl-64">
        <div className="container mx-auto p-4 md:p-8 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Overview
            </Link>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">{workspace.name}</h1>
                <p className="text-muted-foreground">Workspace performance and metrics.</p>
              </div>
              <div className="hidden md:block">
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  Active Status
                </span>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard 
              title="Active Bots" 
              value={summary?.totalActiveBots ?? 0}
              icon={Bot}
              isLoading={isLoadingSummary}
            />
            <StatCard 
              title="Total Users" 
              value={summary?.totalUsers.toLocaleString() ?? 0}
              icon={Users}
              isLoading={isLoadingSummary}
            />
            <StatCard 
              title="Tickets Handled" 
              value={summary?.totalTicketsHandled.toLocaleString() ?? 0}
              icon={TicketCheck}
              isLoading={isLoadingSummary}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-6">
             <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground text-lg">Monthly Sessions</h3>
                <div className="text-sm text-muted-foreground">Last 12 months</div>
              </div>
              <SessionTrendsChart data={sessionData} />
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-semibold text-foreground text-lg">Ticket Volume</h3>
                 <div className="text-sm text-muted-foreground">Historical Trend</div>
              </div>
              <TicketsTrendChart data={ticketsData} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
