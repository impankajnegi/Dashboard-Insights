import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

type MetricsParams = {
  workspaceId?: number;
  startDate?: string;
  endDate?: string;
};

export function useMetrics(params?: MetricsParams) {
  // Create a stable query key based on params
  const queryKey = [api.metrics.list.path, JSON.stringify(params)];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.workspaceId) searchParams.append("workspaceId", params.workspaceId.toString());
      if (params?.startDate) searchParams.append("startDate", params.startDate);
      if (params?.endDate) searchParams.append("endDate", params.endDate);

      const url = `${api.metrics.list.path}?${searchParams.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch metrics");
      return api.metrics.list.responses[200].parse(await res.json());
    },
  });
}

export function useMetricsSummary(workspaceId?: number) {
  const queryKey = [api.metrics.summary.path, workspaceId ? workspaceId : "all"];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (workspaceId) searchParams.append("workspaceId", workspaceId.toString());

      const url = `${api.metrics.summary.path}?${searchParams.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch metrics summary");
      return api.metrics.summary.responses[200].parse(await res.json());
    },
  });
}
