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
import { CalendarIcon, AlertTriangle, CheckCircle, DollarSign, Pencil, TrendingUp, TrendingDown, Building2, ArrowBigDownDash, ArrowBigUpDash, HelpCircle, Layers2, ChevronDown, Edit, Trash2, CirclePlus, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { STRATEGIES } from "@/constants/strategies";
import { StrategySelector } from "@/components/operations/StrategySelector";
import { getRiskColorHex, CALL_MONTHS, PUT_MONTHS } from "@/components/operations/smart-flow/utils";
import type { OpcaoFormData, TravaLeg, TravaData, Draft } from "@/components/operations/smart-flow/types";
import { DateInput } from "@/components/operations/inputs/DateInput";
import { SuccessModal } from "@/components/operations/SuccessModal";



export default function CadastroOpcao() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addOpcao } = useOpcoes(user?.id || '');
  const { garantias } = useGarantias({ userId: user?.id });
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const [step, setStep] = useState(1);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>("renda_extra_acoes");
  const currentStrategy = STRATEGIES.find(s => s.id === selectedStrategyId);
  const [volatilidade, setVolatilidade] = useState<number>(0.40); // Default 40%
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [travaData, setTravaData] = useState<TravaData>({
    compra: { ticker: '', strike: '', premio: '' },
    venda: { ticker: '', strike: '', premio: '' }
  });

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [expandedDrafts, setExpandedDrafts] = useState<string[]>([]);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);

  const getNextBusinessDay = () => {
    const today = new Date();
    const nextBusinessDay = new Date(today);
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

  const [formData, setFormData] = useState<OpcaoFormData>({
    opcao: "",
    operacao: "",
    tipo: "",
    acao: "",
    strike: "",
    cotacao: "",
    quantidade: "",
    premio: "",
    data: "",
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
      const newErrors: Record<string, string> = {};
      let hasError = false;
      const isTrava = selectedStrategyId === 'alta_moderada' || selectedStrategyId === 'queda_moderada';
      const isBullCallSpread = selectedStrategyId === 'alta_moderada';
      const isBearPutSpread = selectedStrategyId === 'queda_moderada';

      // Validação Comum
      if (!formData.acao) {
        newErrors.acao = "Preencha com o ticker da ação";
        hasError = true;
      }
      if (!formData.cotacao) {
        newErrors.cotacao = "Preencha com a cotacao";
        hasError = true;
      }
      if (!formData.quantidade) {
        newErrors.quantidade = "Preencha com a quantidade";
        hasError = true;
      }

      // Validação Específica: TRAVA
      if (isTrava) {
        // Validar campos da Trava
        if (!travaData.compra.ticker) newErrors['compra.ticker'] = "Preencha o ticker da compra";
        if (!travaData.compra.strike) newErrors['compra.strike'] = "Preencha o strike da compra";
        if (!travaData.compra.premio) newErrors['compra.premio'] = "Preencha o prêmio da compra";

        if (!travaData.venda.ticker) newErrors['venda.ticker'] = "Preencha o ticker da venda";
        if (!travaData.venda.strike) newErrors['venda.strike'] = "Preencha o strike da venda";
        if (!travaData.venda.premio) newErrors['venda.premio'] = "Preencha o prêmio da venda";

        // Validar Ticker vs Ação (Trava)
        if (formData.acao && formData.acao.length >= 4) {
          const acaoPrefix = formData.acao.substring(0, 4);
          if (travaData.compra.ticker && !travaData.compra.ticker.startsWith(acaoPrefix)) {
            newErrors['compra.ticker'] = `O ticker deve começar com ${acaoPrefix}`;
          }
          if (travaData.venda.ticker && !travaData.venda.ticker.startsWith(acaoPrefix)) {
            newErrors['venda.ticker'] = `O ticker deve começar com ${acaoPrefix}`;
          }
        }

        if (Object.keys(newErrors).length > 0) hasError = true;

        // Validar Regra de Negócio: Ambas Travas devem ser DÉBITO
        if (!hasError) {
          const strikeCompra = parseCurrencyToNumber(travaData.compra.strike);
          const strikeVenda = parseCurrencyToNumber(travaData.venda.strike);
          const premioCompra = parseCurrencyToNumber(travaData.compra.premio);
          const premioVenda = parseCurrencyToNumber(travaData.venda.premio);
          const custo = premioCompra - premioVenda;

          // Validar Custo (Débito)
          if (custo <= 0) {
            const strategyName = isBullCallSpread ? "Trava de Alta com Call" : "Trava de Baixa com Put";
            toast({
              variant: "destructive",
              title: "⚠️ Operação Inválida",
              description: `${strategyName} deve ser um DÉBITO (Custo > 0). O prêmio da compra deve ser maior que o da venda.`,
              className: "border-orange-200 bg-orange-50 text-orange-900",
            });
            setLoading(false);
            return;
          }

          // Validar Hierarquia de Strikes
          if (isBullCallSpread && strikeCompra >= strikeVenda) {
            toast({
              variant: "destructive",
              title: "⚠️ Strikes Inválidos",
              description: "Na Trava de Alta com Call, o Strike da COMPRA deve ser MENOR que o Strike da VENDA.",
              className: "border-orange-200 bg-orange-50 text-orange-900",
            });
            setLoading(false);
            return;
          }

          if (isBearPutSpread && strikeCompra <= strikeVenda) {
            toast({
              variant: "destructive",
              title: "⚠️ Strikes Inválidos",
              description: "Na Trava de Baixa com Put, o Strike da COMPRA deve ser MAIOR que o Strike da VENDA.",
              className: "border-orange-200 bg-orange-50 text-orange-900",
            });
            setLoading(false);
            return;
          }

        }

      } else {
        // Validação Específica: OUTRAS ESTRATÉGIAS (Original)
        const tickerRegex = /^[A-Z]{5}[0-9]{1,3}(W[0-9]?)?$/;
        if (!formData.opcao) {
          newErrors.opcao = "Preencha com o ticker da opção";
          hasError = true;
        } else if (!tickerRegex.test(formData.opcao)) {
          newErrors.opcao = "Formato inválido. Ex: PETRA123";
          hasError = true;
        } else if (formData.acao && formData.acao.length >= 4) {
          // Validar Ticker vs Ação (Simples)
          const acaoPrefix = formData.acao.substring(0, 4);
          if (!formData.opcao.startsWith(acaoPrefix)) {
            newErrors.opcao = `O ticker deve começar com ${acaoPrefix}`;
            hasError = true;
          }
        }

        if (!formData.strike) {
          newErrors.strike = "Preencha com o strike";
          hasError = true;
        }
        if (!formData.premio) {
          newErrors.premio = "Preencha com o prêmio";
          hasError = true;
        }
      }

      if (hasError) {
        setErrors(newErrors);
        toast({
          variant: "destructive",
          title: "❌ Erro no formulário!",
          description: "Verifique os campos destacados em vermelho.",
          className: "border-red-200 bg-red-50 text-red-900",
        });
        setLoading(false);
        return;
      }

      // SUBMISSÃO
      if (isTrava) {
        if (!user?.id) {
          toast({
            variant: "destructive",
            title: "Erro de autenticação",
            description: "Usuário não identificado.",
          });
          setLoading(false);
          return;
        }

        // 1. Gerar ID do Grupo
        const strategyGroupId = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        // 2. Preparar Payload (Batch Insert)
        const payload = [
          // Perna de COMPRA (Long Leg)
          {
            user_id: user.id,
            ops_ticker: travaData.compra.ticker,
            ops_operacao: "compra",
            ops_tipo: isBullCallSpread ? "call" : "put",
            ops_acao: formData.acao,
            ops_strike: parseCurrencyToNumber(travaData.compra.strike),
            acao_cotacao: parseCurrencyToNumber(formData.cotacao),
            ops_quanti: parseNumberToInt(formData.quantidade),
            ops_premio: parseCurrencyToNumber(travaData.compra.premio),
            ops_vencimento: formData.data || null,
            ops_criado_em: createdAt,
            // Novos campos de vínculo
            ops_strategy_group_id: strategyGroupId,
            ops_strategy_type: isBullCallSpread ? 'BULL_CALL_SPREAD' : 'BEAR_PUT_SPREAD',
            ops_strategy_role: 'LONG_LEG'
          },
          // Perna de VENDA (Short Leg)
          {
            user_id: user.id,
            ops_ticker: travaData.venda.ticker,
            ops_operacao: "venda",
            ops_tipo: isBullCallSpread ? "call" : "put",
            ops_acao: formData.acao,
            ops_strike: parseCurrencyToNumber(travaData.venda.strike),
            acao_cotacao: parseCurrencyToNumber(formData.cotacao),
            ops_quanti: parseNumberToInt(formData.quantidade),
            ops_premio: parseCurrencyToNumber(travaData.venda.premio),
            ops_vencimento: formData.data || null,
            ops_criado_em: createdAt,
            // Novos campos de vínculo
            ops_strategy_group_id: strategyGroupId,
            ops_strategy_type: isBullCallSpread ? 'BULL_CALL_SPREAD' : 'BEAR_PUT_SPREAD',
            ops_strategy_role: 'SHORT_LEG'
          }
        ];

        // 3. Inserir no Banco
        const { error } = await supabase
          .from('ops_registry')
          .insert(payload);

        if (error) {
          console.error('Erro ao salvar trava:', error);
          toast({
            variant: "destructive",
            title: "Erro ao salvar",
            description: "Não foi possível salvar a operação. Tente novamente.",
          });
          setLoading(false);
          return;
        }



        // Limpar formulário e voltar para etapa 1
        setFormData({
          opcao: "",
          acao: "",
          strike: "",
          cotacao: "",
          quantidade: "",
          premio: "",
          data: formatDateForInput(getNextBusinessDay()),
          operacao: "venda",
          tipo: "call",
          status: "aberta",
        });
        setTravaData({
          compra: { ticker: '', strike: '', premio: '' },
          venda: { ticker: '', strike: '', premio: '' }
        });

        setSuccessModalOpen(true);
        // setStep(1); // Moved to modal action

      } else {
        // Lógica ORIGINAL para outras estratégias
        const dadosOpcao = {
          ...formData,
          operacao: formData.operacao,
          tipo: formData.tipo,
        };

        await addOpcao(dadosOpcao);



        // Limpar formulário e voltar para etapa 1
        setFormData({
          opcao: "",
          acao: "",
          strike: "",
          cotacao: "",
          quantidade: "",
          premio: "",
          data: formatDateForInput(getNextBusinessDay()),
          operacao: "venda",
          tipo: "call",
          status: "aberta",
        });

        setSuccessModalOpen(true);
        // setStep(1); // Moved to modal action
      }

      setLoading(false);
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

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field);

    // Se a data foi alterada, atualizar os tickers com a 5ª letra
    if (field === 'data') {
      const prefix = formData.acao.substring(0, 4);
      if (prefix.length === 4 && value) {
        const vencimento = parseLocalDate(value);
        const monthIndex = vencimento.getMonth();
        const isBullCallSpread = selectedStrategyId === 'alta_moderada';
        const isTrava = selectedStrategyId === 'alta_moderada' || selectedStrategyId === 'queda_moderada';

        if (isTrava) {
          const letter = isBullCallSpread ? CALL_MONTHS[monthIndex] : PUT_MONTHS[monthIndex];

          // Atualizar os tickers mantendo os números que já existem
          setTravaData(prev => ({
            ...prev,
            compra: {
              ...prev.compra,
              ticker: prev.compra.ticker.length > 5
                ? prefix + letter + prev.compra.ticker.substring(5)
                : prefix + letter
            },
            venda: {
              ...prev.venda,
              ticker: prev.venda.ticker.length > 5
                ? prefix + letter + prev.venda.ticker.substring(5)
                : prefix + letter
            }
          }));
        } else {
          // Lógica para Opção Simples
          if (formData.opcao && formData.opcao.length >= 4) {
            const type = formData.tipo === 'put' ? 'put' : 'call';
            const letter = type === 'call' ? CALL_MONTHS[monthIndex] : PUT_MONTHS[monthIndex];

            let newTicker = formData.opcao;
            if (newTicker.length >= 5) {
              newTicker = newTicker.substring(0, 4) + letter + newTicker.substring(5);
            } else {
              newTicker = newTicker + letter;
            }
            handleOpcaoChange(newTicker);
          }
        }
      }
    }
  };

  const handleCurrencyChange = (field: string, value: string) => {
    const formatted = formatCurrency(value);
    setFormData(prev => ({ ...prev, [field]: formatted }));
    clearError(field);
  };

  const handleNumberChange = (field: string, value: string) => {
    const formatted = formatNumber(value);
    setFormData(prev => ({ ...prev, [field]: formatted }));
    clearError(field);
  };

  const handleTravaChange = (leg: 'compra' | 'venda', field: string, value: string) => {
    setTravaData(prev => ({
      ...prev,
      [leg]: { ...prev[leg], [field]: value }
    }));
  };

  const handleTravaCurrencyChange = (leg: 'compra' | 'venda', field: string, value: string) => {
    const formatted = formatCurrency(value);
    setTravaData(prev => ({
      ...prev,
      [leg]: { ...prev[leg], [field]: formatted }
    }));
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
      clearError('opcao');
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

        if (data && (data as { ops_acao: string }).ops_acao) {
          setFormData(prev => ({ ...prev, acao: (data as { ops_acao: string }).ops_acao }));
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
        const normalizedTicker = formData.acao.trim().toUpperCase();

        // Strategy: 
        // 1. Try exact match (e.g. "PETR4")
        // 2. If not found, try stripping digits (e.g. "PETR4" -> "PETR") because cod_ops might store "PETR"

        let acaoData = null;

        // Attempt 1: Exact match
        const { data: dataExact } = await supabase
          .from('cod_ops' as any)
          .select('id')
          .eq('ops_ticker', normalizedTicker)
          .maybeSingle();

        acaoData = dataExact;

        // Attempt 2: Strip digits if exact match failed
        if (!acaoData && /\d+$/.test(normalizedTicker)) {
          const tickerBase = normalizedTicker.replace(/\d+$/, '');

          const { data: dataBase } = await supabase
            .from('cod_ops' as any)
            .select('id')
            .eq('ops_ticker', tickerBase)
            .maybeSingle();

          acaoData = dataBase;
        }

        if (acaoData && (acaoData as { id: string }).id) {
          const { data: paramData, error: paramError } = await supabase
            .from('ativos_parametros' as any)
            .select('volatilidade_anual')
            .eq('cod_ops_id', (acaoData as { id: string }).id)
            .maybeSingle();

          if (paramData && (paramData as { volatilidade_anual: number }).volatilidade_anual) {
            const volValue = Number((paramData as { volatilidade_anual: number }).volatilidade_anual);
            setVolatilidade(volValue);
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
      clearError('acao');

      // Auto-fill tickers with the first 4 letters + 5th letter (month) if we have a date
      const prefix = cleanValue.substring(0, 4).replace(/[^A-Z]/g, '');

      // Se temos data e é uma trava, adicionar a 5ª letra
      let tickerPrefix = prefix;
      const isTrava = selectedStrategyId === 'alta_moderada' || selectedStrategyId === 'queda_moderada';
      if (formData.data && isTrava && prefix.length === 4) {
        const vencimento = parseLocalDate(formData.data);
        const monthIndex = vencimento.getMonth();
        const isBullCallSpread = selectedStrategyId === 'alta_moderada';
        const letter = isBullCallSpread ? CALL_MONTHS[monthIndex] : PUT_MONTHS[monthIndex];
        tickerPrefix = prefix + letter;
      }

      setTravaData(prev => ({
        ...prev,
        compra: { ...prev.compra, ticker: tickerPrefix },
        venda: { ...prev.venda, ticker: tickerPrefix }
      }));
    }
  };

  const calculateOperationData = () => {
    const isTrava = selectedStrategyId === 'alta_moderada' || selectedStrategyId === 'queda_moderada';
    const isBullCallSpread = selectedStrategyId === 'alta_moderada';
    const isBearPutSpread = selectedStrategyId === 'queda_moderada';
    const isShortPut = selectedStrategyId === 'renda_extra_dinheiro';
    const isShortCall = selectedStrategyId === 'renda_extra_acoes';
    const isLongPut = selectedStrategyId === 'queda_infinita';
    const isLongCall = selectedStrategyId === 'alta_infinita';

    // TRAVA-SPECIFIC CALCULATIONS
    if (isTrava) {
      const cotacao = parseCurrencyToNumber(formData.cotacao);
      const quantidade = parseNumberToInt(formData.quantidade);
      const strikeCompra = parseCurrencyToNumber(travaData.compra.strike);
      const premioCompra = parseCurrencyToNumber(travaData.compra.premio);
      const strikeVenda = parseCurrencyToNumber(travaData.venda.strike);
      const premioVenda = parseCurrencyToNumber(travaData.venda.premio);

      let custoTotal = 0;
      let lucroMaximo = 0;
      let breakEven = 0;
      let payoffRatio = 0;
      let payoffLabel = "";
      let payoffColor = "";
      let nivelRisco = "-";
      let corRisco = "text-slate-900";
      let progressValue = 0;
      let distanciaAlvo = 0;
      let distanciaLabel = "-";
      let mostrarDistancia = false;

      if (quantidade > 0 && strikeCompra > 0 && strikeVenda > 0 && premioCompra > 0 && premioVenda > 0) {
        // Financial Calculations (same for both)
        custoTotal = (premioCompra - premioVenda) * quantidade;

        // Lucro Máximo differs based on spread type
        if (isBullCallSpread) {
          // Bull Call: Max Profit = (Strike Venda - Strike Compra) - Custo
          lucroMaximo = ((strikeVenda - strikeCompra) * quantidade) - custoTotal;
          // Break-Even: Strike Compra + Custo Líquido
          breakEven = strikeCompra + (premioCompra - premioVenda);
        } else {
          // Bear Put: Max Profit = (Strike Compra - Strike Venda) - Custo
          lucroMaximo = ((strikeCompra - strikeVenda) * quantidade) - custoTotal;
          // Break-Even: Strike Compra - Custo Líquido
          breakEven = strikeCompra - (premioCompra - premioVenda);
        }

        // Payoff Ratio
        if (custoTotal > 0) {
          payoffRatio = lucroMaximo / custoTotal;

          if (payoffRatio < 1.0) {
            payoffLabel = "Payoff Baixo";
            payoffColor = "text-orange-600 bg-orange-50 border-orange-200";
          } else if (payoffRatio >= 2.0) {
            payoffLabel = "Payoff Excelente";
            payoffColor = "text-green-600 bg-green-50 border-green-200";
          } else {
            payoffLabel = "Equilibrado";
            payoffColor = "text-blue-600 bg-blue-50 border-blue-200";
          }
        }

        // Risk Level Logic
        if (cotacao > 0) {
          mostrarDistancia = true;

          if (isBullCallSpread) {
            // BULL CALL SPREAD RISK LOGIC (Betting on UPWARD movement)
            // Scenario 1: OTM (Cotação < Strike Compra) - Agressivo
            if (cotacao < strikeCompra) {
              const today = new Date();
              const vencimento = formData.data ? parseLocalDate(formData.data) : getNextBusinessDay();
              const diasUteis = calculateBusinessDays(today, vencimento);
              const timeToMaturity = diasUteis / 252;
              const vol = volatilidade;

              let score = 0;
              if (vol > 0 && timeToMaturity > 0) {
                const logReturn = Math.log(cotacao / strikeCompra);
                const denominator = vol * Math.sqrt(timeToMaturity);
                score = Math.abs(logReturn / denominator);
              }

              if (score <= 0.65) {
                nivelRisco = "Moderado";
                corRisco = "text-yellow-600";
                progressValue = 50;
              } else {
                nivelRisco = "Agressivo";
                corRisco = "text-red-600";
                progressValue = 85;
              }

              // Distance to break-even (needs to go UP)
              distanciaAlvo = ((breakEven / cotacao) - 1) * 100;
              distanciaLabel = `Faltam ${Math.abs(distanciaAlvo).toFixed(1)}% para o equilíbrio`;
            }
            // Scenario 2: ATM (Strike Compra <= Cotação <= Strike Venda) - Moderado
            else if (cotacao >= strikeCompra && cotacao <= strikeVenda) {
              nivelRisco = "Moderado (ATM)";
              corRisco = "text-yellow-600";
              progressValue = 45;

              if (cotacao < breakEven) {
                distanciaAlvo = ((breakEven / cotacao) - 1) * 100;
                distanciaLabel = `Faltam ${Math.abs(distanciaAlvo).toFixed(1)}% para o equilíbrio`;
              } else {
                distanciaLabel = "No Lucro ✅";
              }
            }
            // Scenario 3: ITM (Cotação > Strike Venda) - Conservador
            else {
              nivelRisco = "Conservador";
              corRisco = "text-green-600";
              progressValue = 20;
              distanciaLabel = "Acima do ponto de equilíbrio";
            }
          } else {
            // BEAR PUT SPREAD RISK LOGIC (Betting on DOWNWARD movement)
            // Scenario 1: OTM (Cotação > Strike Compra) - Agressivo (needs to fall)
            if (cotacao > strikeCompra) {
              const today = new Date();
              const vencimento = formData.data ? parseLocalDate(formData.data) : getNextBusinessDay();
              const diasUteis = calculateBusinessDays(today, vencimento);
              const timeToMaturity = diasUteis / 252;
              const vol = volatilidade;

              let score = 0;
              if (vol > 0 && timeToMaturity > 0) {
                const logReturn = Math.log(strikeCompra / cotacao);
                const denominator = vol * Math.sqrt(timeToMaturity);
                score = Math.abs(logReturn / denominator);
              }

              if (score <= 0.65) {
                nivelRisco = "Moderado";
                corRisco = "text-yellow-600";
                progressValue = 50;
              } else {
                nivelRisco = "Agressivo";
                corRisco = "text-red-600";
                progressValue = 85;
              }

              // Distance to break-even (needs to go DOWN)
              // Fórmula: ((BreakEven - Cotação) / Cotação) * 100
              // Resultado negativo indica queda necessária
              distanciaAlvo = ((breakEven - cotacao) / cotacao) * 100;
              distanciaLabel = `Faltam cair ${Math.abs(distanciaAlvo).toFixed(1)}% para o equilíbrio`;
            }
            // Scenario 2: ATM (Strike Venda <= Cotação <= Strike Compra) - Moderado
            else if (cotacao >= strikeVenda && cotacao <= strikeCompra) {
              nivelRisco = "Moderado";
              corRisco = "text-yellow-600";
              progressValue = 45;

              if (cotacao > breakEven) {
                // Fórmula: ((BreakEven - Cotação) / Cotação) * 100
                distanciaAlvo = ((breakEven - cotacao) / cotacao) * 100;
                distanciaLabel = `Faltam cair ${Math.abs(distanciaAlvo).toFixed(1)}% para o equilíbrio`;
              } else {
                distanciaLabel = "No Lucro ✅";
              }
            }
            // Scenario 3: ITM (Cotação < Strike Venda) - Conservador (already fell)
            else {
              nivelRisco = "Conservador";
              corRisco = "text-green-600";
              progressValue = 20;
              distanciaLabel = "Abaixo do ponto de equilíbrio";
            }
          }
        }
      }

      return {
        // Trava-specific fields
        isTrava: true,
        isShortPut: false,
        isShortCall: false,
        isLongPut: false,
        isLongCall: false,
        custoTotal,
        lucroMaximo,
        breakEven,
        payoffRatio,
        payoffLabel,
        payoffColor,
        distanciaAlvo,
        distanciaLabel,
        mostrarDistancia,
        // Common fields
        percentualDiferenca: 0,
        valorTotal: custoTotal,
        valorTotalLabel: "Custo Total",
        isGanho: false,
        nivelRisco,
        corRisco,
        progressValue,
        valorExercicio: 0,
        quantidadeAcoes: 0,
        mostrarValorExercicio: false,
        mostrarQuantidadeAcoes: false,
        percentualRelativoGarantia: 0,
        labelPercentualGarantia: "",
        isGanhoGarantia: false,
        mostrarAlavancagem: false,
        statusAlavancagem: "",
        isAlavancado: false,
        quantidadeAlavancada: 0
      };
    }

    // ORIGINAL LOGIC FOR OTHER STRATEGIES
    const strike = parseCurrencyToNumber(formData.strike);
    const cotacao = parseCurrencyToNumber(formData.cotacao);
    const quantidade = parseNumberToInt(formData.quantidade);
    const premio = parseCurrencyToNumber(formData.premio);

    let percentualDiferenca = 0;
    let valorTotal = 0;
    let valorTotalLabel = "";
    let isGanho = true;
    let nivelRisco = "-";
    let corRisco = "text-slate-900";
    let progressValue = 0; // 0 a 100
    let breakEven = 0;
    let distanciaAlvo = 0;
    let distanciaLabel = "-";

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
          nivelRisco = "Agressivo";
          corRisco = "text-red-800";
          progressValue = 95;
        } else {
          // Venda OTM -> Analisar Score
          if (score <= 0.50) {
            nivelRisco = "Agressivo";
            corRisco = "text-red-600";
            progressValue = 80;
          } else if (score <= 1.50) {
            nivelRisco = "Moderado";
            corRisco = "text-yellow-600";
            progressValue = 50;
          } else {
            // Score > 1.50
            nivelRisco = "Conservador";
            corRisco = "text-green-600";
            progressValue = 20;
          }
        }
      }
      // CENÁRIO 2: Operação COMPRA (Long)
      else {
        if (isITM) {
          // Compra ITM -> Baixíssimo Risco (já tem valor intrínseco)
          nivelRisco = "Conservador";
          corRisco = "text-emerald-600";
          progressValue = 15;
        } else {
          // Compra OTM -> Analisar Score (Risco de virar pó)
          if (score <= 0.50) {
            nivelRisco = "Conservador";
            corRisco = "text-green-600";
            progressValue = 35;
          } else if (score <= 1.50) {
            nivelRisco = "Moderado";
            corRisco = "text-yellow-600";
            progressValue = 65;
          } else {
            // Score > 1.50 (Muito longe do dinheiro)
            nivelRisco = "Agressivo";
            corRisco = "text-red-600";
            progressValue = 90;
          }
        }
      }
    }

    // Short Put Specific Calculations
    if (isShortPut && strike > 0 && premio > 0) {
      breakEven = strike - premio;
      if (cotacao > 0) {
        // Distance logic: ((Cotação - Equilíbrio) / Cotação) * 100
        distanciaAlvo = ((cotacao - breakEven) / cotacao) * 100;
        const formattedDistancia = parseFloat(Math.abs(distanciaAlvo).toFixed(1)) + '%';
        if (distanciaAlvo >= 0) {
          distanciaLabel = `Faltam cair ${formattedDistancia} para o equilíbrio`;
        } else {
          distanciaLabel = `Ultrapassou o equilíbrio em ${formattedDistancia}`;
        }
      }
    }

    // Short Call Specific Calculations
    if (isShortCall && strike > 0 && premio > 0) {
      breakEven = strike + premio;
      if (cotacao > 0) {
        // Distance logic: ((BreakEven - Cotação) / Cotação) * 100
        distanciaAlvo = ((breakEven - cotacao) / cotacao) * 100;
        const formattedDistancia = parseFloat(Math.abs(distanciaAlvo).toFixed(1)) + '%';
        if (distanciaAlvo >= 0) {
          distanciaLabel = `Faltam ${formattedDistancia} para o equilíbrio`;
        } else {
          distanciaLabel = `Ultrapassou o equilíbrio em ${formattedDistancia}`;
        }
      }
    }

    // Long Put Specific Calculations
    if (isLongPut && strike > 0 && premio > 0) {
      breakEven = strike - premio;
      if (cotacao > 0) {
        // Distance logic: ((Cotação - BreakEven) / Cotação) * 100
        distanciaAlvo = ((cotacao - breakEven) / cotacao) * 100;
        const formattedDistancia = parseFloat(Math.abs(distanciaAlvo).toFixed(1)) + '%';
        if (distanciaAlvo >= 0) {
          distanciaLabel = `Faltam cair ${formattedDistancia} para o equilíbrio`;
        } else {
          distanciaLabel = `Ultrapassou o equilíbrio em ${formattedDistancia}`;
        }
      }
    }

    // Long Call Specific Calculations
    if (isLongCall && strike > 0 && premio > 0) {
      breakEven = strike + premio;
      if (cotacao > 0) {
        // Distance logic: ((BreakEven - Cotação) / Cotação) * 100
        distanciaAlvo = ((breakEven - cotacao) / cotacao) * 100;
        const formattedDistancia = parseFloat(Math.abs(distanciaAlvo).toFixed(1)) + '%';
        if (distanciaAlvo >= 0) {
          distanciaLabel = `Faltam ${formattedDistancia} para o equilíbrio`;
        } else {
          distanciaLabel = `Ultrapassou o equilíbrio em ${formattedDistancia}`;
        }
      }
    }

    if (premio > 0 && quantidade > 0) {
      valorTotal = premio * quantidade;
      if (formData.operacao === "venda") {
        valorTotalLabel = "Ganho máximo";
        isGanho = true;
      } else {
        valorTotalLabel = "Risco máximo";
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
        labelPercentualGarantia = "Risco máximo";
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
      isTrava: false,
      isShortPut,
      isShortCall,
      isLongPut,
      isLongCall,
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
      quantidadeAlavancada,
      // Trava fields (empty for non-trava)
      custoTotal: 0,
      lucroMaximo: 0,

      breakEven,
      payoffRatio: 0,
      payoffLabel: "",
      payoffColor: "",
      distanciaAlvo,
      distanciaLabel,
      mostrarDistancia: false
    };
  };

  // Load drafts from localStorage on mount
  useEffect(() => {
    const loadDrafts = () => {
      try {
        const stored = localStorage.getItem('operation_drafts');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Filter out expired drafts (older than 20 minutes)
          const now = Date.now();
          const validDrafts = parsed.filter((draft: Draft) => {
            const expiresAt = draft.expiresAt || 0;
            return now < expiresAt;
          });

          // Update localStorage if any drafts were removed
          if (validDrafts.length !== parsed.length) {
            localStorage.setItem('operation_drafts', JSON.stringify(validDrafts));
          }

          setDrafts(validDrafts);
        }
      } catch (error) {
        console.error('Error loading drafts:', error);
      }
    };

    loadDrafts();

    // Cleanup expired drafts every minute
    const interval = setInterval(loadDrafts, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveDraft = () => {
    try {
      const operationData = calculateOperationData();
      const isTrava = selectedStrategyId === 'alta_moderada' || selectedStrategyId === 'queda_moderada';

      const draftData = {
        timestamp: Date.now(),
        expiresAt: Date.now() + (20 * 60 * 1000), // 20 minutes
        strategyId: selectedStrategyId,
        strategyName: currentStrategy?.title || '',
        isTrava,
        formData: { ...formData },
        travaData: isTrava ? { ...travaData } : undefined,
        operationData: {
          ...operationData
          // Don't save strategyIcon and strategyColor as they are React components
        }
      };

      let updatedDrafts;

      if (editingDraftId) {
        // Update existing draft
        updatedDrafts = drafts.map(d =>
          d.id === editingDraftId
            ? { ...d, ...draftData }
            : d
        );

        // If for some reason the draft wasn't found (e.g. expired/deleted), create new
        if (!updatedDrafts.find(d => d.id === editingDraftId)) {
          const newDraft = { id: crypto.randomUUID(), ...draftData };
          updatedDrafts = [...drafts, newDraft];
          setEditingDraftId(newDraft.id);
        }
      } else {
        // Create new draft
        const newDraft = { id: crypto.randomUUID(), ...draftData };
        updatedDrafts = [...drafts, newDraft];
        // Optionally set editingDraftId to this new draft so subsequent saves update it
        setEditingDraftId(newDraft.id);
      }

      setDrafts(updatedDrafts);
      localStorage.setItem('operation_drafts', JSON.stringify(updatedDrafts));

      toast({
        title: "✅ Rascunho salvo!",
        description: "Operação salva temporariamente por 20 minutos.",
        className: "bg-green-50 border-green-200 text-green-900",
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar rascunho",
        description: "Tente novamente.",
      });
    }
  };

  const handleDeleteDraft = (draftId: string) => {
    const updatedDrafts = drafts.filter(d => d.id !== draftId);
    setDrafts(updatedDrafts);
    localStorage.setItem('operation_drafts', JSON.stringify(updatedDrafts));

    if (editingDraftId === draftId) {
      setEditingDraftId(null);
      // Optionally clear form? Let's keep it to avoid data loss if accidental delete
    }

    toast({
      title: "Rascunho excluído",
      description: "O rascunho foi removido.",
    });
  };

  const handleAddDraftToPortfolio = async (draft: Draft) => {
    try {
      setLoading(true);

      if (draft.isTrava) {
        if (!user?.id) throw new Error("Usuário não identificado");

        const isBullCallSpread = draft.strategyId === 'alta_moderada';
        const strategyGroupId = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        const travaData = draft.travaData;
        const formData = draft.formData;

        const payload = [
          // Perna de COMPRA (Long Leg)
          {
            user_id: user.id,
            ops_ticker: travaData.compra.ticker,
            ops_operacao: "compra",
            ops_tipo: isBullCallSpread ? "call" : "put",
            ops_acao: formData.acao,
            ops_strike: parseCurrencyToNumber(travaData.compra.strike),
            acao_cotacao: parseCurrencyToNumber(formData.cotacao),
            ops_quanti: parseNumberToInt(formData.quantidade),
            ops_premio: parseCurrencyToNumber(travaData.compra.premio),
            ops_vencimento: formData.data || null,
            ops_criado_em: createdAt,
            ops_strategy_group_id: strategyGroupId,
            ops_strategy_type: isBullCallSpread ? 'BULL_CALL_SPREAD' : 'BEAR_PUT_SPREAD',
            ops_strategy_role: 'LONG_LEG'
          },
          // Perna de VENDA (Short Leg)
          {
            user_id: user.id,
            ops_ticker: travaData.venda.ticker,
            ops_operacao: "venda",
            ops_tipo: isBullCallSpread ? "call" : "put",
            ops_acao: formData.acao,
            ops_strike: parseCurrencyToNumber(travaData.venda.strike),
            acao_cotacao: parseCurrencyToNumber(formData.cotacao),
            ops_quanti: parseNumberToInt(formData.quantidade),
            ops_premio: parseCurrencyToNumber(travaData.venda.premio),
            ops_vencimento: formData.data || null,
            ops_criado_em: createdAt,
            ops_strategy_group_id: strategyGroupId,
            ops_strategy_type: isBullCallSpread ? 'BULL_CALL_SPREAD' : 'BEAR_PUT_SPREAD',
            ops_strategy_role: 'SHORT_LEG'
          }
        ];

        const { error } = await supabase.from('ops_registry').insert(payload);
        if (error) throw error;

      } else {
        await addOpcao(draft.formData);
      }

      // Remove draft after adding
      handleDeleteDraft(draft.id);

      // If we were editing this draft, clear the editing state and form
      if (editingDraftId === draft.id) {
        setEditingDraftId(null);
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
        setStep(1); // Go back to strategy selection or keep in form? User said "mantenha na pagina".
        // Actually, "mantenha na pagina que ele está" usually means don't navigate away.
        // But if the draft is gone, showing the empty form might be confusing or correct.
        // Let's keep the user on the page (Step 2) but maybe clear the form to indicate success?
        // Or better: Don't clear the form, just clear the ID. The user might want to add another similar one.
        // But the requirement says "remover o card do rascunho".
        // Let's just clear the ID.
      }

      toast({
        title: "✅ Opção Cadastrada!",
        description: "Sua operação foi salva com sucesso no portfólio.",
        className: "border-green-200 bg-green-50 text-green-900",
      });
    } catch (error) {
      console.error('Error adding draft to portfolio:', error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar opção",
        description: "Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditDraft = (draft: Draft) => {
    // Load draft data into form
    setSelectedStrategyId(draft.strategyId);
    setFormData(draft.formData);
    if (draft.isTrava && draft.travaData) {
      setTravaData(draft.travaData);
    }
    setEditingDraftId(draft.id);
    setStep(2);

    toast({
      title: "Rascunho carregado",
      description: "Você pode editar e salvar as alterações.",
    });
  };

  const operationData = calculateOperationData();
  // const currentStrategy = STRATEGIES.find(s => s.id === selectedStrategyId); // Moved to top

  // ETAPA 1
  if (step === 1) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Escolha sua estratégia</h1>
          <p className="text-slate-600 mt-2">Selecione o tipo de operação para continuarmos.</p>
        </div>

        <StrategySelector
          selectedStrategyId={selectedStrategyId}
          onSelectStrategy={setSelectedStrategyId}
        />

        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            className="px-8 rounded-full flex items-center gap-2"
            onClick={() => navigate("/nova-operacao")}
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>

          <Button
            size="lg"
            className="px-8 rounded-full"
            onClick={handleContinueToForm}
          >
            Continuar
          </Button>
        </div>
      </div>
    );
  }

  // ETAPA 2
  const isTrava = selectedStrategyId === 'alta_moderada' || selectedStrategyId === 'queda_moderada';
  const isBullCallSpread = selectedStrategyId === 'alta_moderada';
  const isBearPutSpread = selectedStrategyId === 'queda_moderada';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground"> Simule sua operação</h1>
        <p className="text-slate-600 mt-2 max-w-3xl">
          Compare rascunhos e registre suas operações quando finalizar.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* COLUNA DA ESQUERDA: FORMULÁRIO */}
        <div className="flex-1 w-full">
          {isTrava ? (
            // LAYOUT DE 3 BLOCOS PARA TRAVA
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* BLOCO A: Campos Comuns */}
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-6">
                  <CardTitle className="text-xl font-bold">
                    {currentStrategy?.headerTitle || "Trava de alta"}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={handleSaveDraft}
                    className="flex items-center gap-1 text-slate-600 hover:text-slate-900 rounded-full px-3"
                  >
                    <Layers2 className="h-3 w-3" />
                    Salvar rascunho
                  </Button>

                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="acao">Ação</Label>
                      <Input
                        id="acao"
                        ref={acaoInputRef}
                        onFocus={handleAcaoFocus}
                        value={formData.acao}
                        onChange={(e) => handleAcaoChange(e.target.value)}
                        placeholder="ex: PETR4"
                        maxLength={6}
                        className={cn(
                          "placeholder-subtle mt-1.5",
                          errors.acao ? "border-red-500 focus-visible:ring-red-500" : ""
                        )}
                      />
                      {errors.acao && (
                        <p className="text-xs text-red-500 mt-1">{errors.acao}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="cotacao">Cotação (R$)</Label>
                      <Input
                        id="cotacao"
                        value={formData.cotacao}
                        onChange={(e) => handleCurrencyChange("cotacao", e.target.value)}
                        placeholder="0,00"
                        className={cn(
                          "placeholder-subtle mt-1.5",
                          errors.cotacao ? "border-red-500 focus-visible:ring-red-500" : ""
                        )}
                      />
                      {errors.cotacao && (
                        <p className="text-xs text-red-500 mt-1">{errors.cotacao}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="quantidade">Quantidade</Label>
                      <Input
                        id="quantidade"
                        value={formData.quantidade}
                        onChange={(e) => handleNumberChange("quantidade", e.target.value)}
                        placeholder="100"
                        className={cn(
                          "placeholder-subtle mt-1.5",
                          errors.quantidade ? "border-red-500 focus-visible:ring-red-500" : ""
                        )}
                      />
                      {errors.quantidade && (
                        <p className="text-xs text-red-500 mt-1">{errors.quantidade}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="data">Vencimento</Label>
                      <DateInput
                        id="data"
                        label=""
                        value={formData.data}
                        onChange={(value) => handleInputChange("data", value)}
                        error={errors.data}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* BLOCO B: Compra da Call/Put */}
              <Card className="bg-white border-l-4 border-l-emerald-500">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-emerald-700">
                    {isBullCallSpread ? "Compra da call" : "Compra da put"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="compra-strike">Strike (R$)</Label>
                      <Input
                        id="compra-strike"
                        value={travaData.compra.strike}
                        onChange={(e) => handleTravaCurrencyChange('compra', 'strike', e.target.value)}
                        placeholder="0,00"
                        className={cn(
                          "placeholder-subtle mt-1.5",
                          errors['compra.strike'] ? "border-red-500 focus-visible:ring-red-500" : ""
                        )}
                      />
                      {errors['compra.strike'] && (
                        <p className="text-xs text-red-500 mt-1">{errors['compra.strike']}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="compra-premio">Prêmio (R$)</Label>
                      <Input
                        id="compra-premio"
                        value={travaData.compra.premio}
                        onChange={(e) => handleTravaCurrencyChange('compra', 'premio', e.target.value)}
                        placeholder="0,00"
                        className={cn(
                          "placeholder-subtle mt-1.5",
                          errors['compra.premio'] ? "border-red-500 focus-visible:ring-red-500" : ""
                        )}
                      />
                      {errors['compra.premio'] && (
                        <p className="text-xs text-red-500 mt-1">{errors['compra.premio']}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="compra-ticker">Ticker da opção</Label>
                      <div className={cn(
                        "flex rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 mt-1.5",
                        errors['compra.ticker'] ? "border-red-500 focus-within:ring-red-500" : ""
                      )}>
                        <div className="flex items-center px-3 text-muted-foreground bg-muted/50 border-r border-input rounded-l-md select-none">
                          {formData.acao.substring(0, 4) || ""}
                        </div>
                        <Input
                          id="compra-ticker"
                          value={travaData.compra.ticker.substring(formData.acao.substring(0, 4).length)}
                          onChange={(e) => {
                            const prefix = formData.acao.substring(0, 4);
                            const suffix = e.target.value.toUpperCase().replace(/[^A-Z0-9W]/g, '');
                            handleTravaChange('compra', 'ticker', prefix + suffix);
                          }}
                          placeholder="H123"
                          maxLength={6}
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-l-none placeholder-subtle"
                        />
                      </div>
                      {errors['compra.ticker'] && (
                        <p className="text-xs text-red-500 mt-1">{errors['compra.ticker']}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* BLOCO C: Venda da Call/Put */}
              <Card className="bg-white border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-red-700">
                    {isBullCallSpread ? "Venda da call" : "Venda da put"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="venda-strike">Strike (R$)</Label>
                      <Input
                        id="venda-strike"
                        value={travaData.venda.strike}
                        onChange={(e) => handleTravaCurrencyChange('venda', 'strike', e.target.value)}
                        placeholder="0,00"
                        className={cn(
                          "placeholder-subtle mt-1.5",
                          errors['venda.strike'] ? "border-red-500 focus-visible:ring-red-500" : ""
                        )}
                      />
                      {errors['venda.strike'] && (
                        <p className="text-xs text-red-500 mt-1">{errors['venda.strike']}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="venda-premio">Prêmio (R$)</Label>
                      <Input
                        id="venda-premio"
                        value={travaData.venda.premio}
                        onChange={(e) => handleTravaCurrencyChange('venda', 'premio', e.target.value)}
                        placeholder="0,00"
                        className={cn(
                          "placeholder-subtle mt-1.5",
                          errors['venda.premio'] ? "border-red-500 focus-visible:ring-red-500" : ""
                        )}
                      />
                      {errors['venda.premio'] && (
                        <p className="text-xs text-red-500 mt-1">{errors['venda.premio']}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="venda-ticker">Ticker da opção</Label>
                      <div className={cn(
                        "flex rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 mt-1.5",
                        errors['venda.ticker'] ? "border-red-500 focus-within:ring-red-500" : ""
                      )}>
                        <div className="flex items-center px-3 text-muted-foreground bg-muted/50 border-r border-input rounded-l-md select-none">
                          {formData.acao.substring(0, 4) || ""}
                        </div>
                        <Input
                          id="venda-ticker"
                          value={travaData.venda.ticker.substring(formData.acao.substring(0, 4).length)}
                          onChange={(e) => {
                            const prefix = formData.acao.substring(0, 4);
                            const suffix = e.target.value.toUpperCase().replace(/[^A-Z0-9W]/g, '');
                            handleTravaChange('venda', 'ticker', prefix + suffix);
                          }}
                          placeholder="H123"
                          maxLength={6}
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-l-none placeholder-subtle"
                        />
                      </div>
                      {errors['venda.ticker'] && (
                        <p className="text-xs text-red-500 mt-1">{errors['venda.ticker']}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Botão de Submit */}
              <div className="pt-4 flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto px-6 rounded-full flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Voltar
                </Button>
                <Button type="submit" disabled={loading} className="w-full sm:w-auto px-8 rounded-full">
                  {loading ? "Cadastrando..." : "Concluir cadastro"}
                </Button>
              </div>
            </form>
          ) : (
            // LAYOUT ORIGINAL PARA OUTRAS ESTRATÉGIAS
            <form onSubmit={handleSubmit} className="space-y-4">
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-6">
                  <CardTitle className="text-xl font-bold">
                    {currentStrategy?.headerTitle || "Nova opção"}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={handleSaveDraft}
                    className="flex items-center gap-1 text-slate-600 hover:text-slate-900 rounded-full px-3"
                  >
                    <Layers2 className="h-3 w-3" />
                    Salvar rascunho
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">

                    {/* Unifiquei em um único grid para manter a ordem fluida (Esq -> Dir -> Esq...) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      {/* 1. Ação */}
                      <div>
                        <Label htmlFor="acao">Ação</Label>
                        <Input
                          id="acao"
                          ref={acaoInputRef}
                          onFocus={handleAcaoFocus}
                          value={formData.acao}
                          onChange={(e) => handleAcaoChange(e.target.value)}
                          placeholder="ex: PETR4"
                          maxLength={6}
                          className={cn(
                            "placeholder-subtle mt-1.5",
                            errors.acao ? "border-red-500 focus-visible:ring-red-500" : ""
                          )}
                        />
                        {errors.acao && (
                          <p className="text-xs text-red-500 mt-1">{errors.acao}</p>
                        )}
                      </div>

                      {/* 2. Cotação */}
                      <div>
                        <Label htmlFor="cotacao">Cotação (R$)</Label>
                        <Input
                          id="cotacao"
                          value={formData.cotacao}
                          onChange={(e) => handleCurrencyChange("cotacao", e.target.value)}
                          placeholder="0,00"
                          className={cn(
                            "placeholder-subtle mt-1.5",
                            errors.cotacao ? "border-red-500 focus-visible:ring-red-500" : ""
                          )}
                        />
                        {errors.cotacao && (
                          <p className="text-xs text-red-500 mt-1">{errors.cotacao}</p>
                        )}
                      </div>

                      {/* 3. Quantidade */}
                      <div>
                        <Label htmlFor="quantidade">Quantidade</Label>
                        <Input
                          id="quantidade"
                          value={formData.quantidade}
                          onChange={(e) => handleNumberChange("quantidade", e.target.value)}
                          placeholder="100"
                          className={cn(
                            "placeholder-subtle mt-1.5",
                            errors.quantidade ? "border-red-500 focus-visible:ring-red-500" : ""
                          )}
                        />
                        {errors.quantidade && (
                          <p className="text-xs text-red-500 mt-1">{errors.quantidade}</p>
                        )}
                      </div>

                      {/* 4. Vencimento */}
                      <div>
                        <Label htmlFor="data">Vencimento</Label>
                        <DateInput
                          id="data"
                          label=""
                          value={formData.data}
                          onChange={(value) => handleInputChange("data", value)}
                          error={errors.data}
                          className="mt-1.5"
                        />
                      </div>

                      {/* 5. Strike */}
                      <div>
                        <Label htmlFor="strike">Strike (R$)</Label>
                        <Input
                          id="strike"
                          value={formData.strike}
                          onChange={(e) => handleCurrencyChange("strike", e.target.value)}
                          placeholder="0,00"
                          className={cn(
                            "placeholder-subtle mt-1.5",
                            errors.strike ? "border-red-500 focus-visible:ring-red-500" : ""
                          )}
                        />
                        {errors.strike && (
                          <p className="text-xs text-red-500 mt-1">{errors.strike}</p>
                        )}
                      </div>

                      {/* 6. Prêmio */}
                      <div>
                        <Label htmlFor="premio">Prêmio (R$)</Label>
                        <Input
                          id="premio"
                          value={formData.premio}
                          onChange={(e) => handleCurrencyChange("premio", e.target.value)}
                          placeholder="0,00"
                          className={cn(
                            "placeholder-subtle mt-1.5",
                            errors.premio ? "border-red-500 focus-visible:ring-red-500" : ""
                          )}
                        />
                        {errors.premio && (
                          <p className="text-xs text-red-500 mt-1">{errors.premio}</p>
                        )}
                      </div>

                      {/* 7. Ticker da opção */}
                      <div>
                        <Label htmlFor="opcao">Ticker da opção</Label>
                        <div className={cn(
                          "flex rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 mt-1.5",
                          errors.opcao ? "border-red-500 focus-within:ring-red-500" : ""
                        )}>
                          <div className="flex items-center px-3 text-muted-foreground bg-muted/50 border-r border-input rounded-l-md select-none">
                            {formData.acao.substring(0, 4) || ""}
                          </div>
                          <Input
                            id="opcao"
                            value={formData.opcao.substring(formData.acao.substring(0, 4).length)}
                            onChange={(e) => {
                              const prefix = formData.acao.substring(0, 4);
                              const suffix = e.target.value.toUpperCase().replace(/[^A-Z0-9W]/g, '');
                              handleOpcaoChange(prefix + suffix);
                            }}
                            placeholder="H123"
                            maxLength={6}
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-l-none placeholder-subtle"
                          />
                        </div>
                        {errors.opcao && (
                          <p className="text-xs text-red-500 mt-1">{errors.opcao}</p>
                        )}
                      </div>

                    </div>
                  </div>
                </CardContent>

              </Card>

              <div className="pt-4 flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto px-6 rounded-full flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Voltar
                </Button>
                <Button type="submit" disabled={loading} className="w-full sm:w-auto px-8 rounded-full">
                  {loading ? "Cadastrando..." : "Concluir cadastro"}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Card lateral com análise de risco */}
        <Card className="w-full lg:w-80 h-fit bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              Análise de risco
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Hide "Diferença Strike vs Cotação" for trava, short put, short call, long put, and long call */}
            {!operationData.isTrava && !operationData.isShortPut && !operationData.isShortCall && !operationData.isLongPut && !operationData.isLongCall && (
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
            )}

            {/* GRAFICO CORRIGIDO: Estrutura CSS/Div sem Gap */}
            {operationData.isTrava ? (
              <div className="space-y-4 pb-4">
                <div>
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-slate-500">Ponto de equilíbrio</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">
                            É o preço que a ação precisa atingir para você não ter lucro nem prejuízo. Acima disso, você ganha. Abaixo, você perde.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {operationData.breakEven !== 0 ? formatCurrencyDisplay(operationData.breakEven) : '-'}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-slate-500">Distância do alvo</Label>
                  <p className="font-semibold text-slate-900">
                    {operationData.distanciaLabel}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-slate-500">Relação risco/retorno</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">
                            Para cada R$ 1,00 que você arrisca perder, você pode ganhar {formatCurrencyDisplay(operationData.payoffRatio)}.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {operationData.payoffRatio > 0 ? `1 : ${parseFloat(operationData.payoffRatio.toFixed(1))}` : "-"}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-slate-500">Nível de risco</Label>
                  <div className="relative mt-4 flex justify-center">
                    <div className="relative w-48 h-24 overflow-hidden">
                      <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-slate-100 box-border"></div>
                      <div
                        className="absolute top-0 left-0 w-48 h-48 rounded-full transition-all duration-700 ease-out"
                        style={{
                          background: `conic-gradient(${getRiskColorHex(operationData.corRisco)} 0deg ${operationData.progressValue * 1.8}deg, transparent ${operationData.progressValue * 1.8}deg 360deg)`,
                          transform: 'rotate(-90deg)',
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
              </div>
            ) : (
              !operationData.isShortPut && !operationData.isShortCall && !operationData.isLongPut && !operationData.isLongCall && (
                <div>
                  <Label className="text-sm text-slate-500 font-medium">Nível de risco</Label>
                  <div className="relative mt-4 flex justify-center">
                    <div className="relative w-48 h-24 overflow-hidden">
                      <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-slate-100 box-border"></div>
                      <div
                        className="absolute top-0 left-0 w-48 h-48 rounded-full transition-all duration-700 ease-out"
                        style={{
                          background: `conic-gradient(${getRiskColorHex(operationData.corRisco)} 0deg ${operationData.progressValue * 1.8}deg, transparent ${operationData.progressValue * 1.8}deg 360deg)`,
                          transform: 'rotate(-90deg)',
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
              )
            )}

            {/* SHORT PUT SPECIFIC LAYOUT */}
            {operationData.isShortPut && (
              <div className="space-y-4 pb-4">
                <div>
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-slate-500">Ponto de equilíbrio</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">
                            É o preço que a ação precisa atingir para você não ter lucro nem prejuízo. Acima disso, você ganha. Abaixo, você perde.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {operationData.breakEven !== 0 ? formatCurrencyDisplay(operationData.breakEven) : '-'}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-slate-500">Distância do ponto de equilíbrio</Label>
                  <p className="font-semibold text-slate-900">
                    {operationData.distanciaLabel}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-slate-500">Nível de risco</Label>
                  <div className="relative mt-4 flex justify-center">
                    <div className="relative w-48 h-24 overflow-hidden">
                      <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-slate-100 box-border"></div>
                      <div
                        className="absolute top-0 left-0 w-48 h-48 rounded-full transition-all duration-700 ease-out"
                        style={{
                          background: `conic-gradient(${getRiskColorHex(operationData.corRisco)} 0deg ${operationData.progressValue * 1.8}deg, transparent ${operationData.progressValue * 1.8}deg 360deg)`,
                          transform: 'rotate(-90deg)',
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
              </div>
            )}

            {/* SHORT CALL SPECIFIC LAYOUT */}
            {operationData.isShortCall && (
              <div className="space-y-4 pb-4">
                <div>
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-slate-500">Ponto de equilíbrio</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">
                            É o preço que a ação precisa atingir para você não ter lucro nem prejuízo. Acima disso, você perde. Abaixo, você ganha.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {operationData.breakEven !== 0 ? formatCurrencyDisplay(operationData.breakEven) : '-'}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-slate-500">Distância do ponto de equilíbrio</Label>
                  <p className="font-semibold text-slate-900">
                    {operationData.distanciaLabel}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-slate-500">Nível de risco</Label>
                  <div className="relative mt-4 flex justify-center">
                    <div className="relative w-48 h-24 overflow-hidden">
                      <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-slate-100 box-border"></div>
                      <div
                        className="absolute top-0 left-0 w-48 h-48 rounded-full transition-all duration-700 ease-out"
                        style={{
                          background: `conic-gradient(${getRiskColorHex(operationData.corRisco)} 0deg ${operationData.progressValue * 1.8}deg, transparent ${operationData.progressValue * 1.8}deg 360deg)`,
                          transform: 'rotate(-90deg)',
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
              </div>
            )}

            {/* LONG PUT SPECIFIC LAYOUT */}
            {operationData.isLongPut && (
              <div className="space-y-4 pb-4">
                <div>
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-slate-500">Ponto de equilíbrio</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">
                            É o preço que a ação precisa atingir para você não ter lucro nem prejuízo. Acima disso, você perde. Abaixo, você ganha.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {operationData.breakEven !== 0 ? formatCurrencyDisplay(operationData.breakEven) : '-'}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-slate-500">Distância do ponto de equilíbrio</Label>
                  <p className="font-semibold text-slate-900">
                    {operationData.distanciaLabel}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-slate-500">Nível de risco</Label>
                  <div className="relative mt-4 flex justify-center">
                    <div className="relative w-48 h-24 overflow-hidden">
                      <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-slate-100 box-border"></div>
                      <div
                        className="absolute top-0 left-0 w-48 h-48 rounded-full transition-all duration-700 ease-out"
                        style={{
                          background: `conic-gradient(${getRiskColorHex(operationData.corRisco)} 0deg ${operationData.progressValue * 1.8}deg, transparent ${operationData.progressValue * 1.8}deg 360deg)`,
                          transform: 'rotate(-90deg)',
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
              </div>
            )}

            {/* LONG CALL SPECIFIC LAYOUT */}
            {operationData.isLongCall && (
              <div className="space-y-4 pb-4">
                <div>
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-slate-500">Ponto de equilíbrio</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">
                            É o preço que a ação precisa atingir para você não ter lucro nem prejuízo. Acima disso, você ganha. Abaixo, você perde.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {operationData.breakEven !== 0 ? formatCurrencyDisplay(operationData.breakEven) : '-'}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-slate-500">Distância do ponto de equilíbrio</Label>
                  <p className="font-semibold text-slate-900">
                    {operationData.distanciaLabel}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-slate-500">Nível de risco</Label>
                  <div className="relative mt-4 flex justify-center">
                    <div className="relative w-48 h-24 overflow-hidden">
                      <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-slate-100 box-border"></div>
                      <div
                        className="absolute top-0 left-0 w-48 h-48 rounded-full transition-all duration-700 ease-out"
                        style={{
                          background: `conic-gradient(${getRiskColorHex(operationData.corRisco)} 0deg ${operationData.progressValue * 1.8}deg, transparent ${operationData.progressValue * 1.8}deg 360deg)`,
                          transform: 'rotate(-90deg)',
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
              </div>
            )}



            <div className="pt-4 border-t border-slate-100 space-y-4">
              {/* Trava-specific metrics */}
              {operationData.isTrava ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-500">Risco máximo</Label>
                    <p className="font-semibold text-red-600">
                      {operationData.custoTotal !== 0 ? formatCurrencyDisplay(-operationData.custoTotal) : '-'}
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-500">Lucro máximo</Label>
                    <p className="font-semibold text-green-600">
                      {operationData.lucroMaximo !== 0 ? formatCurrencyDisplay(operationData.lucroMaximo) : '-'}
                    </p>
                  </div>
                </div>


              ) : (
                <>
                  {/* Original metrics for non-trava strategies */}
                  {!operationData.isShortPut && !operationData.isShortCall && !operationData.isLongPut && !operationData.isLongCall && operationData.mostrarValorExercicio && (
                    <div>
                      <Label className="text-xs text-slate-500">Valor de Exercício</Label>
                      <p className="font-semibold text-slate-900">
                        {formatCurrencyDisplay(operationData.valorExercicio)}
                      </p>
                    </div>
                  )}

                  {!operationData.isShortPut && !operationData.isShortCall && !operationData.isLongPut && !operationData.isLongCall && (
                    <div>
                      <Label className="text-xs text-slate-500">{operationData.valorTotalLabel}</Label>
                      <p className={`font-semibold ${operationData.isGanho ? 'text-green-600' : 'text-red-600'}`}>
                        {operationData.valorTotal !== 0 ? formatCurrencyDisplay(operationData.valorTotal) : '-'}
                      </p>
                    </div>
                  )}

                  {!operationData.isShortPut && !operationData.isShortCall && !operationData.isLongPut && !operationData.isLongCall && operationData.mostrarAlavancagem && (
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
                </>
              )}

              {/* SHORT PUT SPECIFIC METRICS */}
              {operationData.isShortPut && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1">
                        <Label className="text-xs text-slate-500">Risco máximo</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">
                                Representa o valor que você precisará ter em conta se for exercido. Você será obrigado a comprar as ações pelo valor do Strike, independente de quanto elas estejam valendo no mercado.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="font-semibold text-red-600">
                        {operationData.valorExercicio !== 0 ? formatCurrencyDisplay(-operationData.valorExercicio) : '-'}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <Label className="text-xs text-slate-500">Lucro máximo</Label>
                      </div>
                      <p className="font-semibold text-green-600">
                        {operationData.valorTotal !== 0 ? formatCurrencyDisplay(operationData.valorTotal) : '-'}
                      </p>
                    </div>
                  </div>

                  {operationData.mostrarAlavancagem && (
                    <div className={cn(
                      "rounded-lg p-3 flex items-center justify-center gap-2 text-white font-bold text-sm",
                      operationData.isAlavancado ? "bg-red-600" : "bg-green-600"
                    )}>
                      {operationData.isAlavancado ? (
                        <>
                          <AlertTriangle className="h-4 w-4 text-white" />
                          {operationData.statusAlavancagem}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 text-white" />
                          100% Coberto
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SHORT CALL SPECIFIC METRICS */}
              {operationData.isShortCall && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1">
                        <Label className="text-xs text-slate-500">Risco máximo</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">
                                Se for exercido, você terá que entregar esta quantidade de ações para o comprador ou ter {formatCurrencyDisplay((parseCurrencyToNumber(formData.strike) - parseCurrencyToNumber(formData.premio)) * parseNumberToInt(formData.quantidade))} para comprar as ações
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="font-semibold text-red-600 text-sm">
                        -{formData.quantidade || 0} ações
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <Label className="text-xs text-slate-500">Lucro máximo</Label>
                      </div>
                      <p className="font-semibold text-green-600">
                        {operationData.valorTotal !== 0 ? formatCurrencyDisplay(operationData.valorTotal) : '-'}
                      </p>
                    </div>
                  </div>

                  {operationData.mostrarAlavancagem && (
                    <div className={cn(
                      "rounded-lg p-3 flex items-center justify-center gap-2 text-white font-bold text-sm",
                      operationData.isAlavancado ? "bg-red-600" : "bg-green-600"
                    )}>
                      {operationData.isAlavancado ? (
                        <>
                          <AlertTriangle className="h-4 w-4 text-white" />
                          {operationData.statusAlavancagem}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 text-white" />
                          100% Coberto
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* LONG PUT SPECIFIC METRICS */}
              {operationData.isLongPut && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1">
                        <Label className="text-xs text-slate-500">Risco máximo</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">
                                Este é o valor máximo que você pode perder: o dinheiro que você pagou para montar a operação. Você não fica devendo nada além disso.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="font-semibold text-red-600">
                        {operationData.valorTotal !== 0 ? formatCurrencyDisplay(operationData.valorTotal) : '-'}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <Label className="text-xs text-slate-500">Ganho máximo</Label>
                      </div>
                      <p className="font-semibold text-green-600">
                        {operationData.valorTotal !== 0 ? 'Exponencial' : '-'}
                      </p>
                    </div>
                  </div>

                  {operationData.mostrarAlavancagem && (
                    <div className={cn(
                      "rounded-lg p-3 flex items-center justify-center gap-2 text-white font-bold text-sm",
                      operationData.isAlavancado ? "bg-red-600" : "bg-green-600"
                    )}>
                      {operationData.isAlavancado ? (
                        <>
                          <AlertTriangle className="h-4 w-4 text-white" />
                          Especulação (Sem ativo)
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 text-white" />
                          Carteira Protegida
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* LONG CALL SPECIFIC METRICS */}
              {operationData.isLongCall && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1">
                        <Label className="text-xs text-slate-500">Risco máximo</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">
                                Valor máximo que você pode perder nesta operação. Limitado ao prêmio pago.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="font-semibold text-red-600">
                        {operationData.valorTotal !== 0 ? formatCurrencyDisplay(operationData.valorTotal) : '-'}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <Label className="text-xs text-slate-500">Ganho máximo</Label>
                      </div>
                      <p className="font-semibold text-green-600">
                        {operationData.valorTotal !== 0 ? 'Exponencial' : '-'}
                      </p>
                    </div>
                  </div>

                  {operationData.mostrarAlavancagem && (
                    <div className={cn(
                      "rounded-lg p-3 flex items-center justify-center gap-2 text-white font-bold text-sm",
                      operationData.isAlavancado ? "bg-orange-600" : "bg-green-600"
                    )}>
                      {operationData.isAlavancado ? (
                        <>
                          <AlertTriangle className="h-4 w-4 text-white" />
                          Especulação (Sem caixa)
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 text-white" />
                          Exercício garantido
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Rascunhos salvos section */}
      {step === 2 && drafts.length > 0 && (
        <div className="mt-24 border-t pt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Rascunhos salvos</h2>
          <p className="text-sm text-slate-600 mb-6">
            Ajuste os parâmetros e veja em tempo real como essa operação impacta seu risco e retorno.
            Salve os melhores cenários para rascunho para comparar depois.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {drafts.map((draft) => {
              const isExpanded = expandedDrafts.includes(draft.id);

              return (
                <Card key={draft.id} className="bg-white overflow-hidden">
                  {/* Header with ticker */}
                  <CardHeader
                    className="cursor-pointer hover:bg-slate-50 transition-colors pb-4"
                    onClick={() => {
                      if (isExpanded) {
                        setExpandedDrafts(prev => prev.filter(id => id !== draft.id));
                      } else {
                        setExpandedDrafts(prev => [...prev, draft.id]);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-900">
                        {draft.isTrava
                          ? `${draft.travaData?.compra?.ticker || 'CP'} / ${draft.travaData?.venda?.ticker || 'VD'}`
                          : (draft.formData.opcao || 'PETRH363')
                        }
                      </h3>
                      <ChevronDown className={cn(
                        "h-5 w-5 text-slate-400 transition-transform",
                        isExpanded && "transform rotate-180"
                      )} />
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-4">
                    {/* 3-column grid: Strike, Qnt, Vencimento with dividers */}
                    <div className="grid grid-cols-3 gap-0 text-center divide-x divide-slate-200">
                      <div className="px-2">
                        <p className="text-xs text-slate-500 mb-1">Strike</p>
                        <p className="font-semibold text-sm truncate">
                          {draft.isTrava
                            ? `${draft.travaData?.compra?.strike || '-'} / ${draft.travaData?.venda?.strike || '-'}`
                            : (draft.formData.strike ? formatCurrencyDisplay(parseCurrencyToNumber(draft.formData.strike)) : '-')
                          }
                        </p>
                      </div>
                      <div className="px-2">
                        <p className="text-xs text-slate-500 mb-1">Qnt</p>
                        <p className="font-semibold text-sm">{draft.formData.quantidade || '-'}</p>
                      </div>
                      <div className="px-2">
                        <p className="text-xs text-slate-500 mb-1">Vencimento</p>
                        <p className="font-semibold text-sm">
                          {draft.formData.data ? format(parseLocalDate(draft.formData.data), 'dd/MM/yyyy') : '-'}
                        </p>
                      </div>
                    </div>

                    {/* Dotted separator */}
                    <div className="border-t border-dashed border-slate-300" />

                    {/* Expanded content */}
                    {isExpanded && draft.operationData && (
                      <>
                        {/* Break-even point */}
                        {draft.operationData.breakEven && draft.operationData.breakEven !== 0 && (
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <p className="text-sm text-slate-600">Ponto de equilíbrio</p>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Preço da ação onde você não ganha nem perde</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <p className="text-lg font-bold text-slate-900">
                              {formatCurrencyDisplay(draft.operationData.breakEven)}
                            </p>
                          </div>
                        )}

                        {/* Distance to break-even */}
                        {draft.operationData.distanciaLabel && draft.operationData.distanciaLabel !== '-' && (
                          <div>
                            <p className="text-sm text-slate-600 mb-1">Distância do ponto de equilíbrio</p>
                            <p className="text-base font-bold text-slate-900">
                              {draft.operationData.distanciaLabel}
                            </p>
                          </div>
                        )}

                        {/* Risk/Return Ratio */}
                        {draft.operationData.payoffRatio > 0 && (
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <p className="text-sm text-slate-600">Relação risco/retorno</p>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Para cada R$ 1,00 de risco, quanto você pode ganhar</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <p className="text-base font-bold text-slate-900">
                              1 : {parseFloat(draft.operationData.payoffRatio.toFixed(1))}
                            </p>
                          </div>
                        )}

                        {/* Risk level with semicircular gauge */}
                        {draft.operationData.nivelRisco && draft.operationData.nivelRisco !== '-' && (
                          <div>
                            <p className="text-sm text-slate-600 mb-3">Nível de risco</p>
                            <div className="relative flex justify-center">
                              <div className="relative w-48 h-24 overflow-hidden">
                                <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-slate-100 box-border"></div>
                                <div
                                  className="absolute top-0 left-0 w-48 h-48 rounded-full transition-all duration-700 ease-out"
                                  style={{
                                    background: `conic-gradient(${getRiskColorHex(draft.operationData.corRisco)} 0deg ${draft.operationData.progressValue * 1.8}deg, transparent ${draft.operationData.progressValue * 1.8}deg 360deg)`,
                                    transform: 'rotate(-90deg)',
                                    maskImage: 'radial-gradient(transparent 63%, black 64%)',
                                    WebkitMaskImage: 'radial-gradient(transparent 63%, black 64%)',
                                  }}
                                ></div>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 text-center">
                                <p className={cn("font-bold text-lg capitalize", draft.operationData.corRisco)}>
                                  {draft.operationData.nivelRisco}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Dotted separator between gauge and risk/profit */}
                        {draft.operationData.nivelRisco && draft.operationData.nivelRisco !== '-' && (
                          <div className="border-t border-dashed border-slate-300" />
                        )}

                        {/* Max risk and max profit */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <p className="text-sm text-slate-600">Risco máximo</p>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Máximo que você pode perder nesta operação</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <p className="text-base font-bold text-red-600">
                              {draft.operationData.riscoMaximo
                                ? `-${formatCurrencyDisplay(Math.abs(draft.operationData.riscoMaximo))}`
                                : draft.operationData.valorTotal
                                  ? `-${formatCurrencyDisplay(Math.abs(draft.operationData.valorTotal))}`
                                  : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600 mb-1">Lucro máximo</p>
                            <p className="text-base font-bold text-green-600">
                              {draft.operationData.lucroMaximoLabel ||
                                (draft.operationData.lucroMaximo && draft.operationData.lucroMaximo !== 0
                                  ? formatCurrencyDisplay(draft.operationData.lucroMaximo)
                                  : 'Exponencial')}
                            </p>
                          </div>
                        </div>

                        {/* Dotted separator before buttons */}
                        <div className="border-t border-dashed border-slate-300" />
                      </>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-3">
                      <Button
                        size="lg"
                        className="flex-1 rounded-full bg-[#263C64] hover:bg-[#1e3050] text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddDraftToPortfolio(draft);
                        }}
                      >
                        <CirclePlus className="h-5 w-5 mr-2" />
                        Adicionar
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="rounded-full h-12 w-12"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditDraft(draft);
                        }}
                      >
                        <Edit className="h-5 w-5 text-slate-600" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="rounded-full h-12 w-12 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDraft(draft.id);
                        }}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        onGoToPortfolio={() => {
          setSuccessModalOpen(false);
          navigate("/opcoes");
        }}
        onAddAnother={() => {
          setSuccessModalOpen(false);
          setStep(1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}