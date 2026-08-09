import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";

const links = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Process", href: "#process" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, openAuth, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <a href="#home" className="flex items-center gap-2">
          <img
            src="/ishwari_logo.jpeg"
            alt="Ishwari Socials"
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
          {user ? (
            <Button variant="goldOutline" size="sm" onClick={() => signOut()}>
              <LogOut size={14} /> Sign out
            </Button>
          ) : (
            <Button variant="goldOutline" size="sm" onClick={() => openAuth()}>
              Sign in
            </Button>
          )}
          <Button variant="gold" size="sm" asChild>
            <a href="#pricing">Get Started</a>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
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
          {user ? (
            <Button
              variant="goldOutline"
              size="sm"
              className="w-full"
              onClick={() => {
                setOpen(false);
                signOut();
              }}
            >
              <LogOut size={14} /> Sign out
            </Button>
          ) : (
            <Button
              variant="goldOutline"
              size="sm"
              className="w-full"
              onClick={() => {
                setOpen(false);
                openAuth();
              }}
            >
              Sign in
            </Button>
          )}
          <Button variant="gold" size="sm" className="w-full" asChild>
            <a href="#pricing">Get Started</a>
          </Button>
        </div>
      )}
    </nav>
  );
}
