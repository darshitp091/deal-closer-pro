export type PlanId = "starter" | "growth";

export interface Plan {
  id: PlanId;
  name: string;
  priceInr: number;
  deals: number;
  popular: boolean;
  features: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: "starter",
    name: "Starter",
    priceInr: 2000,
    deals: 1,
    popular: false,
    features: [
      "1 guaranteed client deal",
      "Client matching & outreach",
      "Dedicated support",
      "100% money-back guarantee",
    ],
  },
  growth: {
    id: "growth",
    name: "Growth",
    priceInr: 3000,
    deals: 2,
    popular: true,
    features: [
      "2 guaranteed client deals",
      "Priority client matching",
      "Faster deal closure",
      "Dedicated account manager",
      "100% money-back guarantee",
    ],
  },
};

export const PLAN_LIST: Plan[] = [PLANS.starter, PLANS.growth];

export function getPlan(id: string): Plan | undefined {
  return PLANS[id as PlanId];
}

export function priceToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}
