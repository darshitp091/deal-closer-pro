import { Link } from "react-router-dom";
import { Shield, Lock, FileText } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border py-12 bg-card">
    <div className="container">
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div className="space-y-3">
          <p className="font-display text-lg font-bold text-gradient-gold">Ishwari Socials</p>
          <p className="text-sm text-muted-foreground font-body">
            India's first deal-guarantee agency for physical goods businesses.
          </p>
          <div className="text-xs text-muted-foreground font-body space-y-1 mt-2">
            <p>📧 support@ishwarisocials.co</p>
            <p>📍 Indore, Madhya Pradesh, India</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground font-body">Quick Links</p>
          <div className="space-y-2">
            <a href="#process" className="block text-sm text-muted-foreground hover:text-primary font-body transition-colors">How It Works</a>
            <a href="#pricing" className="block text-sm text-muted-foreground hover:text-primary font-body transition-colors">Pricing</a>
            <a href="#about" className="block text-sm text-muted-foreground hover:text-primary font-body transition-colors">About Us</a>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground font-body">Legal</p>
          <div className="space-y-2">
            <Link to="/refund-policy" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-body transition-colors">
              <Shield size={14} /> Refund Policy
            </Link>
            <Link to="/privacy-policy" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-body transition-colors">
              <Lock size={14} /> Privacy Policy
            </Link>
            <Link to="/terms" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-body transition-colors">
              <FileText size={14} /> Terms & Conditions
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground font-body">
          © {new Date().getFullYear()} Ishwari Socials. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-body">
          <span className="flex items-center gap-1"><Shield size={12} className="text-primary" /> 100% Money-Back Guarantee</span>
          <span>•</span>
          <span>support@ishwarisocials.co</span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
