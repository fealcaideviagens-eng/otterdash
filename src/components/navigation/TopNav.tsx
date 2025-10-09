import operaiLogo from "@/assets/operai-logo.png";

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
          <a href="#home" className="flex items-center gap-2">
            <img
              src={operaiLogo}
              alt="operAI logo"
              className="h-8 w-auto"
              loading="eager"
            />
            <span className="font-bold text-lg">operAI</span>
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
          </nav>

          <div className="md:hidden">
            <nav className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm whitespace-nowrap text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
