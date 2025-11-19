import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOpcoes } from "@/hooks/useOpcoes";
import { useGarantias } from "@/hooks/useGarantias";
import { useAuth } from "@/context/AuthContext";
import { formatDateForInput, formatCurrency as formatCurrencyDisplay, formatPercentage, parseLocalDate } from "@/utils/formatters";
import { formatCurrency, formatNumber, parseCurrencyToNumber, parseNumberToInt } from "@/utils/inputFormatters";
import { CalendarIcon, AlertTriangle, CheckCircle, DollarSign, Pencil, TrendingUp, TrendingDown, Building2, ArrowBigDownDash, ArrowBigUpDash } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";

// ESTRATÉGIAS MAPEADAS
const STRATEGIES = [
  {
    id: "renda_extra_acoes",
    group: "Renda extra",
    title: "Com ações",
    subtitle: "venda de call",
    operacao: "venda",
    tipo: "call",
    disabled: false,
    headerTitle: "Renda extra - venda de call",
    icon: Building2, // <--- Referência ao ícone importado
    colorClass: "bg-blue-100 text-blue-700" // <--- Classe de cor

  },
  {
    id: "renda_extra_dinheiro",
    group: "Renda extra",
    title: "Com dinheiro",
    subtitle: "venda de put",
    operacao: "venda",
    tipo: "put",
    disabled: false,
    headerTitle: "Renda extra - venda de put",
    icon: DollarSign,
    colorClass: "bg-blue-100 text-blue-700"
  },
  {
    id: "alta_infinita",
    group: "Operar a alta",
    title: "Alta infinita",
    subtitle: "compra a seco - call",
    operacao: "compra",
    tipo: "call",
    disabled: false,
    headerTitle: "Compra de call",
    icon: ArrowBigUpDash,
    colorClass: "bg-green-100 text-green-700"
  },
  {
    id: "alta_moderada",
    group: "Operar a alta",
    title: "Alta moderada",
    subtitle: "trava de alta - call",
    operacao: "",
    tipo: "",
    disabled: true,
    headerTitle: "",
    icon: TrendingUp,
    colorClass: "bg-green-100 text-green-700"
  },
  {
    id: "queda_infinita",
    group: "Operar a baixa",
    title: "Queda infinita",
    subtitle: "venda a seco - put",
    operacao: "compra",
    tipo: "put",
    disabled: false,
    headerTitle: "Compra de put",
    icon: ArrowBigDownDash,
    colorClass: "bg-red-100 text-red-700"
  },
  {
    id: "queda_moderada",
    group: "Operar a baixa",
    title: "Queda moderada",
    subtitle: "trava de baixa - put",
    operacao: "",
    tipo: "",
    disabled: true,
    headerTitle: "",
    icon: TrendingDown,
    colorClass: "bg-red-100 text-red-700"
  }
];

// Helper para converter cores Tailwind em Hex para o gradiente CSS
const getRiskColorHex = (className: string) => {
  if (className.includes("emerald")) return "#10b981";
  if (className.includes("green")) return "#16a34a";
  if (className.includes("yellow")) return "#ca8a04";
  if (className.includes("red-800")) return "#991b1b";
  if (className.includes("red")) return "#dc2626";
  return "#16a34a"; // Default green
};

