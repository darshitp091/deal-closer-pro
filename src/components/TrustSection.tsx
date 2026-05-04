import { motion } from "framer-motion";
import { ShieldCheck, RefreshCw, Trophy } from "lucide-react";

const TrustSection = () => (
  <section className="py-20 bg-card">
    <div className="container">
      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
        {[
          { icon: ShieldCheck, title: "100% Money-Back", desc: "No deal, no payment. We refund every rupee if we don't deliver." },
          { icon: Trophy, title: "Proven Results", desc: "We only charge for guaranteed outcomes — not promises." },
          { icon: RefreshCw, title: "Zero Risk", desc: "You have nothing to lose. We absorb all the risk so you can grow fearlessly." },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="space-y-3"
          >
            <item.icon size={36} className="text-primary mx-auto" />
            <h3 className="font-display text-lg font-semibold">{item.title}</h3>
            <p className="text-sm text-muted-foreground font-body">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustSection;
