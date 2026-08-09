import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap } from "lucide-react";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-secondary rounded-full px-4 py-1.5 text-xs font-body text-primary border border-primary/20"
          >
            <Shield size={14} />
            100% Money-Back Guarantee
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
          >
            We <span className="text-gradient-gold">Close Deals</span> for
            <br />Your Business — Guaranteed
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-muted-foreground font-body max-w-xl mx-auto"
          >
            We connect companies selling physical goods with ready-to-buy clients.
            No deal? Full refund. It's that simple.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button variant="gold" size="lg" className="text-base px-8" asChild>
              <a href="#pricing">
                Get Your First Deal <ArrowRight size={18} />
              </a>
            </Button>
            <Button variant="goldOutline" size="lg" className="text-base px-8" asChild>
              <a href="#process">How It Works</a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-muted-foreground font-body"
          >
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-primary" />
              Guaranteed Deals
            </div>
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-primary" />
              Money-Back Promise
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-primary" />
              Zero Risk
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
