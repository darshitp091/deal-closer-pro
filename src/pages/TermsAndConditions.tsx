import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

const TermsAndConditions = () => (
  <div className="min-h-screen bg-background text-foreground">
    <div className="container max-w-3xl py-16 px-4">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <FileText size={28} className="text-primary" />
        <h1 className="font-display text-3xl font-bold">Terms & Conditions</h1>
      </div>
      <p className="text-muted-foreground font-body mb-10">Last updated: April 2026</p>

      <div className="space-y-8 font-body text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">1. Service Description</h2>
          <p>Ishwari Socials provides deal-closing support services for businesses selling physical goods. Our service includes buyer identification, outreach, introduction facilitation, and deal closure assistance. We act as an intermediary to connect sellers with qualified buyers.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">2. Payment Terms</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-foreground">Starter Plan:</strong> ₹2,000 per year — includes 1 guaranteed deal</li>
            <li><strong className="text-foreground">Growth Plan:</strong> ₹3,000 per year — includes 2 guaranteed deals</li>
            <li>Payment is required upfront before services begin</li>
            <li>All prices are in Indian Rupees (INR) and inclusive of applicable taxes</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">3. Deal Guarantee</h2>
          <p className="mb-3">Our guarantee is subject to the following conditions:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>The guarantee applies within the 12-month subscription period only</li>
            <li>Client must actively cooperate with our team throughout the process</li>
            <li>All business information provided must be accurate and truthful</li>
            <li>Product pricing must be reasonable and competitive for the target market</li>
            <li>Without client cooperation, the guarantee is void</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">4. Client Obligations</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Provide accurate product information, pricing, and business details</li>
            <li>Respond to our communications within 48 hours</li>
            <li>Participate in buyer meetings and negotiations as needed</li>
            <li>Maintain product quality and fulfill orders resulting from closed deals</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">5. Limitation of Liability</h2>
          <p className="mb-3">Ishwari Socials shall not be liable for:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Any indirect, incidental, or consequential business losses</li>
            <li>Loss of profits, revenue, or business opportunities beyond the subscription fee</li>
            <li>Issues arising from the quality of products or services provided by the client</li>
            <li>Delays or failures caused by third-party services or force majeure events</li>
          </ul>
          <p className="mt-3">Our maximum liability is limited to the subscription fee paid by the client.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">6. Termination</h2>
          <p className="mb-3">We reserve the right to terminate services if:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>The client provides false or misleading information</li>
            <li>The client engages in illegal or unethical business practices</li>
            <li>The client harasses our team members or buyers</li>
            <li>The client misuses our platform or services</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">7. Intellectual Property</h2>
          <p>All content, branding, and proprietary methods used by Ishwari Socials remain our intellectual property. Clients may not copy, distribute, or reverse-engineer our buyer-matching systems or processes.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">8. Governing Law</h2>
          <p>These terms are governed by the laws of India. Any disputes shall be resolved through arbitration in accordance with the Arbitration and Conciliation Act, 1996.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">9. Contact</h2>
          <p>For questions about these terms:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong className="text-foreground">Email:</strong> <span className="text-primary"> support@ishwarisocials.co</span></li>
            <li><strong className="text-foreground">Address:</strong> Ishwari Socials, Indore, Madhya Pradesh, India</li>
          </ul>
        </section>
      </div>
    </div>
  </div>
);

export default TermsAndConditions;
