interface PaymentEmail {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  planName: string;
  amountInr: number;
  orderId: string;
  paymentId: string;
}

const OWNER_EMAIL = "managingteam@ishwarisocials.co";
const FROM_EMAIL = "Ishwari Socials <managingteam@ishwarisocials.co>";

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (character) => entities[character] ?? character);
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });

  if (!response.ok) {
    console.error("Resend email failed:", response.status, await response.text());
    throw new Error("Resend email delivery failed");
  }
}

export async function sendPaymentEmails(payment: PaymentEmail): Promise<void> {
  const ownerEmail = OWNER_EMAIL;
  const name = escapeHtml(payment.customerName);
  const email = escapeHtml(payment.customerEmail);
  const phone = escapeHtml(payment.customerPhone);
  const plan = escapeHtml(payment.planName);
  const orderId = escapeHtml(payment.orderId);
  const paymentId = escapeHtml(payment.paymentId);
  const amount = payment.amountInr.toLocaleString("en-IN");

  await Promise.all([
    sendEmail(
      payment.customerEmail,
      "Payment successful — Ishwari Socials",
      `<p>Hi ${name},</p><p>We received your payment for the <strong>${plan}</strong> plan.</p><p>Amount: ₹${amount}<br>Payment reference: ${paymentId}<br>Order reference: ${orderId}</p><p>Our team will contact you shortly.</p>`,
    ),
    sendEmail(
      ownerEmail,
      `New payment received — ${payment.planName}`,
      `<p>A new client payment was received.</p><p>Name: ${name}<br>Email: ${email}<br>Phone: ${phone}<br>Plan: ${plan}<br>Amount: ₹${amount}<br>Payment ID: ${paymentId}<br>Order ID: ${orderId}</p>`,
    ),
  ]);
}
