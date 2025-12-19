import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { Menu, X } from "lucide-react";
import logoTransparent from "@assets/HiveCraft_Digital_Logo_Transparent.png";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/process", label: "Process" },
  { href: "/pricing", label: "Pricing" },
  { href: "/portfolio", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-24">
          <Link href="/" data-testid="link-logo">
            <img
              src={logoTransparent}
              alt="HiveCraft Digital"
              className="h-14 lg:h-16 w-auto"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-testid={`link-nav-${link.label.toLowerCase()}`}
              >
                <span
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors hover-elevate ${
                    location === link.href
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            {isLoading ? (
              <div className="w-24 h-9 bg-muted rounded-md animate-pulse" />
            ) : user ? (
              <Link href="/portal">
                <Button data-testid="button-portal">Client Portal</Button>
              </Link>
            ) : (
              <a href="/api/login">
                <Button data-testid="button-login">Login</Button>
              </a>
            )}
          </div>

          <button
            className="lg:hidden p-2 rounded-md hover-elevate"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="button-mobile-menu"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background/98 backdrop-blur-md border-b border-border">
          <div className="px-6 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid={`link-mobile-nav-${link.label.toLowerCase()}`}
              >
                <span
                  className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors hover-elevate ${
                    location === link.href
                      ? "text-primary bg-accent"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <ThemeToggle />
              {user ? (
                <Link href="/portal" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button size="sm" data-testid="button-mobile-portal">Portal</Button>
                </Link>
              ) : (
                <a href="/api/login">
                  <Button size="sm" data-testid="button-mobile-login">Login</Button>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
