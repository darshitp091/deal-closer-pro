import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function PaymentSuccess() {
  useEffect(() => {
    const verify = async () => {
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get("order_id");

      const res = await fetch("YOUR_VERIFY_FUNCTION", {
        method: "POST",
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (data.success) {
        await supabase
          .from("orders")
          .update({ status: "paid" })
          .eq("order_id", orderId);

        console.log("Payment success");
      }
    };

    verify();
  }, []);

  return <h1>Processing payment...</h1>;
}