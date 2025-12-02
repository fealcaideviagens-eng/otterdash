import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ArrowRight } from "lucide-react";
import laptopMockup from "@/assets/smartdesk.png";
import backgroundlp from "@/assets/backgroundlp.jpg";
import TopNav from "@/components/navigation/TopNav";
import { SEO } from "@/components/SEO";

// Lazy load non-critical sections
const ProductSection = lazy(() => import("@/components/sections/ProductSection"));
const DonationSection = lazy(() => import("@/components/sections/DonationSection"));
const TestimonialsSection = lazy(() => import("@/components/sections/TestimonialsSection"));
const Footer = lazy(() => import("@/components/sections/Footer"));



const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Home"
        description="Acompanhe seus lucros, metas e opções com inteligência e sem planilhas malucas. O sistema definitivo para investidores de opções."
      />
      <TopNav />
      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-br from-brand-purple via-brand-purple-dark to-[#1C2E51]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.05),transparent_50%)]"></div>
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-purple via-brand-purple-dark to-[#4a0047] pt-20 pb-0 md:pb-0">

          {/* IMAGEM DE FUNDO COM OPACIDADE */}
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5" style={{ backgroundImage: `url(${backgroundlp})` }} />

          <div className="flex flex-col items-center text-center gap-16 max-w-7xl mx-auto">
            <div className="space-y-6 relative z-10 max-w-5xl px-4">
              <div className="inline-block px-4 py-2 bg-white/20 rounded-full">
                <span className="text-white font-semibold text-sm">LANÇAMENTO • 100% GRATUITO</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-white">
                Mergulhe de cabeça no controle das suas opções{" "}
              </h1>
              <p className="text-xl text-white/90">
                Acompanhe seus lucros, metas e opções com inteligência e sem planilhas malucas.
              </p>
              <div className="pt-2">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-brand-purple hover:bg-white/90 text-lg px-8 shadow-lg rounded-full"
                >
                  <Link to="/auth?mode=login">
                    Crie sua conta <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 overflow-hidden">
                <img
                  src={laptopMockup}
                  alt="Dashboard Preview"
                  className="w-full h-auto"
                  loading="eager"
                  fetchPriority="high"
                  width="1920"
                  height="1080"
                />
              </div>
              <div className="absolute -top-8 -right-8 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Lazy-loaded sections with Suspense */}
      <Suspense fallback={<div className="min-h-[400px]" />}>
        <ProductSection />
      </Suspense>

      <Suspense fallback={<div className="min-h-[400px]" />}>
        <DonationSection />
      </Suspense>

      <Suspense fallback={<div className="min-h-[300px]" />}>
        <TestimonialsSection />
      </Suspense>

      <Suspense fallback={<div className="min-h-[200px]" />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;

