import { motion } from "framer-motion";
import { Target, Eye, Heart } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-card">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            About <span className="text-gradient-gold">Ishwari Socials</span>
          </h2>
          <p className="text-muted-foreground font-body max-w-2xl mx-auto">
            We exist because talented manufacturers and suppliers shouldn't struggle to find clients.
            Our mission is to bridge the gap between quality products and eager buyers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              icon: Target,
              title: "Our Mission",
              text: "To empower small and medium businesses selling physical goods by guaranteeing them real, revenue-generating deals — eliminating uncertainty from their growth journey.",
            },
            {
              icon: Eye,
              title: "Our Vision",
              text: "A world where every quality product finds its market — where no great business fails simply because they couldn't reach the right buyers.",
            },
            {
              icon: Heart,
              title: "Why We Exist",
              text: "We saw countless businesses with excellent products but no sales pipeline. We built Ishwari Socials to be the bridge they needed — risk-free.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-background border border-border rounded-lg p-6 shadow-card"
            >
              <item.icon size={28} className="text-primary mb-4" />
              <h3 className="font-display text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center bg-secondary/50 border border-border rounded-lg p-8 max-w-2xl mx-auto"
        >
          <h3 className="font-display text-xl font-semibold mb-3">Our Team</h3>
          <p className="text-sm text-muted-foreground font-body leading-relaxed">
            A passionate team of business strategists, market analysts, and relationship builders
            with deep experience in B2B sales, supply chain management, and client acquisition.
            We leverage data-driven insights and an ever-growing network of industry contacts
            to ensure every deal we promise gets closed.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
