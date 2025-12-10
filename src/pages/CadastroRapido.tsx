import { useState } from "react";
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
import { formatDateForInput, parseLocalDate } from "@/utils/formatters";
import { SuccessModal } from "@/components/operations/SuccessModal";


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
        ticker: "",
        strike: "",
        premio: "",
        quantidade: "",
        vencimento: ""
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [successModalOpen, setSuccessModalOpen] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        const newErrors: Record<string, string> = {};
        let hasError = false;

        // Get selected operation details
        const selectedOp = OPERATION_TYPES.find(t => t.id === selectedType)!;

        // Basic required field validation
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

            const CALL_MONTHS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
            const PUT_MONTHS = ['M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'];

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

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            toast({
                variant: "destructive",
                title: "Erro no formulário",
                description: "Preencha todos os campos obrigatórios."
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
                acao: "", // Don't guess, let user edit later
                cotacao: 0 // Not asked in quick form, maybe fetch or default to 0
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
            ticker: "",
            strike: "",
            premio: "",
            quantidade: "",
            vencimento: ""
        });
        // Optional: Keep the selected type or reset it? Usually keep it.
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TickerInput
                                id="ticker"
                                label="Ticker da opção"
                                placeholder="ex: PETRH123"
                                value={formData.ticker}
                                onChange={(val) => handleInputChange("ticker", val)}
                                error={errors.ticker}
                            />
                            <CurrencyInput
                                id="strike"
                                label="Strike (R$)"
                                value={formData.strike}
                                onChange={(val) => handleInputChange("strike", val)}
                                error={errors.strike}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CurrencyInput
                                id="premio"
                                label="Prêmio (R$)"
                                value={formData.premio}
                                onChange={(val) => handleInputChange("premio", val)}
                                error={errors.premio}
                            />
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

                        <div className="w-full md:w-1/2 pr-0 md:pr-3">
                            <DateInput
                                id="vencimento"
                                label="Vencimento"
                                value={formData.vencimento}
                                onChange={(val) => handleInputChange("vencimento", val)}
                                error={errors.vencimento}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex gap-4 mt-8">
                <Button
                    variant="outline"
                    size="lg"
                    className="px-8 rounded-full"
                    onClick={() => navigate("/nova-operacao")}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Voltar
                </Button>

                <Button
                    size="lg"
                    className="px-8 rounded-full bg-[#263C64] hover:bg-[#1e3050]"
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