export default function CadastroOpcao() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addOpcao } = useOpcoes(user?.id || '');
  const { garantias } = useGarantias({ userId: user?.id });
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState(1);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>("renda_extra_acoes");
  const [volatilidade, setVolatilidade] = useState<number>(0.40); // Default 40%

  const getNextBusinessDay = () => {
    const today = new Date();
    let nextBusinessDay = new Date(today);
    const dayOfWeek = today.getDay();
    if (dayOfWeek === 6) {
      nextBusinessDay.setDate(today.getDate() + 2);
    } else if (dayOfWeek === 0) {
      nextBusinessDay.setDate(today.getDate() + 1);
    }
    return nextBusinessDay;
  };

  const calculateBusinessDays = (startDate: Date, endDate: Date) => {
    let count = 0;
    const curDate = new Date(startDate.getTime());
    while (curDate < endDate) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
      curDate.setDate(curDate.getDate() + 1);
    }
    return count < 1 ? 1 : count; // Force at least 1 day
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

  const handleContinueToForm = () => {
    const strategy = STRATEGIES.find(s => s.id === selectedStrategyId);
    if (strategy) {
      setFormData(prev => ({
        ...prev,
        operacao: strategy.operacao,
        tipo: strategy.tipo
      }));
      setStep(2);
    }
  };

  const handleBackToStrategies = () => {
    setStep(1);
  };

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
        status: "aberta",
      };

      await addOpcao(opcaoData);

      toast({
        title: "✅ Sucesso!",
        description: "Opção cadastrada com sucesso.",
        className: "border-green-200 bg-green-50 text-green-900",
      });

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
      setStep(1);
      setSelectedStrategyId("renda_extra_acoes");

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
    const upperValue = value.toUpperCase();
    const cleanValue = upperValue.replace(/[^A-Z0-9W]/g, '');

    let isValid = false;
    let validValue = '';

    if (cleanValue.length === 0) {
      isValid = true;
      validValue = '';
    } else if (cleanValue.length <= 5) {
      if (/^[A-Z]{1,5}$/.test(cleanValue)) {
        isValid = true;
        validValue = cleanValue;
      }
    } else if (cleanValue.length <= 8) {
      if (/^[A-Z]{5}[0-9]{1,3}$/.test(cleanValue)) {
        isValid = true;
        validValue = cleanValue;
      }
    } else if (cleanValue.length === 9) {
      if (/^[A-Z]{5}[0-9]{3}W$/.test(cleanValue)) {
        isValid = true;
        validValue = cleanValue;
      }
    } else if (cleanValue.length === 10) {
      if (/^[A-Z]{5}[0-9]{3}W[0-9]{1}$/.test(cleanValue)) {
        isValid = true;
        validValue = cleanValue;
      }
    }

    if (isValid) {
      setFormData(prev => ({
        ...prev,
        opcao: validValue,
        // Removed local logic to ensure we only use the DB value
        // acao: validValue.length >= 4 ? validValue.substring(0, 4) : prev.acao
      }));
    }
  };

  // Auto-fill Ação based on Ticker using Supabase
  useEffect(() => {
    const fetchAcao = async () => {
      const ticker = formData.opcao;

      // If ticker is too short, clear action
      if (!ticker || ticker.length < 4) {
        setFormData(prev => ({ ...prev, acao: "" }));
        return;
      }

      const prefix = ticker.substring(0, 4);

      try {
        const { data, error } = await supabase
          .from('cod_ops' as any) // Casting to any because table might not be in types yet
          .select('ops_acao')
          .eq('ops_ticker', prefix)
          .maybeSingle();

        if (data && (data as any).ops_acao) {
          setFormData(prev => ({ ...prev, acao: (data as any).ops_acao }));
        } else {
          // If not found in DB, use the first 4 letters
          setFormData(prev => ({ ...prev, acao: prefix }));
        }
      } catch (err) {
        console.error("Erro ao buscar ação:", err);
        // Fallback on error
        setFormData(prev => ({ ...prev, acao: prefix }));
      }
    };

    const timeoutId = setTimeout(() => {
      fetchAcao();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.opcao]);

  // Fetch Volatility based on Ação
  useEffect(() => {
    const fetchVolatilidade = async () => {
      if (!formData.acao || formData.acao.length < 4) {
        setVolatilidade(0.40);
        return;
      }

      try {
        // First try to find by joining with cod_ops if needed, or directly from ativos_parametros
        // Assuming ativos_parametros links to cod_ops via cod_ops_id, we first need the ID of the stock in cod_ops
        // Or maybe we can search by ticker if the structure allows.
        // Based on instructions: "fazendo join com cod_ops se necessário ou buscando direto pelo ticker"

        // Let's try to find the ID in cod_ops first for the ACTION (not the option ticker)
        const { data: acaoData, error: acaoError } = await supabase
          .from('cod_ops' as any)
          .select('id')
          .eq('ops_ticker', formData.acao)
          .maybeSingle();

        if (acaoData && (acaoData as any).id) {
          const { data: paramData, error: paramError } = await supabase
            .from('ativos_parametros' as any)
            .select('volatilidade_anual')
            .eq('cod_ops_id', (acaoData as any).id)
            .maybeSingle();

          if (paramData && (paramData as any).volatilidade_anual) {
            setVolatilidade(Number((paramData as any).volatilidade_anual));
            return;
          }
        }

        // If we couldn't find it via ID, or no param data, default to 0.40
        setVolatilidade(0.40);

      } catch (err) {
        console.error("Erro ao buscar volatilidade:", err);
        setVolatilidade(0.40);
      }
    };

    fetchVolatilidade();
  }, [formData.acao]);

  const acaoInputRef = useRef<HTMLInputElement>(null);

  const handleAcaoFocus = () => {
    if (acaoInputRef.current) {
      const length = acaoInputRef.current.value.length;
      // Set cursor to the end
      setTimeout(() => {
        acaoInputRef.current?.setSelectionRange(length, length);
      }, 0);
    }
  };

  const handleAcaoChange = (value: string) => {
    const upperValue = value.toUpperCase();
    const cleanValue = upperValue.replace(/[^A-Z0-9]/g, '');
    const regex = /^[A-Z]{0,4}[0-9]{0,2}$/;

    if (regex.test(cleanValue) && cleanValue.length <= 6) {
      setFormData(prev => ({ ...prev, acao: cleanValue }));
    }
  };

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
    let progressValue = 0; // 0 a 100

    if (strike > 0 && cotacao > 0) {
      // Calculate percentage difference for display
      if (formData.tipo === "call") {
        percentualDiferenca = ((strike - cotacao) / cotacao) * 100;
      } else if (formData.tipo === "put") {
        percentualDiferenca = ((cotacao - strike) / cotacao) * 100;
      }

      // --- NEW RISK CALCULATION LOGIC ---

      // PASSO A: Definir se é ITM ou OTM
      let isITM = false;
      if (formData.tipo === "call") {
        // Call ITM: Spot > Strike
        isITM = cotacao > strike;
      } else {
        // Put ITM: Spot < Strike
        isITM = cotacao < strike;
      }

      // PASSO B: Calcular o Score (Z-Score)
      // Score = | ln(Spot / Strike) / (Vol * sqrt(Days / 252)) |
      const today = new Date();
      const vencimento = formData.data ? parseLocalDate(formData.data) : getNextBusinessDay();
      const diasUteis = calculateBusinessDays(today, vencimento);

      const timeToMaturity = diasUteis / 252;
      const vol = volatilidade; // from state

      let score = 0;
      if (vol > 0 && timeToMaturity > 0) {
        const logReturn = Math.log(cotacao / strike);
        const denominator = vol * Math.sqrt(timeToMaturity);
        score = Math.abs(logReturn / denominator);
      }

      // PASSO C: Aplicar Regras de Negócio

      // CENÁRIO 1: Operação VENDA (Short)
      if (formData.operacao === "venda") {
        if (isITM) {
          // Venda ITM -> Altíssimo Risco
          nivelRisco = "Altíssimo";
          corRisco = "text-red-800";
          progressValue = 95;
        } else {
          // Venda OTM -> Analisar Score
          if (score <= 0.50) {
            nivelRisco = "Alto";
            corRisco = "text-red-600";
            progressValue = 80;
          } else if (score <= 1.50) {
            nivelRisco = "Médio";
            corRisco = "text-yellow-600";
            progressValue = 50;
          } else {
            // Score > 1.50
            nivelRisco = "Baixo";
            corRisco = "text-green-600";
            progressValue = 20;
          }
        }
      }
      // CENÁRIO 2: Operação COMPRA (Long)
      else {
        if (isITM) {
          // Compra ITM -> Baixíssimo Risco (já tem valor intrínseco)
          nivelRisco = "Baixíssimo";
          corRisco = "text-emerald-600";
          progressValue = 15;
        } else {
          // Compra OTM -> Analisar Score (Risco de virar pó)
          if (score <= 0.50) {
            nivelRisco = "Baixo";
            corRisco = "text-green-600";
            progressValue = 35;
          } else if (score <= 1.50) {
            nivelRisco = "Médio";
            corRisco = "text-yellow-600";
            progressValue = 65;
          } else {
            // Score > 1.50 (Muito longe do dinheiro)
            nivelRisco = "Alto";
            corRisco = "text-red-600";
            progressValue = 90;
          }
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

    let valorExercicio = 0;
    let quantidadeAcoes = 0;
    let mostrarValorExercicio = false;
    let mostrarQuantidadeAcoes = false;

    if (quantidade > 0 && strike > 0) {
      valorExercicio = quantidade * strike;
      quantidadeAcoes = quantidade;
      if ((formData.tipo === "call" && formData.operacao === "compra") ||
        (formData.tipo === "put" && formData.operacao === "venda")) {
        mostrarValorExercicio = true;
      }
      if ((formData.tipo === "put" && formData.operacao === "compra") ||
        (formData.tipo === "call" && formData.operacao === "venda")) {
        mostrarQuantidadeAcoes = true;
      }
    }

    let percentualRelativoGarantia = 0;
    let labelPercentualGarantia = "";
    let isGanhoGarantia = false;

    if (quantidade > 0 && strike > 0 && premio > 0) {
      const garantia = strike * quantidade;
      const premioTotal = premio * quantidade;
      if (formData.operacao === "compra") {
        percentualRelativoGarantia = (-premioTotal / garantia) * 100;
        labelPercentualGarantia = "Perda máxima";
        isGanhoGarantia = false;
      } else {
        percentualRelativoGarantia = (premioTotal / garantia) * 100;
        labelPercentualGarantia = "Ganho máximo";
        isGanhoGarantia = true;
      }
    }

    let mostrarAlavancagem = false;
    let statusAlavancagem = "";
    let isAlavancado = false;
    let quantidadeAlavancada = 0;

    if (quantidade > 0 && strike > 0) {
      const precisaGarantiaAcao =
        (formData.operacao === "venda" && formData.tipo === "call") ||
        (formData.operacao === "compra" && formData.tipo === "put");

      const precisaGarantiaRendaFixa =
        (formData.operacao === "venda" && formData.tipo === "put") ||
        (formData.operacao === "compra" && formData.tipo === "call");

      if (precisaGarantiaAcao && formData.acao) {
        mostrarAlavancagem = true;
        const garantiaAcao = garantias.find(g =>
          g.tipo === 'acao' && g.ticker === formData.acao
        );
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
        const valorNecessario = strike * quantidade;
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
  const currentStrategy = STRATEGIES.find(s => s.id === selectedStrategyId);

  // ETAPA 1
  if (step === 1) {
    const groups = ["Renda extra", "Operar a alta", "Operar a baixa"];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-sm font-medium text-muted-foreground">Cadastro de opções</h1>
          <h2 className="text-3xl font-bold text-foreground">Escolha sua estratégia</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {groups.map(groupName => (
            <Card key={groupName} className="h-full bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold">{groupName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {STRATEGIES.filter(s => s.group === groupName).map(strategy => (
                  <div
                    key={strategy.id}
                    className={cn(
                      "flex items-center justify-between py-3 px-5 rounded-full transition-colors",
                      strategy.disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-slate-50",
                      selectedStrategyId === strategy.id && !strategy.disabled ? "bg-slate-50" : ""
                    )}
                    onClick={() => !strategy.disabled && setSelectedStrategyId(strategy.id)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Div do Ícone com cor dinâmica e ícone dinâmico */}
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center",
                        strategy.colorClass
                      )}>
                        <strategy.icon className="h-5 w-5" />
                      </div>

                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-slate-900">{strategy.title}</span>
                        <span className="text-xs text-slate-500">{strategy.subtitle}</span>
                      </div>
                    </div>

                    {strategy.disabled ? (
                      <span className="text-[10px] font-medium bg-[#F1F0EA] text-[#6D6845] px-2 py-1 rounded-full">
                        em breve
                      </span>
                    ) : (
                      <div className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                        selectedStrategyId === strategy.id
                          ? "border-blue-600"
                          : "border-slate-300"
                      )}>
                        {selectedStrategyId === strategy.id && (
                          <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          {/* CORREÇÃO: Botão estilo Pill */}
          <Button
            size="lg"
            className="w-full sm:w-auto px-8 rounded-full"
            onClick={handleContinueToForm}
          >
            Continuar cadastro
          </Button>
        </div>
      </div>
    );
  }

  // ETAPA 2
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-sm font-medium text-muted-foreground">Cadastro de opções</h1>
        <h2 className="text-3xl font-bold text-foreground">Preencha os dados da opção</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-1 lg:max-w-2xl w-full h-fit bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <CardTitle className="text-xl font-bold">
              {currentStrategy?.headerTitle || "Nova opção"}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToStrategies}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 rounded-full px-3"
            >
              <Pencil className="h-3 w-3" />
              alterar
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="opcao">Ticker da opção</Label>
                  <Input
                    id="opcao"
                    value={formData.opcao}
                    onChange={(e) => handleOpcaoChange(e.target.value)}
                    placeholder="ex: PETRH123"
                    className="placeholder-subtle mt-1.5"
                    maxLength={10}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="acao">Ação</Label>
                  <Input
                    id="acao"
                    ref={acaoInputRef}
                    onFocus={handleAcaoFocus}
                    value={formData.acao}
                    onChange={(e) => handleAcaoChange(e.target.value)}
                    placeholder="ex: PETR4"
                    className="placeholder-subtle mt-1.5"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="strike">Strike (R$)</Label>
                  <Input
                    id="strike"
                    value={formData.strike}
                    onChange={(e) => handleCurrencyChange("strike", e.target.value)}
                    placeholder="0,00"
                    className="placeholder-subtle mt-1.5"
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
                    className="placeholder-subtle mt-1.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input
                    id="quantidade"
                    value={formData.quantidade}
                    onChange={(e) => handleNumberChange("quantidade", e.target.value)}
                    placeholder="100"
                    className="placeholder-subtle mt-1.5"
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
                    className="placeholder-subtle mt-1.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data">Vencimento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mt-1.5",
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
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const dateString = `${year}-${month}-${day}`;
                            handleInputChange("data", dateString);
                          }
                        }}
                        disabled={(date) => {
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

              <div className="pt-4">
                <Button type="submit" disabled={loading} className="w-full sm:w-auto px-8 rounded-full">
                  {loading ? "Cadastrando..." : "Concluir cadastro"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Card lateral com análise de risco */}
        <Card className="w-full lg:w-80 h-fit bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              Análise de risco
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <Label className="text-sm text-slate-500 font-medium">
                        Diferença Strike vs Cotação
                      </Label>
                      <p className={`text-2xl font-bold mt-1 ${operationData.percentualDiferenca >= 0
                        ? 'text-emerald-500'
                        : 'text-orange-500'
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

            {/* GRAFICO CORRIGIDO: Estrutura CSS/Div sem Gap */}
            <div>
              <Label className="text-sm text-slate-500 font-medium">Nível de risco</Label>

              <div className="relative mt-4 flex justify-center">
                {/* Container do gráfico (semicírculo) */}
                <div className="relative w-48 h-24 overflow-hidden">
                  {/* Fundo Cinza (Trilha) - Usando border para manter estilo "CSS Only" */}
                  <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-slate-100 box-border"></div>

                  {/* Barra de Preenchimento (Sem Gaps) 
                         Usamos conic-gradient + mask para simular a borda preenchida perfeitamente da esquerda para a direita */}
                  <div
                    className="absolute top-0 left-0 w-48 h-48 rounded-full transition-all duration-700 ease-out"
                    style={{
                      // O gradiente cônico preenche suavemente de 0 até o grau desejado, sem criar "blocos" soltos
                      background: `conic-gradient(${getRiskColorHex(operationData.corRisco)} 0deg ${operationData.progressValue * 1.8}deg, transparent ${operationData.progressValue * 1.8}deg 360deg)`,
                      transform: 'rotate(-90deg)', // Começa na esquerda (9 horas)
                      // Máscara para criar o efeito de "anel/borda" (corta o miolo)
                      maskImage: 'radial-gradient(transparent 63%, black 64%)',
                      WebkitMaskImage: 'radial-gradient(transparent 63%, black 64%)',
                    }}
                  ></div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 text-center">
                  <p className={cn("font-bold text-lg capitalize", operationData.corRisco)}>
                    {operationData.nivelRisco}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              {operationData.mostrarValorExercicio && (
                <div>
                  <Label className="text-xs text-slate-500">Valor de Exercício</Label>
                  <p className="font-semibold text-slate-900">
                    {formatCurrencyDisplay(operationData.valorExercicio)}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-xs text-slate-500">{operationData.valorTotalLabel}</Label>
                <p className={`font-semibold ${operationData.isGanho ? 'text-green-600' : 'text-red-600'}`}>
                  {operationData.valorTotal !== 0 ? formatCurrencyDisplay(operationData.valorTotal) : '-'}
                </p>
              </div>

              {operationData.mostrarAlavancagem && (
                <div>
                  <Label className="text-xs text-slate-500">Status Cobertura</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {operationData.isAlavancado ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-bold text-orange-600">
                          {operationData.statusAlavancagem}
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-bold text-green-600">
                          {operationData.statusAlavancagem}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}