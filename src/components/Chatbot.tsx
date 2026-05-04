import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "bot";
  text: string;
}

const QA: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["what is ishwari", "about ishwari", "tell me about", "who are you", "what do you do"],
    answer:
      "**Ishwari Socials** is India's first deal-guarantee agency for physical goods businesses. We don't just generate leads — we **close actual deals** for you. Think of us as your outsourced business development team, backed by a 100% money-back guarantee. If we don't deliver, you don't pay. It's that simple.",
  },
  {
    keywords: ["vision", "future", "goal", "where do you see"],
    answer:
      "Our vision is bold: **a world where no quality product goes unsold simply because the manufacturer couldn't find the right buyer.** We're building India's largest B2B deal-closing network — connecting thousands of suppliers with verified buyers across every industry. By 2027, we aim to facilitate ₹100 Cr+ in closed deals annually.",
  },
  {
    keywords: ["mission", "purpose", "why exist"],
    answer:
      "Our mission is to **eliminate uncertainty from business growth.** Small and medium manufacturers spend lakhs on marketing with zero guaranteed results. We flip that model — you invest a fraction of that cost, and we guarantee you real, revenue-generating deals. No results = full refund.",
  },
  {
    keywords: ["how do you find", "where do you find", "how do you get clients", "source"],
    answer:
      "We use a **3-layer approach:**\n\n1. **Network Access** — Our proprietary database of 5,000+ verified buyers across India\n2. **Targeted Outreach** — Strategic cold outreach to decision-makers in your target market\n3. **Warm Introductions** — Leveraging our existing relationships for high-conversion connections\n\nThis isn't cold calling. This is precision matchmaking.",
  },
  {
    keywords: ["industry", "industries", "sector", "what type", "which companies", "who can use"],
    answer:
      "We work with **any business selling physical goods:**\n\n• Textiles & Apparel\n• Electronics & Components\n• Machinery & Equipment\n• FMCG & Consumer Goods\n• Agricultural Products\n• Construction Materials\n• Chemicals & Raw Materials\n• Packaging & Printing\n\nIf you make it and sell it — we can find you buyers.",
  },
  {
    keywords: ["guarantee", "how can you guarantee", "how is this possible", "promise"],
    answer:
      "Our guarantee is legally binding and written into your service agreement:\n\n✅ **Starter Plan** — 1 deal guaranteed or 100% refund\n✅ **Growth Plan** — 2 deals guaranteed or 100% refund\n\nWe can offer this because our business model is built on success. We've invested heavily in our buyer network — we already know who's buying. We simply match you with the right buyer. Our closure rate is **above 85%.**",
  },
  {
    keywords: ["no deal", "what if fail", "doesn't work", "if no deal", "no result"],
    answer:
      "Then you get **100% of your money back.** No conditions. No fine print. No questions asked.\n\nWe put this in writing before you pay a single rupee. The risk is entirely on us — and that's exactly how we want it. We only succeed when you do.",
  },
  {
    keywords: ["legit", "trust", "scam", "fraud", "real", "genuine", "fake"],
    answer:
      "We understand the skepticism — the market is full of empty promises. Here's why Ishwari Socials is different:\n\n🔒 **Signed legal agreement** before any payment\n💰 **Money-back guarantee** — in writing, enforceable\n📊 **Transparent reporting** — you see every step of the process\n🤝 **We only earn when you earn** — our model is success-based\n\nWe don't ask you to trust words. We ask you to trust the contract.",
  },
  {
    keywords: ["price", "cost", "pricing", "how much", "plan", "plans", "subscription", "fee"],
    answer:
      "We offer two plans — both with a **100% money-back guarantee:**\n\n**💼 Starter — ₹2,000/year**\n• 1 guaranteed closed deal\n• Client matching & outreach\n• Dedicated support\n• Full refund if undelivered\n\n**🚀 Growth — ₹3,000/year** *(Most Popular)*\n• 2 guaranteed closed deals\n• Priority buyer matching\n• Faster deal closure\n• Dedicated account manager\n• Full refund if undelivered\n\nCompare this to hiring a salesperson at ₹25,000/month with zero guarantees. The ROI speaks for itself.",
  },
  {
    keywords: ["why 2000", "why so cheap", "too cheap", "affordable", "low price", "cheap"],
    answer:
      "Great question. Our pricing is intentionally aggressive because:\n\n1. **We're building market share** — we want thousands of businesses on our platform\n2. **Our cost per deal is low** — we already have the buyer network; matching is efficient\n3. **We monetize volume, not margins** — more clients = more deals = stronger network\n\nThis pricing won't last forever. Early adopters get the best value.",
  },
  {
    keywords: ["included", "what do i get", "features", "benefits", "what's in"],
    answer:
      "Every plan includes:\n\n✅ Dedicated buyer research for your product category\n✅ Targeted outreach to verified buyers\n✅ Warm introductions & deal facilitation\n✅ Negotiation support until closure\n✅ Dedicated support channel\n✅ Progress reporting\n✅ **100% money-back guarantee**\n\nThe Growth plan adds priority matching, faster timelines, and a dedicated account manager.",
  },
  {
    keywords: ["how long", "time", "duration", "fast", "quick", "when will"],
    answer:
      "**Typical timelines:**\n\n• **First qualified introduction:** 7–15 days\n• **First deal closure:** 30–90 days\n• **Growth plan clients** see results up to 40% faster due to priority matching\n\nTimelines depend on your product type, pricing, and target market — but we move fast. Our team starts working on your account within 24 hours of sign-up.",
  },
  {
    keywords: ["how do you connect", "process", "how does it work", "steps", "match"],
    answer:
      "Our process is systematic and proven:\n\n**Step 1 — Onboarding** (Day 1)\nYou share your product details, pricing, and target market.\n\n**Step 2 — Research** (Days 2–7)\nWe identify the best-fit buyers from our network and market research.\n\n**Step 3 — Outreach** (Days 7–21)\nWe make warm introductions and pitch your products to decision-makers.\n\n**Step 4 — Deal Closure** (Days 21–90)\nWe facilitate negotiations, handle objections, and close the deal.\n\nYou focus on your product. We handle the selling.",
  },
  {
    keywords: ["team", "people", "who works", "employees", "staff"],
    answer:
      "Our team consists of:\n\n👤 **B2B Sales Strategists** — 10+ years of experience closing deals across industries\n📊 **Market Research Analysts** — data-driven buyer identification specialists\n🤝 **Relationship Managers** — dedicated points of contact for every client\n📞 **Outreach Specialists** — trained in high-conversion communication\n\nWe're a lean, hungry team that's deeply invested in your success — because our revenue depends on it.",
  },
  {
    keywords: ["expertise", "experience", "qualification", "background"],
    answer:
      "Our founding team brings **25+ combined years** in B2B sales, supply chain management, market analysis, and strategic business development. We've worked across textiles, FMCG, electronics, and manufacturing — and we've closed deals worth crores. That experience is now working for you at a fraction of the cost.",
  },
  {
    keywords: ["agreement", "contract", "legal", "terms", "sign"],
    answer:
      "Yes — we sign a **clear, legally binding service agreement** before you pay anything. It covers:\n\n📄 Guaranteed number of deals\n📄 Subscription period (12 months)\n📄 Refund terms and conditions\n📄 Scope of services\n📄 Reporting obligations\n\nEverything is transparent. You'll know exactly what you're getting and what happens if we don't deliver.",
  },
  {
    keywords: ["refund", "money back", "return", "cancel"],
    answer:
      "**Our refund policy is iron-clad:**\n\nIf we don't close the guaranteed number of deals within your subscription period, you receive a **100% refund.** This is written into your service agreement and is legally enforceable.\n\nNo hidden clauses. No processing fees. No runaround. Just your money back.",
  },
  {
    keywords: ["start", "begin", "register", "sign up", "get started", "join", "apply"],
    answer:
      "Getting started is easy:\n\n1️⃣ Click **\"Get Started\"** or **\"Buy Now\"** on our pricing section\n2️⃣ Fill in your company and product details\n3️⃣ Our team contacts you within **12 hours**\n4️⃣ We sign the agreement and begin working immediately\n\nNo lengthy onboarding. No red tape. Just results.",
  },
  {
    keywords: ["payment", "pay", "upi", "bank", "transaction"],
    answer:
      "We accept all standard payment methods — UPI, bank transfer, and online payment. Payment is collected **only after** you've reviewed and signed the service agreement. Your money is protected by our written guarantee from day one.",
  },
  {
    keywords: ["competitor", "other companies", "alternative", "different from", "why you", "why ishwari"],
    answer:
      "Here's what makes us fundamentally different:\n\n❌ **Lead gen agencies** sell you contacts — no guarantee they'll buy\n❌ **Marketing agencies** charge lakhs — no guarantee of ROI\n❌ **Freelancers** disappear — no accountability\n\n✅ **Ishwari Socials** guarantees **closed deals** — or your money back\n\nWe don't sell promises. We sell results. That's the difference.",
  },
  {
    keywords: ["deal size", "how big", "value of deal", "minimum order"],
    answer:
      "We don't restrict deal sizes — whether it's a ₹50,000 order or a ₹50 lakh contract, we work to close whatever makes business sense for you and the buyer. Our focus is on **quality matches** that lead to long-term business relationships, not one-time transactions.",
  },
  {
    keywords: ["location", "where", "city", "based", "office"],
    answer:
      "We operate **pan-India** with a digital-first approach. Our buyer network spans across major commercial hubs — Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Ahmedabad, and beyond. No matter where you're based, we can connect you with buyers in your target geography.",
  },
  {
    keywords: ["renew", "renewal", "next year", "after 1 year", "extend"],
    answer:
      "After your 12-month subscription, you can renew at the same rate or upgrade your plan. Many of our clients upgrade to the Growth plan after seeing results from the Starter plan. We also offer **loyalty benefits** for returning clients — because long-term partnerships are what we're built for.",
  },
  {
    keywords: ["multiple products", "more than one", "range", "catalog"],
    answer:
      "Absolutely. If you sell multiple product categories, we can work across your entire catalog. Each guaranteed deal may cover a different product line — we match based on what buyers are actively looking for. The more products you offer, the more opportunities we can create.",
  },
  {
    keywords: ["help us", "help me", "help my", "how will you help", "how can you help", "how would you help", "what can you do for", "help grow", "grow my business", "grow our business", "help us grow", "business grow"],
    answer:
      "Here's exactly how **Ishwari Socials** helps your business grow:\n\n🎯 **We find real buyers** — not leads, not contacts — actual buyers ready to purchase your products\n📞 **We handle outreach** — our team contacts decision-makers on your behalf using our 5,000+ buyer network\n🤝 **We close deals** — we don't stop at introductions; we facilitate negotiations until the deal is signed\n💰 **Zero risk** — if we don't deliver, you get 100% of your money back\n\n**Your only job?** Make a great product. We handle the selling.\n\nWith plans starting at just ₹2,000/year, you get a dedicated business development team at a fraction of the cost of hiring one. Ready to get started?",
  },
  {
    keywords: ["why should i", "why choose", "convince me", "why pay", "why invest", "worth it"],
    answer:
      "Let me put it simply:\n\n💡 **Hiring a salesperson** = ₹25,000+/month, zero guarantees\n💡 **Marketing agency** = ₹50,000+/month, zero guarantees\n💡 **Ishwari Socials** = ₹2,000/year, **guaranteed deals or full refund**\n\nWe've built a network of 5,000+ verified buyers. We already know who's buying what. We simply match your product to the right buyer and close the deal.\n\n**The real question is: why would you NOT try it?** There's literally zero risk.",
  },
  {
    keywords: ["what if i have questions", "more info", "tell me more", "explain more", "know more"],
    answer:
      "I'm here to answer everything! Here are some popular topics:\n\n• **How we work** — our proven 4-step process\n• **Pricing** — plans starting at ₹2,000/year\n• **Guarantee** — 100% money-back if we don't deliver\n• **Industries** — we work with all physical goods businesses\n• **Timeline** — first introductions within 7-15 days\n\nJust ask me anything, or click **\"Get Started\"** to have our team reach out to you within 12 hours!",
  },
  {
    keywords: ["hello", "hi", "hey", "good morning", "good evening", "namaste"],
    answer:
      "Hello! 👋 Welcome to **Ishwari Socials** — India's first deal-guarantee agency for physical goods businesses.\n\nI can help you with:\n• How our service works\n• Pricing & plans\n• Our money-back guarantee\n• Getting started\n\nWhat would you like to know?",
  },
  {
    keywords: ["thank", "thanks", "great", "awesome", "helpful"],
    answer:
      "You're welcome! 😊 We're here to help you grow your business with **zero risk.** If you have more questions or you're ready to get started, just let me know. Your first deal is one click away!",
  },
];

