// Server-side mirror of src/lib/plans.ts.
// Edge functions cannot import from the Vite app, so we duplicate
// the source of truth here. Keep these in sync.

export type PlanId = "starter" | "growth";

export interface ServerPlan {
  id: PlanId;
  name: string;
  priceInr: number;
}

export const SERVER_PLANS: Record<PlanId, ServerPlan> = {
  starter: { id: "starter", name: "Starter", priceInr: 2000 },
  growth: { id: "growth", name: "Growth", priceInr: 3000 },
};

export function getServerPlan(id: string): ServerPlan | null {
  return SERVER_PLANS[id as PlanId] ?? null;
}
