import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useMetas } from "@/hooks/useMetas";
import { Meta } from "@/types/database";
import { useOpcoes } from "@/hooks/useOpcoes";
import { formatCurrency } from "@/utils/formatters";
import { formatCurrency as formatCurrencyInput, parseCurrencyToNumber } from "@/utils/inputFormatters";
import { Plus, Target, TrendingUp, Calendar, CalendarDays } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { useAuth } from "@/context/AuthContext";

const Metas = () => {
  const { user } = useAuth();
  const { metas, addMeta, loading } = useMetas({ userId: user?.['user-id'] });
  const { opcoes, vendas } = useOpcoes(user?.['user-id']);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novaMetaValor, setNovaMetaValor] = useState("");
  const [novaMetaTipo, setNovaMetaTipo] = useState<"mensal" | "anual">("mensal");
  const [novaMetaAno, setNovaMetaAno] = useState(new Date().getFullYear().toString());

  // Calcular o resultado real da operação (igual à página ResultsChart)
  const calculateLucroPrejuizoReais = (opcao: any, venda: any): number => {
    if (!opcao?.quantidade || !opcao?.premio) return 0;
    
    // Valor inicial: Quantidade * Prêmio inicial
    const valorInicial = opcao.quantidade * opcao.premio;
    
    // Valor final: Quantidade * Novo prêmio (do encerramento)
    const valorFinal = venda.quantidade * venda.premio;
    
    // Para vendas: lucro = valor inicial - valor final
    // Para compras: lucro = valor final - valor inicial
    return opcao.operacao === 'venda' ? valorInicial - valorFinal : valorFinal - valorInicial;
  };

  const calcularProgresso = (meta: Meta) => {
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();

    const metaValor = meta["m-mensal"] > 0 ? meta["m-mensal"] : meta["m-anual"] || 0;
    const metaTipo = meta["m-mensal"] > 0 ? "mensal" : "anual";

    if (metaTipo === "mensal") {
      // Para meta mensal: soma todos os resultados do ano atual e divide pelo número de meses passados
      let totalResultadoAno = 0;
      
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
        
        const vendaAno = dataEncerramento.getFullYear();
        
        // Considera todas as vendas do ano atual
        if (vendaAno === anoAtual) {
          totalResultadoAno += resultado;
        }
      });

      // Número de meses passados até agora (incluindo o mês atual)
      // Janeiro = 0, então mesAtual + 1 é a quantidade de meses passados
      const mesesPassados = mesAtual + 1;
      const mediaAtual = mesesPassados > 0 ? totalResultadoAno / mesesPassados : 0;
      const progresso = (mediaAtual / metaValor) * 100;
      
      return {
        atual: mediaAtual,
        progresso: Math.min(progresso, 100),
        restante: Math.max(metaValor - mediaAtual, 0)
      };
    } else {
      // Para meta anual: soma todos os resultados do ano correspondente à meta
      let totalResultadoAno = 0;
      
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
        
        const vendaAno = dataEncerramento.getFullYear();
        
        // Soma todos os resultados do ano da meta
        if (vendaAno === meta.ano) {
          totalResultadoAno += resultado;
        }
      });

      const progresso = (totalResultadoAno / metaValor) * 100;
      
      return {
        atual: totalResultadoAno,
        progresso: Math.min(progresso, 100),
        restante: Math.max(metaValor - totalResultadoAno, 0)
      };
    }
  };

  const handleAddMeta = async () => {
    if (!novaMetaValor) return;

    const valor = parseCurrencyToNumber(novaMetaValor);
    if (isNaN(valor)) return;

    await addMeta({
      tipo: novaMetaTipo,
      valor,
      ano: novaMetaTipo === "anual" ? parseInt(novaMetaAno) : new Date().getFullYear()
    });

    setNovaMetaValor("");
    setNovaMetaTipo("mensal");
    setNovaMetaAno(new Date().getFullYear().toString());
    setIsDialogOpen(false);
  };

  const handleCurrencyChange = (value: string) => {
    const formatted = formatCurrencyInput(value);
    setNovaMetaValor(formatted);
  };

  const getMetaTitulo = (meta: Meta) => {
    const metaTipo = meta["m-mensal"] > 0 ? "mensal" : "anual";
    if (metaTipo === "mensal") {
      return "Meta mensal";
    }
    return `Meta ${meta.ano}`;
  };

  const getMetaIcon = (meta: Meta) => {
    const metaTipo = meta["m-mensal"] > 0 ? "mensal" : "anual";
    return metaTipo === "mensal" ? Calendar : CalendarDays;
  };

  const getProgressColor = (progresso: number) => {
    if (progresso >= 100) return "success";
    if (progresso >= 51) return "warning";
    return "danger";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Metas</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: '#61005D' }}>
              <Plus className="mr-2 h-4 w-4" />
              Nova meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar nova meta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tipo">Tipo de meta</Label>
                <Select value={novaMetaTipo} onValueChange={(value: "mensal" | "anual") => setNovaMetaTipo(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {novaMetaTipo === "anual" && (
                <div>
                  <Label htmlFor="ano">Ano</Label>
                  <Input
                    id="ano"
                    type="number"
                    value={novaMetaAno}
                    onChange={(e) => setNovaMetaAno(e.target.value)}
                    min="2020"
                    max="2030"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="valor">Valor da meta (R$)</Label>
                <Input
                  id="valor"
                  value={novaMetaValor}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  placeholder="1.000,00"
                  className="placeholder-subtle"
                />
              </div>
              
              <Button onClick={handleAddMeta} className="w-full" style={{ backgroundColor: '#61005D' }}>
                Cadastrar meta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {metas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma meta cadastrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              Cadastre suas metas de ganho mensal e anual para acompanhar seu progresso
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {metas.map((meta) => {
            const { atual, progresso, restante } = calcularProgresso(meta);
            const metaValor = meta["m-mensal"] > 0 ? meta["m-mensal"] : meta["m-anual"] || 0;
            const metaTipo = meta["m-mensal"] > 0 ? "mensal" : "anual";
            
            const MetaIcon = getMetaIcon(meta);
            
            return (
              <Card key={meta["meta-id"]}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MetaIcon className="h-5 w-5" />
                    {getMetaTitulo(meta)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Meta:</span>
                    <span className="font-semibold">{formatCurrency(metaValor)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{metaTipo === "mensal" ? "Média atual:" : "Atual:"}</span>
                    <span className="font-semibold text-primary">{formatCurrency(atual)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progresso</span>
                      <span>{progresso.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={progresso} 
                      colorVariant={getProgressColor(progresso)}
                      className="h-3" 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Restante:</span>
                    <span className="font-semibold text-muted-foreground">{formatCurrency(restante)}</span>
                  </div>
                  
                  {progresso >= 100 && (
                    <div className="text-center text-sm font-medium text-green-600 bg-green-50 py-2 px-3 rounded-md">
                      🎉 Meta atingida!
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Metas;