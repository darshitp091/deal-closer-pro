import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Process", href: "#process" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "#contact" },
  ];

  return (
   <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
  <div className="container flex items-center justify-between h-16">

    {/* LOGO SECTION */}
    <a href="#home" className="flex items-center gap-2">
      <img
        src="/ishwari_logo.jpeg"
        alt="Ishwari Logo"
        className="h-8 w-8 object-contain"
      />
      <span className="font-display text-lg font-bold text-gradient-gold">
        Ishwari Socials
      </span>
    </a>

    {/* Desktop */}
    <div className="hidden md:flex items-center gap-8">
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          className="text-sm font-body text-muted-foreground hover:text-primary transition-colors"
        >
          {l.label}
        </a>
      ))}
      <Button variant="gold" size="sm" asChild>
        <a href="#pricing">Get Started</a>
      </Button>
    </div>

    {/* Mobile toggle */}
    <button
      className="md:hidden text-foreground"
      onClick={() => setOpen(!open)}
    >
      {open ? <X size={24} /> : <Menu size={24} />}
    </button>
  </div>

  {/* Mobile menu */}
  {open && (
    <div className="md:hidden bg-background border-b border-border px-6 pb-6 space-y-4">
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          onClick={() => setOpen(false)}
          className="block text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {l.label}
        </a>
      ))}
      <Button variant="gold" size="sm" className="w-full" asChild>
        <a href="#pricing">Get Started</a>
      </Button>
    </div>
  )}
</nav>
  );
};

export default Navbar;
