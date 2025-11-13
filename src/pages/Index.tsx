import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Target,
  AlertCircle,
  DollarSign,
  BarChart3,
  Shield,
  CheckCircle,
  ArrowRight,
  Star,
  Wallet,
  Skull,
  PiggyBank,
  CircleDollarSign,
} from "lucide-react";
import laptopMockup from "@/assets/smartdesk.png";
import backgroundlp from "@/assets/backgroundlp.jpg";
import TopNav from "@/components/navigation/TopNav";
import iconpix from "@/assets/icon-pix.png";
 
 const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-br from-brand-purple via-brand-purple-dark to-[#1C2E51]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.05),transparent_50%)]"></div>
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-purple via-brand-purple-dark to-[#4a0047] pt-20 pb-0 md:pb-0">
  
        {/* IMAGEM DE FUNDO COM OPACIDADE */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5" style={{ backgroundImage: `url(${backgroundlp})` }} />

          <div class="flex flex-col items-center text-center gap-16 max-w-7xl mx-auto">
           <div class="space-y-6 relative z-10 max-w-5xl">
              <div className="inline-block px-4 py-2 bg-white/20 rounded-full">
                <span className="text-white font-semibold text-sm">LANÇAMENTO • 100% GRATUITO</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-white">
              Gerencie suas opções de forma fácil{" "}
              </h1>
              <p className="text-xl text-white/90">
                Acompanhe seus lucros, metas e opções em aberto com facilidade e inteligência.
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
                />
              </div>
              <div className="absolute -top-8 -right-8 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Apresentação do Produto */}
      <section id="produto" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Acompanhe suas operações no dia a dia
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Seus lucros, metas, garantias e opções em aberto com facilidade e inteligência.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-[#f5f5f5] hover:shadow-modern-lg transition-all hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="rounded-full bg-brand-purple w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">
                  Dashboard intuitivo
                </h3>
                <p className="text-muted-foreground text-center">
                 Tenha visão geral de resultados de todas as suas operações
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#f5f5f5] hover:shadow-modern-lg transition-all hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="rounded-full bg-brand-purple w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">
                  Portfólio completo
                </h3>
                <p className="text-muted-foreground text-center">
                  Tenha acesso as suas operações abertas e as finalizadas com histórico completo
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#f5f5f5] hover:shadow-modern-lg transition-all hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="rounded-full bg-brand-purple w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <Skull className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">
                  Analise de risco
                </h3>
                <p className="text-muted-foreground text-center">
                  Cadastre suas opções com ajuda de risco feita com IA
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#f5f5f5] hover:shadow-modern-lg transition-all hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="rounded-full bg-brand-purple w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">
                  Simule sua saída
                </h3>
                <p className="text-muted-foreground text-center">
                   Antes de finalizar sua opção, simule seu lucro ou prejuízo
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#f5f5f5] hover:shadow-modern-lg transition-all hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="rounded-full bg-brand-purple w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">
                   Histórico de rentabilidade
                </h3>
                <p className="text-muted-foreground text-center">
                  Tenha visão mês a mês dos seus resultados de forma consolidada
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#f5f5f5] hover:shadow-modern-lg transition-all hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="rounded-full bg-brand-purple w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <PiggyBank className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">
                  Garantias em mãos
                </h3>
                <p className="text-muted-foreground text-center">
                  Faça a gestão da sua própria garantia para não depender da corretora
                </p>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>


      {/* Seção de Acesso Gratuito e Doações */}
      <section id="gratuito" className="py-20 bg-gradient-to-br from-brand-purple via-brand-purple-dark to-[#1C2E51]">

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-white">Apoie nosso projeto</h2>
            </div>
            <div className="grid md:grid-cols-1 gap-8">

              {/* Card de Doações */}
              <Card className="bg-transparent border-2 border-white rounded-2xl max-w-3xl mx-auto">
              <CardContent className="p-8">
    
    {/* CONTAINER FLEX PRINCIPAL (NUNCA FECHE ANTES DO FIM) */}
    <div className="flex flex-col md:flex-row items-center gap-8">

      {/* LADO ESQUERDO: Logo + Textos */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left">
    <img 
      src={iconpix} 
      alt="Logo PIX" 
      className="w-20 h-20 object-contain mb-5"
    />
    <p className="text-white text-lg font-medium">
      Qualquer valor ajuda
    </p>
    <p className="text-white text-xl mt-1">
      otteropcoes@gmail.com
    </p>
  </div>

      {/* LINHA DIVISÓRIA (só no desktop) */}
      <div className="hidden md:block w-px bg-white/60 h-full min-h-[160px]" />

      {/* LADO DIREITO: Título + Lista */}
      <div className="flex-1 text-center md:text-left">
        <p className="text-left mb-3">
          <strong className="text-white text-lg">Por que doar?</strong>
        </p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-white">
            <CheckCircle className="w-5 h-5 text-[#4BB8A9] flex-shrink-0 mt-0.5" />
            <span>Novas funcionalidades</span>
          </li>
          <li className="flex items-start gap-2 text-white">
            <CheckCircle className="w-5 h-5 text-[#4BB8A9] flex-shrink-0 mt-0.5" />
            <span>Melhorias contínuas</span>
          </li>
          <li className="flex items-start gap-2 text-white">
            <CheckCircle className="w-5 h-5 text-[#4BB8A9] flex-shrink-0 mt-0.5" />
            <span>Manutenção dos servidores</span>
          </li>
          <li className="flex items-start gap-2 text-white">
            <CircleDollarSign className="w-5 h-5 text-[#CFF402] flex-shrink-0 mt-0.5" />
            <span>Já foram doados R$124,50</span>
          </li>
        </ul>
      </div>

    </div> {/* FECHA O FLEX AQUI NO FINAL */}

  </CardContent>
</Card>            

  <p className="text-base text-muted-foreground max-w-xl mx-auto text-center text-white">
                Todas as funcionalidades disponíveis sem custo. Criado por um investidor de opções para a comunidade de traders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="depoimentos" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              O que nossos usuários dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Carlos Silva",
                role: "Trader Iniciante",
                text: "Finalmente consigo acompanhar minhas operações de forma organizada e sem usar Excel.",
              },
              {
                name: "Marina Costa",
                role: "Investidora",
                text: "Os alertas me salvaram várias vezes. Consigo tomar decisões mais rápidas e assertivas.",
              },
               {
                name: "João Santos",
                role: "Trader",
                text: "Sistema completo e gratuito! Perfeito para quem está começando e quer organizar suas operações.",
              },
            ].map((testimonial, i) => (
              <Card key={i} className="shadow-modern">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-brand-purple text-brand-purple"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "{testimonial.text}"
                  </p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="py-12 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-purple-dark/20 to-transparent"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4 text-white">Sobre</h3>
              <p className="text-sm text-background/80">
                Plataforma gratuita de gerenciamento de opções, criada por um investidor
                para investidores. Atualmente em versão beta, focada em simplicidade
                e eficiência para traders iniciantes.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white">Contato & Doações</h3>
              <p className="text-sm text-background/80 mb-2">
                Email: otteropcoes@gmail.com
              </p>
              <p className="text-sm text-background/80">
                PIX: otteropcoes@gmail.com
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white">Legal</h3>
              <p className="text-sm text-background/80">
                Termos de Uso | Política de Privacidade
              </p>
            </div>
          </div>
          <div className="border-t border-background/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-white">
                <Shield className="w-5 h-5" />
                <span className="text-sm">Site seguro</span>
              </div>
              <p className="text-sm text-background/60 text-center">
                © 2025 Sistema de Opções. Todos os direitos reservados.
              </p>
              <p className="text-xs text-background/60 text-center max-w-lg">
                Este sistema não fornece recomendações de compra ou venda de
                opções.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