function findAnswer(input: string): string {
  const lower = input.toLowerCase().trim();

  for (const qa of QA) {
    for (const kw of qa.keywords) {
      if (lower.includes(kw) || kw.includes(lower)) {
        return qa.answer;
      }
    }
  }

  return "That's a great question — and I want to make sure you get the best answer.\n\nHere's what I'd suggest:\n\n1️⃣ **Fill out our contact form** — our team responds within 12 hours\n2️⃣ **Or ask me about:** pricing, our guarantee, how we find clients, or how to get started\n\nWe're here to help you grow — with **zero risk** and **guaranteed results.**";
}

const SUGGESTIONS = [
  "How does the guarantee work?",
  "What are your pricing plans?",
  "How do you find buyers?",
  "What's your vision?",
];

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi! 👋 I'm the **Ishwari Socials** assistant.\n\nWe guarantee real deals for businesses selling physical goods — or your money back.\n\nAsk me anything, or pick a topic below!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setMessages((p) => [...p, { role: "user", text: msg }]);
    setInput("");
    setIsTyping(true);
    setTimeout(async () => {
      const botResponse = findAnswer(msg);
      setIsTyping(false);
      setMessages((p) => [...p, { role: "bot", text: botResponse }]);

      // Log to database (fire and forget)
      await supabase.from("chat_logs").insert({
        user_message: msg,
        bot_response: botResponse,
      });
    }, 800);
  };

  const renderText = (text: string) => {
    // Simple markdown-like rendering for bold
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold hover:scale-105 transition-transform"
        aria-label="Toggle chat"
      >
        {open ? (
          <X size={24} className="text-primary-foreground" />
        ) : (
          <MessageCircle size={24} className="text-primary-foreground" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-xl shadow-card flex flex-col overflow-hidden"
            style={{ height: "520px" }}
          >
            {/* Header */}
            <div className="bg-gradient-gold px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Bot size={18} className="text-primary-foreground" />
              </div>
              <div>
                <h4 className="font-display font-semibold text-primary-foreground text-sm">
                  Ishwari Socials
                </h4>
                <p className="text-xs text-primary-foreground/70 font-body flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  Online — Ask us anything
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2.5 text-sm font-body whitespace-pre-line leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-secondary text-secondary-foreground rounded-bl-sm"
                    }`}
                  >
                    {renderText(m.text)}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-secondary-foreground rounded-lg rounded-bl-sm px-4 py-3 text-sm">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>
                </div>
              )}

              {/* Suggestion chips after first message */}
              {messages.length === 1 && !isTyping && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="text-xs font-body px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a question..."
                className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              />
              <Button variant="gold" size="icon" onClick={() => handleSend()}>
                <Send size={16} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
