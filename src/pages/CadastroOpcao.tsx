import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useOpcoes } from "@/hooks/useOpcoes";
import { useGarantias } from "@/hooks/useGarantias";
import { useAuth } from "@/context/AuthContext";
import { Opcao } from "@/types/database";
import { formatDateForInput, formatCurrency as formatCurrencyDisplay, formatPercentage, parseLocalDate } from "@/utils/formatters";
import { formatCurrency, formatNumber, parseCurrencyToNumber, parseNumberToInt } from "@/utils/inputFormatters";
import { CalendarIcon, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function CadastroOpcao() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addOpcao } = useOpcoes(user?.id || '');
  const { garantias } = useGarantias({ userId: user?.id });
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Função para obter a próxima data útil (não fim de semana)
  const getNextBusinessDay = () => {
    const today = new Date();
    let nextBusinessDay = new Date(today);
    
    // Se hoje é sábado (6), adicionar 2 dias para segunda
    // Se hoje é domingo (0), adicionar 1 dia para segunda
    const dayOfWeek = today.getDay();
    if (dayOfWeek === 6) {
      nextBusinessDay.setDate(today.getDate() + 2);
    } else if (dayOfWeek === 0) {
      nextBusinessDay.setDate(today.getDate() + 1);
    }
    
    return nextBusinessDay;
  };
  
  const [formData, setFormData] = useState({
    opcao: "",
    operacao: "",
    tipo: "",
    acao: "",
    strike: "",
    cotacao: "",
    quantidade: "",
    premio: "",
    data: formatDateForInput(getNextBusinessDay()),
    status: "aberta",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const opcaoData = {
        opcao: formData.opcao,
        operacao: formData.operacao,
        tipo: formData.tipo || null,
        acao: formData.acao || null,
        strike: formData.strike ? parseCurrencyToNumber(formData.strike) : null,
        cotacao: formData.cotacao ? parseCurrencyToNumber(formData.cotacao) : null,
        quantidade: formData.quantidade ? parseNumberToInt(formData.quantidade) : null,
        premio: formData.premio ? parseCurrencyToNumber(formData.premio) : null,
        data: formData.data || null,
        status: "aberta", // Sempre definir como "aberta"
      };

      await addOpcao(opcaoData);
      
      toast({
        title: "✅ Sucesso!",
        description: "Opção cadastrada com sucesso.",
        className: "border-green-200 bg-green-50 text-green-900",
      });

      // Limpar formulário após sucesso
      setFormData({
        opcao: "",
        operacao: "",
        tipo: "",
        acao: "",
        strike: "",
        cotacao: "",
        quantidade: "",
        premio: "",
        data: formatDateForInput(getNextBusinessDay()),
        status: "aberta",
      });
    } catch (error) {
      console.error("Erro ao cadastrar opção:", error);
      toast({
        variant: "destructive",
        title: "❌ Erro!",
        description: "Erro ao cadastrar opção. Tente novamente.",
        className: "border-red-200 bg-red-50 text-red-900",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (field: string, value: string) => {
    const formatted = formatCurrency(value);
    setFormData(prev => ({ ...prev, [field]: formatted }));
  };

  const handleNumberChange = (field: string, value: string) => {
    const formatted = formatNumber(value);
    setFormData(prev => ({ ...prev, [field]: formatted }));
  };

  const handleOpcaoChange = (value: string) => {
    // Converte para maiúsculo
    const upperValue = value.toUpperCase();
    
    // Permite apenas letras, números e W
    const cleanValue = upperValue.replace(/[^A-Z0-9W]/g, '');
    
    // Validação progressiva baseada na regra:
    // - 5 letras obrigatórias + 3 números obrigatórios (mínimo 8 caracteres)
    // - Opcionalmente: + W + 1 número (máximo 10 caracteres)
    // - Se tiver W, é obrigatório ter o número após ele
    let isValid = false;
    let validValue = '';
    
    if (cleanValue.length === 0) {
      // Permite campo vazio
      isValid = true;
      validValue = '';
    } else if (cleanValue.length <= 5) {
      // Primeiros 5 caracteres devem ser apenas letras
      if (/^[A-Z]{1,5}$/.test(cleanValue)) {
        isValid = true;
        validValue = cleanValue;
      }
    } else if (cleanValue.length <= 8) {
      // 5 letras + 1 a 3 números (obrigatório ter exatamente 3 números no final)
      // Mas durante a digitação, permite progressivamente 1, 2 ou 3 números
      if (/^[A-Z]{5}[0-9]{1,3}$/.test(cleanValue)) {
        isValid = true;
        validValue = cleanValue;
      }
    } else if (cleanValue.length === 9) {
      // 5 letras + 3 números + W (opcional, mas se tiver W precisa ter número)
      if (/^[A-Z]{5}[0-9]{3}W$/.test(cleanValue)) {
        isValid = true;
        validValue = cleanValue;
      }
    } else if (cleanValue.length === 10) {
      // 5 letras + 3 números + W + 1 número (opcional completo)
      if (/^[A-Z]{5}[0-9]{3}W[0-9]{1}$/.test(cleanValue)) {
        isValid = true;
        validValue = cleanValue;
      }
    }
    
    if (isValid) {
      setFormData(prev => ({ 
        ...prev, 
        opcao: validValue,
        // Preencher automaticamente o campo ação com as 4 primeiras letras
        // Só preenche se tiver pelo menos 4 letras
        acao: validValue.length >= 4 ? validValue.substring(0, 4) : prev.acao
      }));
    }
  };

  const handleAcaoChange = (value: string) => {
    // Converte para maiúsculo
    const upperValue = value.toUpperCase();
    
    // Permite apenas letras e números
    const cleanValue = upperValue.replace(/[^A-Z0-9]/g, '');
    
    // Valida formato: 4 letras seguidas de 1 ou 2 números
    const regex = /^[A-Z]{0,4}[0-9]{0,2}$/;
    
    if (regex.test(cleanValue) && cleanValue.length <= 6) {
      setFormData(prev => ({ ...prev, acao: cleanValue }));
    }
  };

  const handleDateIconClick = () => {
    const dateInput = document.getElementById('data') as HTMLInputElement;
    if (dateInput) {
      dateInput.showPicker();
    }
  };

  // Calcular dados da operação para o card lateral
  const calculateOperationData = () => {
    const strike = parseCurrencyToNumber(formData.strike);
    const cotacao = parseCurrencyToNumber(formData.cotacao);
    const quantidade = parseNumberToInt(formData.quantidade);
    const premio = parseCurrencyToNumber(formData.premio);

    let percentualDiferenca = 0;
    let valorTotal = 0;
    let valorTotalLabel = "";
    let isGanho = true;
    let nivelRisco = "baixo";
    let corRisco = "text-green-600";
    let progressValue = 100;

    if (strike > 0 && cotacao > 0) {
      // Calcular diferença baseado no tipo de opção
      if (formData.tipo === "call") {
        percentualDiferenca = ((strike - cotacao) / cotacao) * 100;
      } else if (formData.tipo === "put") {
        percentualDiferenca = ((cotacao - strike) / cotacao) * 100;
      }
      
      // Determinar nível de risco baseado na operação e tipo
      const diferencaAbsoluta = Math.abs(percentualDiferenca);
      
      if (formData.operacao === "compra" && formData.tipo === "call") {
        // Compra Call: quanto menor a diferença, menor o risco
        if (percentualDiferenca < 0) {
          nivelRisco = "baixíssimo";
          corRisco = "text-green-600";
          progressValue = 10;
        } else if (diferencaAbsoluta <= 4) {
          nivelRisco = "baixo";
          corRisco = "text-green-600";
          progressValue = 50;
        } else if (diferencaAbsoluta <= 6) {
          nivelRisco = "médio";
          corRisco = "text-yellow-600";
          progressValue = 70;
        } else {
          nivelRisco = "alto";
          corRisco = "text-red-600";
          progressValue = 90;
        }
      } else if (formData.operacao === "compra" && formData.tipo === "put") {
        // Compra Put: quanto menor a diferença, menor o risco
        if (percentualDiferenca < 0) {
          nivelRisco = "baixíssimo";
          corRisco = "text-emerald-600";
          progressValue = 10;
        } else if (diferencaAbsoluta <= 4) {
          nivelRisco = "baixo";
          corRisco = "text-green-600";
          progressValue = 50;
        } else if (diferencaAbsoluta <= 6) {
          nivelRisco = "médio";
          corRisco = "text-yellow-600";
          progressValue = 70;
        } else {
          nivelRisco = "alto";
          corRisco = "text-red-600";
          progressValue = 90;
        }
      } else if (formData.operacao === "venda" && formData.tipo === "put") {
        // Venda Put: quanto maior a diferença, menor o risco
        if (percentualDiferenca < 0) {
          nivelRisco = "altíssimo";
          corRisco = "text-red-800";
          progressValue = 90;
        } else if (diferencaAbsoluta <= 4) {
          nivelRisco = "alto";
          corRisco = "text-red-600";
          progressValue = 70;
        } else if (diferencaAbsoluta <= 6) {
          nivelRisco = "médio";
          corRisco = "text-yellow-600";
          progressValue = 50;
        } else {
          nivelRisco = "baixo";
          corRisco = "text-green-600";
          progressValue = 20;
        }
       } else {
         // Venda Call: lógica original
         if (percentualDiferenca < 0) {
           nivelRisco = "altíssimo";
           corRisco = "text-red-800";
           progressValue = 90;
         } else if (percentualDiferenca > 0 && diferencaAbsoluta > 6) {
           nivelRisco = "baixo";
           corRisco = "text-green-600";
           progressValue = 20;
         } else if (percentualDiferenca > 0 && diferencaAbsoluta > 3) {
           nivelRisco = "médio";
           corRisco = "text-yellow-600";
           progressValue = 50;
         } else {
           nivelRisco = "alto";
           corRisco = "text-red-600";
           progressValue = 70;
         }
       }
    }

    if (premio > 0 && quantidade > 0) {
      valorTotal = premio * quantidade;
      
      if (formData.operacao === "venda") {
        valorTotalLabel = "Ganho máximo";
        isGanho = true;
      } else {
        valorTotalLabel = "Perda máxima";
        isGanho = false;
        valorTotal = -valorTotal;
      }
    }

    // Calcular informações de exercício
    let valorExercicio = 0;
    let quantidadeAcoes = 0;
    let mostrarValorExercicio = false;
    let mostrarQuantidadeAcoes = false;

    if (quantidade > 0 && strike > 0) {
      valorExercicio = quantidade * strike;
      quantidadeAcoes = quantidade;

      // Call + Compra ou Put + Venda = mostrar valor em reais
      if ((formData.tipo === "call" && formData.operacao === "compra") || 
          (formData.tipo === "put" && formData.operacao === "venda")) {
        mostrarValorExercicio = true;
      }

      // Put + Compra ou Call + Venda = mostrar quantidade de ações
      if ((formData.tipo === "put" && formData.operacao === "compra") || 
          (formData.tipo === "call" && formData.operacao === "venda")) {
        mostrarQuantidadeAcoes = true;
      }
    }

    // Calcular percentual de ganho/perda em relação à garantia
    let percentualRelativoGarantia = 0;
    let labelPercentualGarantia = "";
    let isGanhoGarantia = false;

    if (quantidade > 0 && strike > 0 && premio > 0) {
      const garantia = strike * quantidade;
      const premioTotal = premio * quantidade;

      if (formData.operacao === "compra") {
        // Compra Call ou Compra Put: Perda máxima
        percentualRelativoGarantia = (-premioTotal / garantia) * 100;
        labelPercentualGarantia = "Perda máxima";
        isGanhoGarantia = false;
      } else {
        // Venda Put ou Venda Call: Ganho máximo
        percentualRelativoGarantia = (premioTotal / garantia) * 100;
        labelPercentualGarantia = "Ganho máximo";
        isGanhoGarantia = true;
      }
    }

    // Calcular alavancagem
    let mostrarAlavancagem = false;
    let statusAlavancagem = "";
    let isAlavancado = false;
    let quantidadeAlavancada = 0;

    if (quantidade > 0 && strike > 0) {
      // Venda de Call ou Compra de Put = precisa garantia em AÇÕES
      const precisaGarantiaAcao = 
        (formData.operacao === "venda" && formData.tipo === "call") ||
        (formData.operacao === "compra" && formData.tipo === "put");

      // Venda de Put ou Compra de Call = precisa garantia em RENDA FIXA
      const precisaGarantiaRendaFixa = 
        (formData.operacao === "venda" && formData.tipo === "put") ||
        (formData.operacao === "compra" && formData.tipo === "call");

      if (precisaGarantiaAcao && formData.acao) {
        mostrarAlavancagem = true;
        
        // Buscar garantia cadastrada para esse ticker
        const garantiaAcao = garantias.find(g => 
          g.tipo === 'acao' && g.ticker === formData.acao
        );
        
        // Usar quantidade LIVRE (descontando o que já está em garantia)
        const quantidadeLivre = garantiaAcao?.quantidadeLivre || 0;
        
        if (quantidade <= quantidadeLivre) {
          statusAlavancagem = "Coberto";
          isAlavancado = false;
        } else {
          quantidadeAlavancada = quantidade - quantidadeLivre;
          statusAlavancagem = `Alavancado em ${quantidadeAlavancada} ações`;
          isAlavancado = true;
        }
      } else if (precisaGarantiaRendaFixa) {
        mostrarAlavancagem = true;
        
        // Calcular valor necessário
        const valorNecessario = strike * quantidade;
        
        // Somar todo o valor LIVRE de todas as rendas fixas
        const valorRendaFixaLivre = garantias
          .filter(g => g.tipo === 'renda_fixa')
          .reduce((total, g) => total + (g.valorLivre || 0), 0);
        
        if (valorNecessario <= valorRendaFixaLivre) {
          statusAlavancagem = "Coberto";
          isAlavancado = false;
        } else {
          const valorAlavancado = valorNecessario - valorRendaFixaLivre;
          statusAlavancagem = `Alavancado em ${formatCurrencyDisplay(valorAlavancado)}`;
          isAlavancado = true;
        }
      }
    }

    return {
      percentualDiferenca,
      valorTotal,
      valorTotalLabel,
      isGanho,
      nivelRisco,
      corRisco,
      progressValue,
      valorExercicio,
      quantidadeAcoes,
      mostrarValorExercicio,
      mostrarQuantidadeAcoes,
      percentualRelativoGarantia,
      labelPercentualGarantia,
      isGanhoGarantia,
      mostrarAlavancagem,
      statusAlavancagem,
      isAlavancado,
      quantidadeAlavancada
    };
  };

  const operationData = calculateOperationData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cadastro de opção</h1>
        <p className="text-muted-foreground">
          Adicione uma nova operação de opção ao seu portfólio
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-1 lg:max-w-2xl w-full">
          <CardHeader>
            <CardTitle>Nova opção</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Primeira linha: Nome da opção e Ação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="opcao">Nome da opção</Label>
                  <Input
                    id="opcao"
                    value={formData.opcao}
                    onChange={(e) => handleOpcaoChange(e.target.value)}
                    placeholder="ex: PETRH123"
                    className="placeholder-subtle"
                    maxLength={10}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="acao">Ação</Label>
                  <Input
                    id="acao"
                    value={formData.acao}
                    onChange={(e) => handleAcaoChange(e.target.value)}
                    placeholder="ex: PETR4"
                    className="placeholder-subtle"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              {/* Segunda linha: Operação e Tipo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="operacao">Operação</Label>
                  <Select
                    value={formData.operacao}
                    onValueChange={(value) => handleInputChange("operacao", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a operação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compra">Compra</SelectItem>
                      <SelectItem value="venda">Venda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => handleInputChange("tipo", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="put">Put</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Demais campos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="strike">Strike (R$)</Label>
                  <Input
                    id="strike"
                    value={formData.strike}
                    onChange={(e) => handleCurrencyChange("strike", e.target.value)}
                    placeholder="0,00"
                    className="placeholder-subtle"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cotacao">Cotação (R$)</Label>
                  <Input
                    id="cotacao"
                    value={formData.cotacao}
                    onChange={(e) => handleCurrencyChange("cotacao", e.target.value)}
                    placeholder="0,00"
                    className="placeholder-subtle"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input
                    id="quantidade"
                    value={formData.quantidade}
                    onChange={(e) => handleNumberChange("quantidade", e.target.value)}
                    placeholder="100"
                    className="placeholder-subtle"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="premio">Prêmio (R$)</Label>
                  <Input
                    id="premio"
                    value={formData.premio}
                    onChange={(e) => handleCurrencyChange("premio", e.target.value)}
                    placeholder="0,00"
                    className="placeholder-subtle"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="data">Vencimento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                          !formData.data && "text-muted-foreground"
                        )}
                      >
                        {formData.data ? (
                          format(parseLocalDate(formData.data), "dd/MM/yyyy")
                        ) : (
                          <span>Selecione a data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.data ? parseLocalDate(formData.data) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            // Usar formato ISO sem conversão de fuso horário
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const dateString = `${year}-${month}-${day}`;
                            handleInputChange("data", dateString);
                          }
                        }}
                        disabled={(date) => {
                          // Desabilitar sábados (6) e domingos (0)
                          const dayOfWeek = date.getDay();
                          return dayOfWeek === 0 || dayOfWeek === 6;
                        }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/opcoes")}
                  >
                    Cancelar
                  </Button>
                <Button type="submit" disabled={loading} style={{ backgroundColor: '#263C64' }}>
                  {loading ? "Cadastrando..." : "Cadastrar opção"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Card lateral com análise de risco */}
        <Card className="w-full lg:w-80 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Análise de risco
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Valor de exercício (Call+Compra ou Put+Venda) */}
            {operationData.mostrarValorExercicio && (
              <div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <Label className="text-sm font-medium">
                          Valor de Exercício
                        </Label>
                        <p className="text-lg font-bold text-foreground">
                          {formatCurrencyDisplay(operationData.valorExercicio)}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        Valor em reais necessário caso a opção seja exercida (Quantidade × Strike). Não considera taxas da corretora.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}

            {/* Quantidade de ações necessárias (Put+Compra ou Call+Venda) */}
            {operationData.mostrarQuantidadeAcoes && (
              <div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <Label className="text-sm font-medium">
                          Ações Necessárias
                        </Label>
                        <p className="text-lg font-bold text-foreground">
                          {operationData.quantidadeAcoes.toLocaleString('pt-BR')} ações
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatCurrencyDisplay(operationData.valorExercicio)}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        Quantidade de ações que você precisa ter na carteira para esta operação. O valor representa Quantidade × Strike.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}

            {/* Diferença percentual Strike vs Cotação */}
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <Label className="text-sm font-medium">
                        Diferença Strike vs Cotação
                      </Label>
                      <p className={`text-lg font-bold ${
                        operationData.percentualDiferenca >= 0 
                          ? 'text-emerald-600' 
                          : 'text-orange-600'
                      }`}>
                        {formatPercentage(operationData.percentualDiferenca)}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      {formData.tipo === "call" 
                        ? operationData.percentualDiferenca >= 0
                          ? "Strike acima da cotação (fora do dinheiro)"
                          : "Strike abaixo da cotação (dentro do dinheiro)"
                        : operationData.percentualDiferenca >= 0
                          ? "Cotação acima do strike (fora do dinheiro)"
                          : "Cotação abaixo do strike (dentro do dinheiro)"
                      }
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Valor total do prêmio */}
            <div className="mb-8">
              <Label className="text-sm font-medium">{operationData.valorTotalLabel}</Label>
              <p className={`text-lg font-bold ${operationData.isGanho ? 'text-green-600' : 'text-red-600'}`}>
                {operationData.valorTotal !== 0 ? formatCurrencyDisplay(operationData.valorTotal) : '-'}
              </p>
            </div>

            {/* Percentual em relação à garantia */}
            {operationData.percentualRelativoGarantia !== 0 && (
              <div className="mb-8">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <Label className="text-sm font-medium">
                          {operationData.labelPercentualGarantia} (% garantia)
                        </Label>
                        <p className={`text-lg font-bold ${operationData.isGanhoGarantia ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(operationData.percentualRelativoGarantia)}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        {operationData.isGanhoGarantia 
                          ? "Percentual de ganho máximo em relação ao valor da garantia (Strike × Quantidade)"
                          : "Percentual de perda máxima em relação ao valor da garantia (Strike × Quantidade)"
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}

            {/* Alavancagem */}
            {operationData.mostrarAlavancagem && (
              <div className="mb-8">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <Label className="text-sm font-medium">Alavancagem</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {operationData.isAlavancado ? (
                            <>
                              <AlertTriangle className="h-5 w-5 text-orange-600" />
                              <p className="text-lg font-bold text-orange-600">
                                {operationData.statusAlavancagem}
                              </p>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <p className="text-lg font-bold text-green-600">
                                {operationData.statusAlavancagem}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        {(() => {
                          const precisaRendaFixa = 
                            (formData.operacao === "venda" && formData.tipo === "put") ||
                            (formData.operacao === "compra" && formData.tipo === "call");
                          
                          if (operationData.isAlavancado) {
                            return precisaRendaFixa
                              ? "Você não possui renda fixa suficiente cadastrada em garantia para cobrir esta operação."
                              : `Você não possui ações suficientes cadastradas em garantia para cobrir esta operação. Está alavancado em ${operationData.quantidadeAlavancada} ações.`;
                          } else {
                            return precisaRendaFixa
                              ? "Você possui renda fixa suficiente cadastrada em garantia para cobrir esta operação."
                              : "Você possui ações suficientes cadastradas em garantia para cobrir esta operação.";
                          }
                        })()}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}

            {/* Nível de risco */}
            <div>
              <div className="mb-2">
                <Label className="text-sm font-medium">Nível de Risco</Label>
              </div>
              
              <div className="flex flex-col items-center">
                {/* Meio círculo de progresso */}
                <div className="relative w-52 h-26 mb-3">
                  <svg className="w-52 h-26" viewBox="0 0 208 104">
                    {/* Background semicircle */}
                    <path
                      d="M 26 104 A 78 78 0 0 1 182 104"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="16"
                      strokeLinecap="round"
                    />
                    {/* Progress semicircle */}
                    <path
                      d="M 26 104 A 78 78 0 0 1 182 104"
                      fill="none"
                      stroke={
                        operationData.nivelRisco === 'baixíssimo' ? 'hsl(160 84% 39%)' :
                        operationData.nivelRisco === 'muito baixo' ? 'hsl(160 84% 39%)' :
                        operationData.nivelRisco === 'baixo' ? 'hsl(142 76% 36%)' :
                        operationData.nivelRisco === 'médio' ? 'hsl(45 93% 47%)' :
                        operationData.nivelRisco === 'alto' ? 'hsl(0 84% 60%)' :
                        operationData.nivelRisco === 'altíssimo' ? 'hsl(0 72% 50%)' :
                        'hsl(0 72% 50%)'
                      }
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeDasharray={`${(operationData.progressValue / 100) * 245.1} 245.1`}
                      className="transition-all duration-700 ease-in-out"
                    />
                  </svg>
                  
                  {/* Texto central */}
                  <div className="absolute inset-0 flex items-end justify-center pb-1">
                    <span className={`text-sm font-semibold ${operationData.corRisco}`}>
                      {operationData.nivelRisco}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}