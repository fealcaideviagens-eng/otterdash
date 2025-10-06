import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Calendar } from "lucide-react";
import { useOpcoes } from "@/hooks/useOpcoes";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/utils/formatters";

type ViewMode = "monthly" | "yearly";

export default function Lucros() {
  const { user } = useAuth();
  const { opcoes, vendas, loading } = useOpcoes(user?.id || '');
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Carregando dados...</div>
      </div>
    );
  }

  // Função para calcular o resultado (lucro/prejuízo) de uma operação
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

  // Calcular lucros por mês usando a data de encerramento e o resultado real das operações
  const lucrosPorMes = () => {
    const lucros: Record<string, { total: number, operacoes: any[] }> = {};
    const anoAtual = new Date().getFullYear();

    vendas.forEach(venda => {
      // Encontrar a opção correspondente usando o ops_id correto
      const opcao = opcoes.find(o => o.ops_id === venda.ops_id);
      if (!opcao) return;

      // Calcular o resultado real da operação
      const resultado = calculateLucroPrejuizoReais(opcao, venda);
      
      // Usar a data de encerramento que o usuário inseriu no modal - corrigir problema de fuso horário
      let dataEncerramento: Date;
      if (venda.encerramento.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = venda.encerramento.split('-').map(Number);
        dataEncerramento = new Date(year, month - 1, day);
      } else {
        dataEncerramento = new Date(venda.encerramento);
      }
        
      // Apenas considerar vendas do ano atual baseado na data de encerramento
      if (dataEncerramento.getFullYear() === anoAtual) {
        const monthKey = viewMode === "monthly" 
          ? `${dataEncerramento.getFullYear()}-${String(dataEncerramento.getMonth() + 1).padStart(2, '0')}`
          : String(dataEncerramento.getFullYear());

        if (!lucros[monthKey]) {
          lucros[monthKey] = { total: 0, operacoes: [] };
        }

        lucros[monthKey].total += resultado;
        lucros[monthKey].operacoes.push({
          ...venda,
          opcao: opcao.ops_ticker, // Usar o ticker correto
          resultado
        });
      }
    });

    return lucros;
  };

  const dados = lucrosPorMes();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lucros e prejuízos</h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho de cada ação em seu portfólio
          </p>
        </div>
        
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="w-auto">
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

      <div className="grid grid-cols-1 gap-6">
      <Card className="shadow-modern glass">
        <CardHeader>
          <CardTitle>
            <span>Resultados por período</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="space-y-3">
            {Object.entries(dados)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([periodo, dadosPeriodo]) => (
                <AccordionItem key={periodo} value={periodo} className="border rounded-lg">
                  <AccordionTrigger className="px-3 py-2 hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="font-medium">
                        {viewMode === "monthly" 
                          ? (() => {
                              const [year, month] = periodo.split('-');
                              const monthNames = [
                                'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                                'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
                              ];
                              return `${monthNames[parseInt(month) - 1]} de ${year}`;
                            })()
                          : periodo
                        }
                      </span>
                      <span className={`font-semibold ${dadosPeriodo.total >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {formatCurrency(dadosPeriodo.total)}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {dadosPeriodo.operacoes.map((operacao, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg">
                          <div className="text-center space-y-2">
                            <span className="font-medium text-sm block truncate">
                              {operacao.opcao}
                            </span>
                            <span className={`font-semibold text-lg ${operacao.resultado >= 0 ? 'text-profit' : 'text-loss'}`}>
                              {formatCurrency(operacao.resultado)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))
            }
          </Accordion>
        </CardContent>
      </Card>
        
        {Object.keys(dados).length === 0 && (
          <Card className="shadow-modern glass">
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Nenhuma operação encerrada encontrada</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}