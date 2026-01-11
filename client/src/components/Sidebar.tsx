import { Link, useLocation } from "wouter";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { LayoutDashboard, Database, ServerCrash, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  const { data: workspaces, isLoading } = useWorkspaces();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-card md:flex">
      <div className="flex h-16 items-center px-6 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Database className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">KoreMetrics</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        <div>
          <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Platform
          </h4>
          <nav className="space-y-1">
            <Link href="/" className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              location === "/" 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}>
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </Link>
          </nav>
        </div>

        <div>
          <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Workspaces
          </h4>
          <nav className="space-y-1">
            {isLoading ? (
              <div className="space-y-2 px-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 w-full animate-pulse rounded bg-muted/50" />
                ))}
              </div>
            ) : (
              workspaces?.map((ws) => (
                <Link 
                  key={ws.id} 
                  href={`/workspace/${ws.id}`}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    location === `/workspace/${ws.id}`
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div className="h-2 w-2 rounded-full bg-accent/50" />
                  {ws.name}
                </Link>
              ))
            )}
          </nav>
        </div>
      </div>

      <div className="border-t border-border/50 p-4">
        <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 p-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Team Access</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Admin access managed via KORE.AI platform settings.
          </p>
        </div>
      </div>
    </aside>
  );
}
