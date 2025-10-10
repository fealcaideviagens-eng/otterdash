import operaiLogo from "@/assets/operai-logo.png";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const links = [
  { href: "#produto", label: "Produto" },
  { href: "#recursos", label: "Recursos" },
  { href: "#gratuito", label: "Gratuito" },
  { href: "#doacoes", label: "Doações" },
  { href: "#depoimentos", label: "Depoimentos" },
];

export default function TopNav() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <a href="#home" className="flex items-center">
            <img
              src={operaiLogo}
              alt="operAI logo"
              className="h-12 w-auto"
              loading="eager"
            />
          </a>

          <nav className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors story-link"
              >
                {link.label}
              </a>
            ))}
            <Button asChild size="sm">
              <Link to="/auth?mode=login">Login</Link>
            </Button>
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <Button asChild size="sm">
              <Link to="/auth?mode=login">Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
