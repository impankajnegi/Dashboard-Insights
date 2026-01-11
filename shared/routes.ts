import { z } from 'zod';
import { insertWorkspaceSchema, insertMetricSchema, workspaces, metrics } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  workspaces: {
    list: {
      method: 'GET' as const,
      path: '/api/workspaces',
      responses: {
        200: z.array(z.custom<typeof workspaces.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/workspaces/:id',
      responses: {
        200: z.custom<typeof workspaces.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  metrics: {
    list: {
      method: 'GET' as const,
      path: '/api/metrics',
      input: z.object({
        workspaceId: z.coerce.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof metrics.$inferSelect>()),
      },
    },
    summary: {
      method: 'GET' as const,
      path: '/api/metrics/summary',
      input: z.object({
        workspaceId: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.object({
          totalSessions: z.number(),
          totalActiveBots: z.number(),
          totalUsers: z.number(),
          totalDecommissionedBots: z.number(),
          totalTicketsHandled: z.number(),
        }),
      },
    },
  },
};

// ============================================
// HELPERS
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPES
// ============================================
export type WorkspaceResponse = z.infer<typeof api.workspaces.list.responses[200]>;
export type MetricsListResponse = z.infer<typeof api.metrics.list.responses[200]>;
export type SummaryResponse = z.infer<typeof api.metrics.summary.responses[200]>;
