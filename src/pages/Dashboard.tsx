import { TrendingUp, TrendingDown, DollarSign, CirclePlus, BarChart, Calendar, Shield, Wallet, Landmark } from "lucide-react";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { ResultsChart } from "@/components/dashboard/ResultsChart";
import { OptionsDistributionChart } from "@/components/dashboard/OptionsDistributionChart";
import { AlertasCard } from "@/components/dashboard/AlertasCard";
import { OpportunitiesAlertCard } from "@/components/dashboard/OpportunitiesAlertCard";
import { useOpcoes } from "@/hooks/useOpcoes";
import { useMetas } from "@/hooks/useMetas";
import { useGarantias } from "@/hooks/useGarantias";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const getGreeting = () => {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 6 && hour < 12) {
    return "Bom dia";
  } else if (hour >= 12 && hour < 18) {
    return "Boa tarde";
  } else {
    return "Boa noite";
  }
};

const getShortName = (fullName: string) => {
  if (!fullName) return 'usuário';

  const names = fullName.trim().split(' ');
  if (names.length === 1) {
    return names[0];
  }

  // Retorna primeiro e segundo nome
  return `${names[0]} ${names[1]}`;
};

export default function Dashboard() {
  const { user } = useAuth();
  // 1. MANTENHA O HOOK DE OPÇÕES
  const { loading, getDashboardMetrics, opcoes, encerrarOpcao, refreshData } = useOpcoes(user?.id || '');

  // 2. ADICIONE ESSA LINHA (HOOK DE GARANTIAS)
  const { garantias } = useGarantias({ userId: user?.id });

  const navigate = useNavigate();
  const [chartPeriod, setChartPeriod] = useState<'monthly' | 'yearly'>('monthly');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Carregando métricas...</div>
      </div>
    );
  }

  const metrics = getDashboardMetrics();

  // MANTENHA AS LÓGICAS DE OPÇÕES ABERTAS
  const opcoesAbertas = opcoes.filter(opcao => opcao.status === 'aberta');
  const callAbertas = opcoesAbertas.filter(opcao => opcao.tipo?.toLowerCase() === 'call').length;
  const putAbertas = opcoesAbertas.filter(opcao => opcao.tipo?.toLowerCase() === 'put').length;

  // 3. AQUI ESTÁ A MUDANÇA PRINCIPAL:
  // Eu removi a função antiga "calcularGarantia" inteira.
  // No lugar dela, coloquei esta lógica direta:

  const garantia = garantias
    .filter(g => g.tipo === 'renda_fixa')
    .reduce((total, g) => total + (g.valorLivre || 0), 0);

  // 4. A PARTIR DAQUI, MANTENHA TUDO IGUAL (Garantia em Ativos):
  const calcularGarantiaAtivos = () => {
    // 1. Mapear o saldo de garantias em ações disponíveis
    const saldoGarantias = new Map<string, number>();
    garantias
      .filter(g => g.tipo === 'acao' && g.ticker && g.quantidade)
      .forEach(g => {
        const ticker = g.ticker!.toUpperCase();
        const atual = saldoGarantias.get(ticker) || 0;
        saldoGarantias.set(ticker, atual + g.quantidade!);
      });

    // 2. Filtrar apenas operações simples de risco (Venda de Call e Compra de Put)
    const opcoesRisco = opcoes.filter(opcao => {
      // Ignora operações que são partes de travas/estratégias
      // @ts-ignore
      if (opcao.ops_strategy_group_id || opcao.ops_strategy_type) return false;

      return (
        opcao.status === 'aberta' &&
        (
          (opcao.tipo?.toLowerCase() === 'call' && opcao.operacao?.toLowerCase() === 'venda') ||
          (opcao.tipo?.toLowerCase() === 'put' && opcao.operacao?.toLowerCase() === 'compra')
        )
      );
    });

    // 3. Calcular o valor descoberto
    const garantiaAtivosTotal = opcoesRisco.reduce((total, opcao) => {
      if (!opcao.strike || !opcao.quantidade) return total;

      // Tenta obter o ticker da ação (campo 'acao' ou inferido do ticker da opção)
      let ativoTicker = opcao.acao?.toUpperCase();
      if (!ativoTicker && opcao.opcao) {
        ativoTicker = opcao.opcao.substring(0, 4).toUpperCase();
      }

      const qtdOpcao = opcao.quantidade;
      let qtdDescoberta = qtdOpcao;

      if (ativoTicker) {
        const saldoDisponivel = saldoGarantias.get(ativoTicker) || 0;

        if (saldoDisponivel >= qtdOpcao) {
          // Totalmente coberto
          saldoGarantias.set(ativoTicker, saldoDisponivel - qtdOpcao);
          qtdDescoberta = 0;
        } else {
          // Parcialmente coberto
          qtdDescoberta = qtdOpcao - saldoDisponivel;
          saldoGarantias.set(ativoTicker, 0); // Zerou o saldo
        }
      }

      // Se houver quantidade descoberta, soma ao total (Strike * Quantidade Descoberta)
      if (qtdDescoberta > 0) {
        return total + (opcao.strike * qtdDescoberta);
      }

      return total;
    }, 0);

    return garantiaAtivosTotal;
  };

  // MANTENHA ESSA CHAMADA
  const garantiaAtivos = calcularGarantiaAtivos();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{getGreeting()}</h1>
          <p className="text-muted-foreground">
            Acompanhe suas opções de qualquer lugar
          </p>
        </div>
        <Button
          onClick={() => navigate("/cadastro")}
          className="shadow-modern bg-brand-blue-dark"
        >
          <CirclePlus className="mr-2 h-4 w-4" />
          Nova operação
        </Button>
      </div>


      {/* Primeira linha - 4 cards */}
      <TooltipProvider>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Ganho no mês"
            value={formatCurrency(metrics.valorGanhoMes)}
            icon={
              metrics.valorGanhoMes < 0 ? (
                <TrendingDown className="h-6 w-6" />
              ) : (
                <TrendingUp className="h-6 w-6" />
              )
            }
            isProfit={metrics.valorGanhoMes > 0}
            isLoss={metrics.valorGanhoMes < 0}
          />

          <MetricsCard
            title="Lucro em aberto"
            value={formatCurrency(metrics.lucroMaximoEstimado)}
            icon={<DollarSign className="h-6 w-6" />}
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <MetricsCard
                  title="Caixa livre"
                  value={formatCurrency(garantia)}
                  icon={<Landmark className="h-6 w-6" />}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Valor total em caixa para operar coberto</p>
              <p className="text-xs text-muted-foreground mt-1">(Venda de put e Compra de call)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <MetricsCard
                  title="Garantia (em ativos)"
                  value={formatCurrency(garantiaAtivos)}
                  icon={<Wallet className="h-6 w-6" />}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Valor total necessário para operar coberto</p>
              <p className="text-xs text-muted-foreground mt-1">Venda de Call e Compra de Put (Strike × Quantidade)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* Segunda linha - Resultado anual */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{chartPeriod === 'monthly' ? 'Resultado mensal' : 'Resultado anual'}</h3>
          <Tabs value={chartPeriod} onValueChange={(value) => setChartPeriod(value as 'monthly' | 'yearly')} className="w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Mensal
              </TabsTrigger>
              <TabsTrigger value="yearly" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Anual
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <ResultsChart viewType={chartPeriod} userId={user?.id} />
      </div>

      {/* Card de Oportunidades de rentabilização — entre o gráfico e os alertas */}
      <OpportunitiesAlertCard garantias={garantias} />

      {/* Card de Alertas */}
      <AlertasCard
        opcoes={opcoes}
        onEncerrar={async (data) => {
          if (user?.id) {
            // @ts-ignore - ignorando erro de tipagem temporário até atualizar o AlertasCard
            await encerrarOpcao(data.opcao_id, data);
            await refreshData();
          }
        }}
        onEncerrarTrava={async (data) => {
          if (user?.id) {
            const legs = opcoes.filter(op => op.ops_strategy_group_id === data.strategy_id);

            for (const leg of legs) {
              let premio = 0;
              if (leg.ops_strategy_role === 'LONG_LEG') {
                premio = data.compra_premio;
              } else if (leg.ops_strategy_role === 'SHORT_LEG') {
                premio = data.venda_premio;
              }

              await encerrarOpcao(leg.ops_id, {
                premio: premio,
                data: data.data,
                quantidade: data.quantidade
              });
            }
            await refreshData();
          }
        }}
      />
    </div>
  );
}