import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Star, ArrowRight } from "lucide-react";
import { PLAN_LIST, type Plan, type PlanId } from "@/lib/plans";

interface PlanCardProps {
  plan: Plan;
  onBuy: (id: PlanId) => void;
}

function PlanCard({ plan, onBuy }: PlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative bg-card border rounded-xl p-8 shadow-card flex flex-col ${
        plan.popular ? "border-primary animate-pulse-gold" : "border-border"
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-gold text-primary-foreground text-xs font-body font-semibold px-4 py-1 rounded-full flex items-center gap-1">
          <Star size={12} /> Most Popular
        </div>
      )}
      <h3 className="font-display text-xl font-semibold mb-1">{plan.name}</h3>
      <p className="text-sm text-muted-foreground font-body mb-6">
        {plan.deals} Guaranteed Deal{plan.deals > 1 ? "s" : ""}
      </p>
      <div className="mb-6">
        <span className="font-display text-4xl font-bold text-gradient-gold">
          ₹{plan.priceInr.toLocaleString("en-IN")}
        </span>
        <span className="text-muted-foreground text-sm font-body">/year</span>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm font-body text-foreground">
            <Check size={16} className="text-primary mt-0.5 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Button
        variant={plan.popular ? "gold" : "goldOutline"}
        size="lg"
        className="w-full"
        onClick={() => onBuy(plan.id)}
      >
        Buy Now <ArrowRight size={16} />
      </Button>
    </motion.div>
  );
}

interface PricingSectionProps {
  onBuy: (id: PlanId) => void;
}

export default function PricingSection({ onBuy }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Simple, <span className="text-gradient-gold">Transparent</span> Pricing
          </h2>
          <p className="text-muted-foreground font-body max-w-lg mx-auto">
            No hidden fees. No surprises. Pay only for guaranteed results — or get your money back.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {PLAN_LIST.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onBuy={onBuy} />
          ))}
        </div>
      </div>
    </section>
  );
}
