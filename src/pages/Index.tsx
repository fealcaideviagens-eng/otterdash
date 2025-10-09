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
} from "lucide-react";
import laptopMockup from "@/assets/laptop-mockup.png";
import TopNav from "@/components/navigation/TopNav";
 
 const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-br from-brand-purple via-brand-purple-dark to-[#4a0047]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.05),transparent_50%)]"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-white/20 rounded-full">
                <span className="text-white font-semibold text-sm">🚀 Versão Beta - 100% Gratuito</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-white">
                Gerencie suas{" "}
                <span className="text-white/90 underline decoration-white/40">Opções</span> com{" "}
                <span className="text-white/90 underline decoration-white/40">Simplicidade</span>
              </h1>
              <p className="text-xl text-white/90">
                Acompanhe seus lucros, metas e opções em aberto com facilidade.
                Criado por um investidor de opções para investidores de opções.
              </p>
              {/* CTAs do hero removidos temporariamente */}
              <div className="flex items-center gap-4 text-sm text-white/80">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>100% Gratuito</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>Sem necessidade de cartão</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 rounded-2xl shadow-2xl overflow-hidden">
                <img
                  src={laptopMockup}
                  alt="Dashboard Preview - Sistema ALCA+ em Laptop"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -top-8 -right-8 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-8 -left-8 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Apresentação do Produto */}
      <section id="produto" className="py-20 bg-gradient-to-b from-muted/50 via-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-brand-purple/10 rounded-full mb-4">
              <span className="text-brand-purple font-semibold">Controle Total</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Gerencie Suas Operações com Inteligência
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cadastre opções realizadas, acompanhe lucros, metas e o andamento
              de suas operações em tempo real.
            </p>
            <p className="text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-brand-purple" />
              <strong>Importante:</strong> Foco em compra e venda de CALL e PUT
              — sem recomendações de investimento.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="shadow-modern hover:shadow-modern-lg transition-all hover:-translate-y-1 border-t-4 border-t-brand-purple">
              <CardContent className="pt-6">
                <div className="rounded-xl bg-brand-purple/10 w-12 h-12 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-brand-purple" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Dashboard Intuitivo
                </h3>
                <p className="text-muted-foreground">
                  Visualize todas as suas operações, lucros e prejuízos em uma
                  interface limpa e fácil de entender.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-modern hover:shadow-modern-lg transition-all hover:-translate-y-1 border-t-4 border-t-brand-purple">
              <CardContent className="pt-6">
                <div className="rounded-xl bg-brand-purple/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-brand-purple" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Controle de Metas
                </h3>
                <p className="text-muted-foreground">
                  Defina metas de lucro diário, semanal e mensal e acompanhe
                  seu progresso em tempo real.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-modern hover:shadow-modern-lg transition-all hover:-translate-y-1 border-t-4 border-t-brand-purple">
              <CardContent className="pt-6">
                <div className="rounded-xl bg-brand-purple/10 w-12 h-12 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-brand-purple" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Histórico Completo
                </h3>
                <p className="text-muted-foreground">
                  Acesse todas as suas operações passadas para análise e
                  aprendizado contínuo.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefícios e Funcionalidades */}
      <section id="recursos" className="py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-purple/5 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-brand-purple/10 rounded-full mb-4">
              <span className="text-brand-purple font-semibold">Recursos Poderosos</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Funcionalidades que Fazem a Diferença
            </h2>
            <p className="text-xl text-muted-foreground">
              Ferramentas essenciais para gerenciar suas opções com confiança
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-modern hover:shadow-modern-lg transition-all hover:scale-105 border border-brand-purple/10">
              <CardContent className="pt-6 text-center">
                <div className="rounded-full bg-brand-purple/10 w-16 h-16 flex items-center justify-center mx-auto mb-4 border-2 border-brand-purple/20">
                  <AlertCircle className="w-8 h-8 text-brand-purple" />
                </div>
                <h3 className="font-semibold mb-2">Alertas Inteligentes</h3>
                <p className="text-sm text-muted-foreground">
                  Receba alertas de lucro e prejuízo alto para tomar decisões
                  rápidas
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-modern hover:shadow-modern-lg transition-all hover:scale-105 border border-brand-purple/10">
              <CardContent className="pt-6 text-center">
                <div className="rounded-full bg-brand-purple/10 w-16 h-16 flex items-center justify-center mx-auto mb-4 border-2 border-brand-purple/20">
                  <DollarSign className="w-8 h-8 text-brand-purple" />
                </div>
                <h3 className="font-semibold mb-2">Valor de Garantia</h3>
                <p className="text-sm text-muted-foreground">
                  Acompanhe o valor de garantia em uso em tempo real
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-modern hover:shadow-modern-lg transition-all hover:scale-105 border border-brand-purple/10">
              <CardContent className="pt-6 text-center">
                <div className="rounded-full bg-brand-purple/10 w-16 h-16 flex items-center justify-center mx-auto mb-4 border-2 border-brand-purple/20">
                  <TrendingUp className="w-8 h-8 text-brand-purple" />
                </div>
                <h3 className="font-semibold mb-2">Termômetro de Opções</h3>
                <p className="text-sm text-muted-foreground">
                  Indica o quão agressiva está sua operação atual
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-modern hover:shadow-modern-lg transition-all hover:scale-105 border border-brand-purple/10">
              <CardContent className="pt-6 text-center">
                <div className="rounded-full bg-brand-purple/10 w-16 h-16 flex items-center justify-center mx-auto mb-4 border-2 border-brand-purple/20">
                  <BarChart3 className="w-8 h-8 text-brand-purple" />
                </div>
                <h3 className="font-semibold mb-2">Interface Simples</h3>
                <p className="text-sm text-muted-foreground">
                  Design intuitivo, ideal para traders iniciantes
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Seção de Acesso Gratuito */}
      <section id="gratuito" className="py-20 bg-gradient-to-br from-brand-purple/5 via-brand-purple/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="shadow-modern-xl border-2 border-brand-purple/30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/5 to-transparent"></div>
              <CardContent className="pt-12 pb-12 text-center relative">
                <div className="mb-6">
                  <div className="inline-block px-4 py-2 bg-brand-purple/10 rounded-full mb-4">
                    <span className="text-brand-purple font-semibold">Versão Beta</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Acesso 100% Gratuito</h2>
                  <p className="text-muted-foreground">
                    Todas as funcionalidades disponíveis sem custo
                  </p>
                </div>
                <div className="mb-8">
                  <div className="text-6xl font-bold text-brand-purple mb-2">
                    GRÁTIS
                  </div>
                  <div className="text-muted-foreground">Enquanto em beta</div>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="bg-brand-purple hover-brand-purple text-white text-xl px-12 mb-6"
                >
                  <Link to="/auth?mode=signup">
                    Começar Agora
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                  Sem necessidade de cartão de crédito. Acesso imediato.
                </p>
                <div className="mt-8 space-y-3">
                  {[
                    "Dashboard completo com métricas em tempo real",
                    "Cadastro ilimitado de operações",
                    "Controle de metas personalizadas",
                    "Alertas de lucro e prejuízo",
                    "Histórico completo de operações",
                    "Suporte por e-mail",
                  ].map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5 text-brand-purple" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Seção de Doações */}
      <section id="doacoes" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4">Apoie o Desenvolvimento</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Este sistema foi criado por um investidor de opções apaixonado por tecnologia.
                Atualmente em versão beta, é totalmente gratuito para a comunidade de traders.
              </p>
              <p className="text-muted-foreground mb-8">
                Se você está achando útil e gostaria de contribuir para a evolução da plataforma,
                considere fazer uma doação. Todo o valor arrecadado será investido em melhorias,
                novas funcionalidades e manutenção dos servidores.
              </p>
            </div>
            <Card className="shadow-modern border-2 border-brand-purple/20">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="rounded-full bg-brand-purple/10 w-12 h-12 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-brand-purple" />
                  </div>
                  <h3 className="text-xl font-semibold">Doação via PIX</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Sua contribuição ajuda a manter e evoluir esta plataforma
                </p>
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Chave PIX (E-mail)</p>
                  <p className="text-lg font-mono font-semibold text-brand-purple break-all">
                    otteropcoes@gmail.com
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Qualquer valor é bem-vindo e muito apreciado! 🙏
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="depoimentos" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              O Que Nossos Usuários Dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Carlos Silva",
                role: "Trader Iniciante",
                text: "Finalmente consigo acompanhar minhas operações de forma organizada. A interface é muito intuitiva!",
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

      {/* CTA Final */}
      <section id="cta" className="py-20 bg-gradient-to-br from-brand-purple via-brand-purple-dark to-[#4a0047] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.05),transparent_50%)]"></div>
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-4xl font-bold text-white mb-4">
            Comece Grátis Hoje Mesmo
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Junte-se aos traders que já estão gerenciando suas opções
            de forma profissional com nossa plataforma 100% gratuita
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-brand-purple hover:bg-white/90 text-xl px-12 font-semibold"
          >
            <Link to="/auth?mode=signup">
              Começar Grátis Agora
              <ArrowRight className="ml-2" />
            </Link>
          </Button>
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
                <span className="text-sm">Pagamentos seguros</span>
              </div>
              <p className="text-sm text-background/60 text-center">
                © 2025 Sistema de Opções. Todos os direitos reservados.
              </p>
              <p className="text-xs text-background/60 text-center max-w-xs">
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
