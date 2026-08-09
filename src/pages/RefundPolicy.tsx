import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

const RefundPolicy = () => (
  <div className="min-h-screen bg-background text-foreground">
    <div className="container max-w-3xl py-16 px-4">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Shield size={28} className="text-primary" />
        <h1 className="font-display text-3xl font-bold">Refund Policy</h1>
      </div>
      <p className="text-muted-foreground font-body mb-10">Last updated: April 2026</p>

      <div className="space-y-8 font-body text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">Our Commitment</h2>
          <p>At Ishwari Socials, we believe in earning your trust through results. Our refund policy is designed to be fair, transparent, and entirely in your favor.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">Standard Refund Windows</h2>
          <div className="space-y-3">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-foreground font-semibold">Within 48 Hours → 100% Refund</p>
              <p>Changed your mind? No problem. Request a full refund within 48 hours of payment — no questions asked.</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-foreground font-semibold">Within 7 Days → 50% Refund</p>
              <p>If you cancel within 7 days, we'll refund 50% of your payment. By this time, our team has already begun working on your account.</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-foreground font-semibold">After 14 Days → No Standard Refund</p>
              <p>After 14 days, standard refunds are not available as significant work has been initiated on your behalf.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">1-Year Deal Guarantee</h2>
          <p className="mb-3">This is our core promise: <span className="text-foreground font-semibold">If we don't close the guaranteed number of deals within your 12-month subscription period, you receive a full refund.</span></p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-foreground">Starter Plan (₹2,000):</strong> 1 guaranteed deal — or 100% refund</li>
            <li><strong className="text-foreground">Growth Plan (₹3,000):</strong> 2 guaranteed deals — or 100% refund</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">Conditions for Guarantee Refund</h2>
          <p className="mb-3">The 1-year guarantee refund requires:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-foreground">Client cooperation:</strong> You must respond to our communications within reasonable timeframes and participate in the deal process.</li>
            <li><strong className="text-foreground">Accurate information:</strong> Product details, pricing, and business information provided must be truthful and accurate.</li>
            <li><strong className="text-foreground">Reasonable pricing:</strong> Your product pricing must be competitive and reasonable for the market.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">Non-Refundable Cases</h2>
          <p className="mb-3">Refunds will <strong className="text-foreground">not</strong> be issued if:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>You fail to cooperate or respond to our team's communications</li>
            <li>Your product quality or pricing makes deals commercially unviable</li>
            <li>False or misleading information was provided during onboarding</li>
            <li>You reject deals that meet the agreed-upon criteria</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">How to Request a Refund</h2>
          <p>Email us at <span className="text-primary"> support@ishwarisocials.co</span> with your registered email address and reason for refund. We process all refund requests within 7 business days.</p>
          <p className="mt-2"><strong className="text-foreground">Address:</strong> Ishwari Socials, Indore, Madhya Pradesh, India</p>
        </section>
      </div>
    </div>
  </div>
);

export default RefundPolicy;
