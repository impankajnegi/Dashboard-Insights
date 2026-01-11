import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
  isLoading?: boolean;
}

export function StatCard({ title, value, icon: Icon, description, trend, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <Card className="border-none shadow-md shadow-black/5 bg-card/50 backdrop-blur-sm animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-4 w-4 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-16 bg-muted rounded mb-2" />
          <div className="h-3 w-32 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold font-display">{value}</div>
          {trend && (
            <span className={`text-xs font-medium ${trend.value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
