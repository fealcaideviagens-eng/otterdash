import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useOpcoes } from "@/hooks/useOpcoes";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { TickerInput } from "@/components/operations/inputs/TickerInput";
import { CurrencyInput } from "@/components/operations/inputs/CurrencyInput";
import { DateInput } from "@/components/operations/inputs/DateInput";
import { DollarSign, Building2, ArrowBigDownDash, ArrowBigUpDash, ChevronLeft } from "lucide-react";
import { parseCurrencyToNumber, parseNumberToInt } from "@/utils/inputFormatters";
import { parseLocalDate } from "@/utils/formatters";
import { SuccessModal } from "@/components/operations/SuccessModal";
import { supabase } from "@/integrations/supabase/client";

const OPERATION_TYPES = [
    {
        id: "venda_put",
        label: "Venda de put",
        icon: DollarSign,
        colorClass: "bg-blue-100 text-blue-700",
        operacao: "venda",
        tipo: "put"
    },
    {
        id: "venda_call",
        label: "Venda de call",
        icon: Building2,
        colorClass: "bg-blue-100 text-blue-700",
        operacao: "venda",
        tipo: "call"
    },
    {
        id: "compra_put",
        label: "Compra de put",
        icon: ArrowBigDownDash,
        colorClass: "bg-red-100 text-red-700",
        operacao: "compra",
        tipo: "put"
    },
    {
        id: "compra_call",
        label: "Compra de call",
        icon: ArrowBigUpDash,
        colorClass: "bg-green-100 text-green-700",
        operacao: "compra",
        tipo: "call"
    }
];

