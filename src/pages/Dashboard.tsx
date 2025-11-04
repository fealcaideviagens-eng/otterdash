import { TrendingUp, PieChart, DollarSign, Plus, TrendingDown, BarChart, Calendar, Shield, Siren, AlertTriangle } from "lucide-react";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { EditableMetricsCard } from "@/components/dashboard/EditableMetricsCard";
import { EditarGarantiaModal } from "@/components/dashboard/EditarGarantiaModal";
import { ResultsChart } from "@/components/dashboard/ResultsChart";
import { OptionsDistributionChart } from "@/components/dashboard/OptionsDistributionChart";
import { AlertasCard } from "@/components/dashboard/AlertasCard";
import { useOpcoes } from "@/hooks/useOpcoes";
import { useMetas } from "@/hooks/useMetas";
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
  const { loading, getDashboardMetrics, opcoes } = useOpcoes(user?.id || '');
  const navigate = useNavigate();
  const [chartPeriod, setChartPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [garantiaPut, setGarantiaPut] = useState<number>(0);
  const [isGarantiaModalOpen, setIsGarantiaModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Carregando métricas...</div>
      </div>
    );
  }

  const metrics = getDashboardMetrics();
  
  // Calcular opções Call e Put abertas
  const opcoesAbertas = opcoes.filter(opcao => opcao.status === 'aberta');
  const callAbertas = opcoesAbertas.filter(opcao => opcao.tipo?.toLowerCase() === 'call').length;
  const putAbertas = opcoesAbertas.filter(opcao => opcao.tipo?.toLowerCase() === 'put').length;

  // Calcular Garantia (Compra de Call + Venda de Put)
  const calcularGarantia = () => {
    const opcoesGarantia = opcoes.filter(opcao => 
      opcao.status === 'aberta' &&
      (
        (opcao.tipo?.toLowerCase() === 'call' && opcao.operacao?.toLowerCase() === 'compra') ||
        (opcao.tipo?.toLowerCase() === 'put' && opcao.operacao?.toLowerCase() === 'venda')
      )
    );
    
    const garantiaTotal = opcoesGarantia.reduce((total, opcao) => {
      if (opcao.strike && opcao.quantidade) {
        return total + (opcao.strike * opcao.quantidade);
      }
      return total;
    }, 0);
    
    return garantiaTotal;
  };

  // Calcular Notional em ativos (Venda de Call + Compra de Put)
  const calcularNotionalAtivos = () => {
    const opcoesNotional = opcoes.filter(opcao => 
      opcao.status === 'aberta' &&
      (
        (opcao.tipo?.toLowerCase() === 'call' && opcao.operacao?.toLowerCase() === 'venda') ||
        (opcao.tipo?.toLowerCase() === 'put' && opcao.operacao?.toLowerCase() === 'compra')
      )
    );
    
    const notionalTotal = opcoesNotional.reduce((total, opcao) => {
      if (opcao.strike && opcao.quantidade) {
        return total + (opcao.strike * opcao.quantidade);
      }
      return total;
    }, 0);
    
    return notionalTotal;
  };

  const garantia = calcularGarantia();
  const notionalAtivos = calcularNotionalAtivos();

  // Verificar se garantia é menor que notional para mostrar alerta
  const isGarantiaInsuficiente = garantiaPut < notionalAtivos;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{getGreeting()}</h1>
          <p className="text-muted-foreground">
            Acompanhe suas opções de qualquer lugar
          </p>
        </div>
        <Button 
          onClick={() => navigate("/cadastro")}
          className="shadow-modern"
          style={{ backgroundColor: '#61005D' }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova opção
        </Button>
      </div>

      {/* Primeira linha - 4 cards */}
      <TooltipProvider>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Ganho no mês"
            value={formatCurrency(metrics.valorGanhoMes)}
            icon={<TrendingUp className="h-6 w-6" />}
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
                  title="Garantia"
                  value={formatCurrency(garantia)}
                  icon={<Shield className="h-6 w-6" />}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Soma das garantias necessárias para Compra de Call e Venda de Put</p>
              <p className="text-xs text-muted-foreground mt-1">(Strike × Quantidade)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <EditableMetricsCard
                  title="Notional (em ativos)"
                  value={formatCurrency(garantiaPut)}
                  icon={isGarantiaInsuficiente ? <Siren className="h-6 w-6" /> : <PieChart className="h-6 w-6" />}
                  onEdit={() => setIsGarantiaModalOpen(true)}
                  isAlert={isGarantiaInsuficiente}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Valor total dos ativos necessários em carteira para Venda de Call e Compra de Put</p>
              <p className="text-xs text-muted-foreground mt-1">(Strike × Quantidade)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* Segunda linha - Resultado anual */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Resultado anual</h3>
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

      {/* Card de Alertas */}
      <AlertasCard opcoes={opcoes} />

      <EditarGarantiaModal
        isOpen={isGarantiaModalOpen}
        onClose={() => setIsGarantiaModalOpen(false)}
        valorAtual={garantiaPut}
        onSalvar={setGarantiaPut}
      />
    </div>
  );
}