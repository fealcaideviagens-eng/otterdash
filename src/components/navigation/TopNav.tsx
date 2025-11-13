import otterLogo from "@/assets/logo-otter.png";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const links = [
  { href: "#produto", label: "Recursos" },
  { href: "#gratuito", label: "Apoie o projeto" },
  { href: "#depoimentos", label: "Depoimentos" },
];

export default function TopNav() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <a href="#home" className="flex items-center">
            <img
              src={otterLogo}
              alt="Otter Logo"
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
            <Button asChild size="sm" className="rounded-full">
              <Link to="/auth?mode=login">Entrar / Cadastrar</Link>
            </Button>
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <Button asChild size="sm" className="rounded-full">
              <Link to="/auth?mode=login">Entrar / Cadastrar</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
