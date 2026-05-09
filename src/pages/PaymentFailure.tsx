import { Link, useSearchParams } from "react-router-dom";
import { XCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentFailure() {
  const [params] = useSearchParams();
  const orderId = params.get("order");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center space-y-4">
        <XCircle size={56} className="text-destructive mx-auto" />
        <h1 className="font-display text-2xl font-bold">Payment didn't go through</h1>
        <p className="text-sm text-muted-foreground">
          No money has been deducted. You can try again, or contact support
          if you were charged.
        </p>

        {orderId && (
          <p className="text-xs text-muted-foreground">
            Reference: <span className="font-mono">{orderId}</span>
          </p>
        )}

        <div className="flex gap-2">
          <Button variant="goldOutline" asChild className="flex-1">
            <Link to="/#pricing">Try again</Link>
          </Button>
          <Button variant="gold" asChild className="flex-1">
            <Link to="/">
              <Home size={16} /> Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
