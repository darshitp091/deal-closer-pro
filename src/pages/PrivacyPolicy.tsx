import { Link } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background text-foreground">
    <div className="container max-w-3xl py-16 px-4">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Lock size={28} className="text-primary" />
        <h1 className="font-display text-3xl font-bold">Privacy Policy</h1>
      </div>
      <p className="text-muted-foreground font-body mb-10">Last updated: April 2026</p>

      <div className="space-y-8 font-body text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">Information We Collect</h2>
          <p className="mb-3">We collect the following information when you use our services:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-foreground">Personal Information:</strong> Name, email address, phone number, company name</li>
            <li><strong className="text-foreground">Business Information:</strong> Product type, target market, pricing details</li>
            <li><strong className="text-foreground">Chat Data:</strong> Messages exchanged with our chatbot for service improvement</li>
            <li><strong className="text-foreground">Usage Data:</strong> Pages visited, features used, and interaction patterns</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To provide our deal-closing services and match you with buyers</li>
            <li>To communicate service updates, progress reports, and deal opportunities</li>
            <li>To improve our platform, processes, and buyer-matching algorithms</li>
            <li>To send relevant business communications (you can opt out anytime)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">Payment Information</h2>
          <p>All payments are processed through our secure payment provider (Cashfree). We <strong className="text-foreground">do not store</strong> your credit card numbers, bank account details, or UPI IDs on our servers. Payment processing is handled entirely by our PCI-DSS compliant payment partner.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">Advertising & Analytics</h2>
          <p>We may use third-party services like Google Analytics and Meta Pixel to understand website traffic and improve our marketing. These services may use cookies to track your browsing behavior. You can manage cookie preferences through your browser settings.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">Your Rights</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-foreground">Access:</strong> Request a copy of all personal data we hold about you</li>
            <li><strong className="text-foreground">Correction:</strong> Request correction of inaccurate information</li>
            <li><strong className="text-foreground">Deletion:</strong> Request deletion of your personal data (subject to legal obligations)</li>
            <li><strong className="text-foreground">Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">Data Security</h2>
          <p>We implement industry-standard security measures including encryption, secure servers, and access controls to protect your information. However, no method of electronic transmission is 100% secure, and we cannot guarantee absolute security.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">Contact Us</h2>
          <p>For any privacy-related questions or requests:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong className="text-foreground">Email:</strong> <span className="text-primary"> support@ishwarisocials.co</span></li>
            <li><strong className="text-foreground">Address:</strong> Ishwari Socials, Indore, Madhya Pradesh, India</li>
          </ul>
        </section>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
