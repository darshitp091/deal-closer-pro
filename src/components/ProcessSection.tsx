import { motion } from "framer-motion";
import { UserPlus, Search, Handshake, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "You Register",
    desc: "Sign up and tell us about your business and products.",
  },
  {
    icon: Search,
    title: "We Analyse",
    desc: "Our team deeply understands your product, market, and ideal buyer profile.",
  },
  {
    icon: Handshake,
    title: "We Connect",
    desc: "We match you with qualified, ready-to-buy clients from our network.",
  },
  {
    icon: CheckCircle,
    title: "Deal Closed",
    desc: "We facilitate the deal closure. You grow — we celebrate together.",
  },
];

const ProcessSection = () => {
  return (
    <section id="process" className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            How It <span className="text-gradient-gold">Works</span>
          </h2>
          <p className="text-muted-foreground font-body max-w-lg mx-auto">
            A simple four-step process designed to get you real results, fast.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative bg-card border border-border rounded-lg p-6 text-center shadow-card hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center mx-auto mb-4">
                <step.icon size={22} className="text-primary-foreground" />
              </div>
              <span className="absolute top-4 right-4 text-xs font-body text-muted-foreground">
                0{i + 1}
              </span>
              <h3 className="font-display text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground font-body">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
