import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOpcoes } from "@/hooks/useOpcoes";
import { useAuth } from "@/context/AuthContext";

interface PieData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export const OptionsDistributionChart = () => {
  const { user } = useAuth();
  const { opcoes } = useOpcoes(user?.["user-id"]);

  // Filtrar opções abertas e contar por tipo
  const opcoesAbertas = opcoes.filter(opcao => opcao.status === 'aberta');
  const callCount = opcoesAbertas.filter(opcao => opcao.tipo?.toLowerCase() === 'call').length;
  const putCount = opcoesAbertas.filter(opcao => opcao.tipo?.toLowerCase() === 'put').length;
  const total = callCount + putCount;

  const data: PieData[] = [
    {
      name: 'Call',
      value: callCount,
      percentage: total > 0 ? (callCount / total) * 100 : 0,
      color: 'hsl(var(--profit))'
    },
    {
      name: 'Put',
      value: putCount,
      percentage: total > 0 ? (putCount / total) * 100 : 0,
      color: 'hsl(var(--loss))'
    }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">Quantidade: {data.value}</p>
          <p className="text-sm">Porcentagem: {data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ percentage }: any) => {
    return percentage > 0 ? `${percentage.toFixed(1)}%` : '';
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Distribuição Call vs Put</h3>
      <div>
        {total > 0 ? (
          <div className="flex items-center gap-6">
            <div className="h-48 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={CustomLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3">
              {data.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm font-medium">
                    {entry.name}: {entry.value} ({entry.percentage.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48">
            <p className="text-muted-foreground">
              Nenhuma opção aberta para exibir distribuição.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};