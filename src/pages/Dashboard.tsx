import { TrendingUp, PieChart, DollarSign, Plus, TrendingDown, BarChart, Calendar, Shield, Siren, AlertTriangle } from "lucide-react";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { EditableMetricsCard } from "@/components/dashboard/EditableMetricsCard";
import { EditarGarantiaModal } from "@/components/dashboard/EditarGarantiaModal";
import { ResultsChart } from "@/components/dashboard/ResultsChart";
import { OptionsDistributionChart } from "@/components/dashboard/OptionsDistributionChart";
import { AlertasCard } from "@/components/dashboard/AlertasCard";
import { useAuth } from "@/context/AuthContext";
import { useOpcoes } from "@/hooks/useOpcoes";
import { formatCurrency } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  const { loading, getDashboardMetrics, opcoes } = useOpcoes(user?.['user-id']);
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

  // Calcular Notional (opções Put de venda)
  const calcularNotional = () => {
    const putVendas = opcoes.filter(opcao => 
      opcao.tipo?.toLowerCase() === 'put' && 
      opcao.operacao?.toLowerCase() === 'venda' &&
      opcao.status === 'aberta'
    );
    
    const notionalTotal = putVendas.reduce((total, opcao) => {
      if (opcao.strike && opcao.quantidade) {
        const valorInicial = opcao.strike * opcao.quantidade;
        const valorExercicio = valorInicial * 0.0025; // 0,25%
        const valorFinal = valorInicial + valorExercicio;
        return total + valorFinal;
      }
      return total;
    }, 0);
    
    return notionalTotal;
  };

  const notional = calcularNotional();

  // Verificar se garantia é menor que notional para mostrar alerta
  const isGarantiaInsuficiente = garantiaPut < notional;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{getGreeting()}, {getShortName(user?.nome || '')}</h1>
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Ganho no mês"
          value={formatCurrency(metrics.valorGanhoMes)}
          icon={<TrendingUp className="h-6 w-6" />}
          isProfit={metrics.valorGanhoMes > 0}
          isLoss={metrics.valorGanhoMes < 0}
        />
        
        <MetricsCard
          title="Lucro máximo estimado"
          value={formatCurrency(metrics.lucroMaximoEstimado)}
          icon={<DollarSign className="h-6 w-6" />}
        />

        <MetricsCard
          title="Notional"
          value={formatCurrency(notional)}
          icon={<PieChart className="h-6 w-6" />}
        />

        <EditableMetricsCard
          title="Garantia para put"
          value={formatCurrency(garantiaPut)}
          icon={isGarantiaInsuficiente ? <Siren className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
          onEdit={() => setIsGarantiaModalOpen(true)}
          isAlert={isGarantiaInsuficiente}
        />
      </div>

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
        <ResultsChart viewType={chartPeriod} />
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