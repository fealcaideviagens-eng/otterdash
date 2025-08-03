import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useOpcoes } from "@/hooks/useOpcoes";
import { formatCurrency } from "@/utils/formatters";
import { Opcao } from "@/types/database";

type ViewType = 'monthly' | 'yearly';

interface ChartData {
  name: string;
  value: number;
  gain: number;
  loss: number;
}

interface ResultsChartProps {
  viewType: ViewType;
}

export const ResultsChart = ({ viewType }: ResultsChartProps) => {
  const { opcoes, vendas } = useOpcoes();

  // Calcular o resultado real da operação (igual à página Lucros)
  const calculateLucroPrejuizoReais = (opcao: any, venda: any): number => {
    if (!opcao.quantidade || !opcao.premio) return 0;
    
    // Valor inicial: Quantidade * Prêmio inicial
    const valorInicial = opcao.quantidade * opcao.premio;
    
    // Valor final: Quantidade * Novo prêmio (do encerramento)
    const valorFinal = venda.quantidade * venda.premio;
    
    // Para vendas: lucro = valor inicial - valor final
    // Para compras: lucro = valor final - valor inicial
    return opcao.operacao === 'venda' ? valorInicial - valorFinal : valorFinal - valorInicial;
  };

  // Agrupar dados por mês
  const getMonthlyData = (): ChartData[] => {
    const monthlyResults: { [key: string]: number } = {};
    
    vendas.forEach(venda => {
      // Encontrar a opção correspondente
      const opcao = opcoes.find(o => o.opcao === venda.opcao_id);
      if (!opcao) return;

      // Calcular o resultado real da operação
      const resultado = calculateLucroPrejuizoReais(opcao, venda);
      
      // Usar a data de encerramento corrigindo problema de fuso horário
      let dataEncerramento: Date;
      if (venda.encerramento.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = venda.encerramento.split('-').map(Number);
        dataEncerramento = new Date(year, month - 1, day);
      } else {
        dataEncerramento = new Date(venda.encerramento);
      }
      
      const monthKey = `${dataEncerramento.getFullYear()}-${String(dataEncerramento.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyResults[monthKey]) {
        monthlyResults[monthKey] = 0;
      }
      monthlyResults[monthKey] += resultado;
    });

    return Object.entries(monthlyResults)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, value]) => {
        const [year, monthNum] = month.split('-');
        const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('pt-BR', { 
          month: 'short', 
          year: 'numeric' 
        });
        
        return {
          name: monthName,
          value: value,
          gain: value > 0 ? value : 0,
          loss: value < 0 ? Math.abs(value) : 0,
        };
      });
  };

  // Agrupar dados por ano
  const getYearlyData = (): ChartData[] => {
    const yearlyResults: { [key: string]: number } = {};
    
    vendas.forEach(venda => {
      // Encontrar a opção correspondente
      const opcao = opcoes.find(o => o.opcao === venda.opcao_id);
      if (!opcao) return;

      // Calcular o resultado real da operação
      const resultado = calculateLucroPrejuizoReais(opcao, venda);
      
      // Usar a data de encerramento corrigindo problema de fuso horário
      let dataEncerramento: Date;
      if (venda.encerramento.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = venda.encerramento.split('-').map(Number);
        dataEncerramento = new Date(year, month - 1, day);
      } else {
        dataEncerramento = new Date(venda.encerramento);
      }
      
      const year = dataEncerramento.getFullYear().toString();
      
      if (!yearlyResults[year]) {
        yearlyResults[year] = 0;
      }
      yearlyResults[year] += resultado;
    });

    return Object.entries(yearlyResults)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, value]) => ({
        name: year,
        value: value,
        gain: value > 0 ? value : 0,
        loss: value < 0 ? Math.abs(value) : 0,
      }));
  };

  const data = viewType === 'monthly' ? getMonthlyData() : getYearlyData();

  // Adicionar cor personalizada a cada entrada baseada no valor
  const dataWithColors = data.map(item => ({
    ...item,
    fill: item.value >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))"
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0]?.value || 0;
      
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className={`font-semibold ${value >= 0 ? 'text-profit' : 'text-loss'}`}>
            Resultado: {formatCurrency(value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatYAxisTick = (value: number) => {
    return formatCurrency(value);
  };

  return (
    <div className="space-y-4">
        {data.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tickFormatter={formatYAxisTick}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  name="Resultado"
                  radius={[2, 2, 0, 0]}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.value >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-80">
            <p className="text-muted-foreground">
              Nenhuma venda registrada ainda para exibir resultados.
            </p>
          </div>
        )}
    </div>
  );
};