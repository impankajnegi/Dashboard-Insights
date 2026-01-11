import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from "recharts";
import { format, parseISO } from "date-fns";

const CHART_COLORS = [
  "hsl(221 83% 53%)", // Primary
  "hsl(262 83% 58%)", // Accent
  "hsl(190 90% 50%)", // Cyan
  "hsl(340 75% 60%)", // Pink
  "hsl(45 90% 60%)",  // Yellow
];

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
        <p className="font-medium text-sm mb-2">{label}</p>
        {payload.map((p: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span>{p.name}:</span>
            <span className="font-semibold text-foreground">{p.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- Monthly Session Trends (Line Chart) ---
interface SessionTrendsProps {
  data: any[];
}

export function SessionTrendsChart({ data }: SessionTrendsProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
          <XAxis 
            dataKey="date" 
            tickFormatter={(str) => format(parseISO(str), 'MMM')}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="sessions" 
            name="Sessions"
            stroke="hsl(var(--primary))" 
            strokeWidth={3}
            dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// --- Decommissioned Bots (Bar Chart) ---
interface DecommissionedBotsProps {
  data: any[];
}

export function DecommissionedBotsChart({ data }: DecommissionedBotsProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
          <XAxis 
            dataKey="quarter" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            dx={-10}
          />
          <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.2)' }} content={<CustomTooltip />} />
          <Bar 
            dataKey="count" 
            name="Decommissioned"
            fill="hsl(var(--destructive))" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// --- Tickets Handled (Area Chart) ---
interface TicketsTrendProps {
  data: any[];
}

export function TicketsTrendChart({ data }: TicketsTrendProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
          <XAxis 
            dataKey="date" 
            tickFormatter={(str) => format(parseISO(str), 'MMM')}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="tickets" 
            name="Tickets"
            stroke="hsl(var(--accent))" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorTickets)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// --- Active Bots by Workspace (Horizontal Bar Chart) ---
interface ActiveBotsChartProps {
  data: any[];
}

export function ActiveBotsChart({ data }: ActiveBotsChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          layout="vertical"
          margin={{ top: 5, right: 20, bottom: 5, left: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.2} />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false}
            tickLine={false}
            width={100}
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
          />
          <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.2)' }} content={<CustomTooltip />} />
          <Bar 
            dataKey="activeBots" 
            name="Active Bots"
            fill="hsl(var(--primary))" 
            radius={[0, 4, 4, 0]} 
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
