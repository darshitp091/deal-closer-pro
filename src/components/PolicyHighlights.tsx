import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, FileText, Lock, ArrowRight } from "lucide-react";

const PolicyHighlights = () => (
  <section className="py-16 bg-card">
    <div className="container">
      <div className="text-center mb-10">
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">
          Transparent <span className="text-gradient-gold">Policies</span>
        </h2>
        <p className="text-muted-foreground font-body text-sm max-w-lg mx-auto">
          We believe in complete transparency. Read our policies — they're designed to protect you.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[
          {
            icon: Shield,
            title: "Refund Policy",
            highlights: ["48hrs → 100% refund", "1-year deal guarantee", "No deal = money back"],
            link: "/refund-policy",
          },
          {
            icon: Lock,
            title: "Privacy Policy",
            highlights: ["Your data is safe", "No payment info stored", "Full control over your data"],
            link: "/privacy-policy",
          },
          {
            icon: FileText,
            title: "Terms & Conditions",
            highlights: ["Clear service scope", "Transparent pricing", "Fair for both parties"],
            link: "/terms",
          },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-background border border-border rounded-lg p-6 space-y-4"
          >
            <item.icon size={24} className="text-primary" />
            <h3 className="font-display text-lg font-semibold">{item.title}</h3>
            <ul className="space-y-2">
              {item.highlights.map((h) => (
                <li key={h} className="text-sm text-muted-foreground font-body flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
            <Link
              to={item.link}
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-body"
            >
              Read Full Policy <ArrowRight size={14} />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PolicyHighlights;
