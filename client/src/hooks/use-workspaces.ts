import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useWorkspaces() {
  return useQuery({
    queryKey: [api.workspaces.list.path],
    queryFn: async () => {
      const res = await fetch(api.workspaces.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch workspaces");
      return api.workspaces.list.responses[200].parse(await res.json());
    },
  });
}

export function useWorkspace(id: number | null) {
  return useQuery({
    queryKey: [api.workspaces.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error("ID required");
      const url = buildUrl(api.workspaces.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch workspace");
      return api.workspaces.get.responses[200].parse(await res.json());
    },
  });
}