export default function CadastroRapido() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addOpcao } = useOpcoes(user?.id || '');
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [selectedType, setSelectedType] = useState("venda_put");
    const [formData, setFormData] = useState({
        acao: "",
        ticker: "",
        strike: "",
        premio: "",
        quantidade: "",
        vencimento: ""
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const acaoInputRef = useRef<HTMLInputElement>(null);

    const CALL_MONTHS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    const PUT_MONTHS = ['M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'];

    // Auto-fill Ticker Prefix when Acao, Date or Type changes
    useEffect(() => {
        const updateTickerPrefix = () => {
            const selectedOp = OPERATION_TYPES.find(t => t.id === selectedType);
            if (!selectedOp || !formData.acao || formData.acao.length < 4 || !formData.vencimento) {
                return;
            }

            const prefix = formData.acao.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '');
            if (prefix.length < 4) return;

            const vencimento = parseLocalDate(formData.vencimento);
            const monthIndex = vencimento.getMonth();
            const letter = selectedOp.tipo === 'call' ? CALL_MONTHS[monthIndex] : PUT_MONTHS[monthIndex];

            const newPrefix = prefix + letter;

            // Preserve existing suffix numbers/chars if any
            let currentSuffix = "";
            if (formData.ticker && formData.ticker.length > 5) {
                // If current ticker starts with the same root prefix (first 4 chars), try to keep the suffix
                const currentRoot = formData.ticker.substring(0, 4);
                if (currentRoot === prefix) {
                    currentSuffix = formData.ticker.substring(5);
                }
            }

            setFormData(prev => ({ ...prev, ticker: newPrefix + currentSuffix }));
        };

        const timeoutId = setTimeout(updateTickerPrefix, 100);
        return () => clearTimeout(timeoutId);
    }, [formData.acao, formData.vencimento, selectedType]);

    // Auto-fill Ação based on Ticker (reverse logic similar to CadastroOpcao, but optional here)
    // Only if Acao is empty and Ticker is filled manually
    useEffect(() => {
        const fetchAcao = async () => {
            // Only if Acao is empty allow reverse lookup to not override user input
            if (formData.acao) return;

            const ticker = formData.ticker;
            if (!ticker || ticker.length < 4) return;

            const prefix = ticker.substring(0, 4);
            // Default to prefix if no DB lookup needed, or implement full lookup
            setFormData(prev => ({ ...prev, acao: prefix }));
        };

        // Debounce slightly longer to avoid clashing with the forward update
        const timeoutId = setTimeout(fetchAcao, 800);
        return () => clearTimeout(timeoutId);
    }, [formData.ticker]);


    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Limpar erros
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleAcaoChange = (val: string) => {
        const upperValue = val.toUpperCase();
        const cleanValue = upperValue.replace(/[^A-Z0-9]/g, '');
        if (cleanValue.length <= 6) {
            handleInputChange("acao", cleanValue);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        const newErrors: Record<string, string> = {};
        let hasError = false;

        // Get selected operation details
        const selectedOp = OPERATION_TYPES.find(t => t.id === selectedType)!;

        // Basic required field validation
        if (!formData.acao) {
            newErrors.acao = "Preencha o código da ação";
            hasError = true;
        }

        const tickerRegex = /^[A-Z]{5}[0-9]{1,3}(W[0-9]?)?$/;
        if (!formData.ticker) {
            newErrors.ticker = "Preencha com o ticker da opção";
            hasError = true;
        } else if (!tickerRegex.test(formData.ticker)) {
            newErrors.ticker = "Formato inválido. Ex: PETRA123";
            hasError = true;
        }

        if (!formData.strike) {
            newErrors.strike = "Preencha com o strike";
            hasError = true;
        }
        if (!formData.premio) {
            newErrors.premio = "Preencha com o prêmio";
            hasError = true;
        }
        if (!formData.quantidade) {
            newErrors.quantidade = "Preencha com a quantidade";
            hasError = true;
        }
        if (!formData.vencimento) {
            newErrors.vencimento = "Selecione a data de vencimento";
            hasError = true;
        }

        // Semantic validation of ticker's 5th letter (month and type)
        if (!hasError && formData.ticker && formData.ticker.length >= 5 && formData.vencimento) {
            const fifthLetter = formData.ticker.charAt(4).toUpperCase();
            const vencimento = parseLocalDate(formData.vencimento);
            const monthIndex = vencimento.getMonth(); // 0 = Jan, 11 = Dez

            const isCallLetter = CALL_MONTHS.includes(fifthLetter);
            const isPutLetter = PUT_MONTHS.includes(fifthLetter);

            // 1. Validate Type (Call vs Put)
            if (selectedOp.tipo === 'call' && !isCallLetter) {
                if (isPutLetter) {
                    newErrors.ticker = "Ticker indica PUT (M-X), mas tipo é CALL.";
                } else {
                    newErrors.ticker = "5ª letra inválida para CALL (deve ser A-L).";
                }
                hasError = true;
            } else if (selectedOp.tipo === 'put' && !isPutLetter) {
                if (isCallLetter) {
                    newErrors.ticker = "Ticker indica CALL (A-L), mas tipo é PUT.";
                } else {
                    newErrors.ticker = "5ª letra inválida para PUT (deve ser M-X).";
                }
                hasError = true;
            }

            // 2. Validate Month
            if (!hasError) {
                const expectedLetter = selectedOp.tipo === 'call' ? CALL_MONTHS[monthIndex] : PUT_MONTHS[monthIndex];
                if (fifthLetter !== expectedLetter) {
                    const monthName = vencimento.toLocaleString('pt-BR', { month: 'long' });
                    const monthNameCap = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                    newErrors.ticker = `Para ${selectedOp.tipo.toUpperCase()} em ${monthNameCap}, a letra deve ser '${expectedLetter}'.`;
                    hasError = true;
                }
            }
        }

        // Validate Ticker matches Action
        if (!hasError && formData.acao && formData.ticker) {
            const acaoPrefix = formData.acao.substring(0, 4);
            if (!formData.ticker.startsWith(acaoPrefix)) {
                newErrors.ticker = `O ticker deve começar com ${acaoPrefix}`;
                hasError = true;
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            toast({
                variant: "destructive",
                title: "Erro no formulário",
                description: "Preencha todos os campos obrigatórios corretamente."
            });
            return;
        }

        try {
            await addOpcao({
                opcao: formData.ticker,
                strike: formData.strike,
                premio: formData.premio,
                quantidade: formData.quantidade,
                data: formData.vencimento,
                operacao: selectedOp.operacao,
                tipo: selectedOp.tipo,
                status: "aberta",
                acao: formData.acao,
                cotacao: 0 // Not asked in quick form
            });

            setSuccessModalOpen(true);
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Erro ao cadastrar opção."
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoToPortfolio = () => {
        setSuccessModalOpen(false);
        navigate("/opcoes");
    };

    const handleAddAnother = () => {
        setSuccessModalOpen(false);
        setFormData({
            acao: "",
            ticker: "",
            strike: "",
            premio: "",
            quantidade: "",
            vencimento: ""
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Cadastre sua operação</h1>
                <p className="text-slate-600 mt-2">Preencha os detalhes abaixo para atualizar sua carteira.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column: Option Type Selector */}
                <Card className="w-full lg:w-1/3 h-fit bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Opção</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {OPERATION_TYPES.map((type) => (
                            <div
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-full cursor-pointer transition-colors",
                                    selectedType === type.id ? "bg-slate-50" : "hover:bg-slate-50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center",
                                        type.colorClass
                                    )}>
                                        <type.icon className="h-5 w-5" />
                                    </div>
                                    <span className="font-medium text-slate-900">{type.label}</span>
                                </div>
                                <div className={cn(
                                    "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                                    selectedType === type.id ? "border-blue-600" : "border-slate-300"
                                )}>
                                    {selectedType === type.id && (
                                        <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Right Column: Form */}
                <Card className="flex-1 bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Dados da opção</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* Linha 1: Ação e Quantidade */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="acao">Ação</Label>
                                <Input
                                    id="acao"
                                    ref={acaoInputRef}
                                    placeholder="Ex: PETR4"
                                    value={formData.acao}
                                    onChange={(e) => handleAcaoChange(e.target.value)}
                                    maxLength={6}
                                    className={cn(
                                        "font-mono uppercase placeholder-subtle mt-1.5",
                                        errors.acao ? "border-red-500 focus-visible:ring-red-500" : ""
                                    )}
                                />
                                {errors.acao && (
                                    <p className="text-xs text-red-500 mt-1">{errors.acao}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="quantidade">Quantidade</Label>
                                <Input
                                    id="quantidade"
                                    type="number"
                                    placeholder="100"
                                    value={formData.quantidade}
                                    onChange={(e) => handleInputChange("quantidade", e.target.value)}
                                    className={cn(
                                        "placeholder-subtle mt-1.5",
                                        errors.quantidade ? "border-red-500 focus-visible:ring-red-500" : ""
                                    )}
                                />
                                {errors.quantidade && (
                                    <p className="text-xs text-red-500 mt-1">{errors.quantidade}</p>
                                )}
                            </div>
                        </div>

                        {/* Linha 2: Premio e Strike */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CurrencyInput
                                id="premio"
                                label="Prêmio (R$)"
                                value={formData.premio}
                                onChange={(val) => handleInputChange("premio", val)}
                                error={errors.premio}
                            />
                            <CurrencyInput
                                id="strike"
                                label="Strike (R$)"
                                value={formData.strike}
                                onChange={(val) => handleInputChange("strike", val)}
                                error={errors.strike}
                            />
                        </div>

                        {/* Linha 3: Vencimento e Ticker da opção */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DateInput
                                id="vencimento"
                                label="Vencimento"
                                value={formData.vencimento}
                                onChange={(val) => handleInputChange("vencimento", val)}
                                error={errors.vencimento}
                            />
                            <TickerInput
                                id="ticker"
                                label="Ticker da opção"
                                placeholder="ex: PETRH123"
                                value={formData.ticker}
                                onChange={(val) => handleInputChange("ticker", val)}
                                error={errors.ticker}
                            />
                        </div>

                    </CardContent>
                </Card>
            </div>

            {/* Container: flex-col-reverse (mobile) e md:flex-row (desktop) */}
            <div className="flex flex-col-reverse md:flex-row gap-4 mt-8 w-full">

                {/* Botão Voltar (Agora é o PRIMEIRO no HTML) */}
                <Button
                    variant="outline"
                    size="lg"
                    // w-full (mobile) e md:w-auto (desktop)
                    className="w-full md:w-auto rounded-full flex items-center justify-center gap-2"
                    onClick={() => navigate("/nova-operacao")}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Voltar
                </Button>

                {/* Botão Adicionar (Agora é o SEGUNDO no HTML) */}
                <Button
                    size="lg"
                    // w-full (mobile) e md:w-auto (desktop)
                    className="w-full md:w-auto rounded-full bg-brand-blue-dark hover:bg-brand-blue"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Salvando..." : "Adicionar opção"}
                </Button>

            </div>


            <SuccessModal
                isOpen={successModalOpen}
                onClose={() => setSuccessModalOpen(false)}
                onGoToPortfolio={handleGoToPortfolio}
                onAddAnother={handleAddAnother}
            />
        </div>
    );
}
