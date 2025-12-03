import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    ResponsiveModal,
    ResponsiveModalContent,
    ResponsiveModalHeader,
    ResponsiveModalTitle,
    ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Opcao } from "@/types/database";
import { formatCurrency, formatNumber, formatCurrencyValue, parseCurrencyToNumber, parseNumberToInt } from "@/utils/inputFormatters";
import { formatDateForInput, parseLocalDate } from "@/utils/formatters";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StrategyGroup {
    id: string;
    type: string;
    legs: Opcao[];
    acao: string;
    data: string;
    custoTotal: number;
    lucroMaximo: number;
    breakEven: number;
    quantidade: number;
}

interface EditarTravaModalProps {
    strategy: StrategyGroup | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: {
        compraData: Partial<Opcao>;
        vendaData: Partial<Opcao>;
    }) => void;
}

export function EditarTravaModal({
    strategy,
    isOpen,
    onClose,
    onConfirm,
}: EditarTravaModalProps) {
    const [formData, setFormData] = useState({
        acao: "",
        cotacao: "",
        quantidade: "",
        data: "",
        compraTicker: "",
        compraStrike: "",
        compraPremio: "",
        vendaTicker: "",
        vendaStrike: "",
        vendaPremio: "",
    });
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        if (strategy) {
            const compraLeg = strategy.legs.find(leg => leg.ops_strategy_role === 'LONG_LEG');
            const vendaLeg = strategy.legs.find(leg => leg.ops_strategy_role === 'SHORT_LEG');

            if (compraLeg && vendaLeg) {
                setFormData({
                    acao: compraLeg.ops_acao || "",
                    cotacao: compraLeg.acao_cotacao ? formatCurrencyValue(compraLeg.acao_cotacao) : "",
                    quantidade: compraLeg.ops_quanti ? formatNumber(compraLeg.ops_quanti.toString()) : "",
                    data: compraLeg.ops_vencimento || "",
                    compraTicker: compraLeg.ops_ticker || "",
                    compraStrike: compraLeg.ops_strike ? formatCurrencyValue(compraLeg.ops_strike) : "",
                    compraPremio: compraLeg.ops_premio ? formatCurrencyValue(compraLeg.ops_premio) : "",
                    vendaTicker: vendaLeg.ops_ticker || "",
                    vendaStrike: vendaLeg.ops_strike ? formatCurrencyValue(vendaLeg.ops_strike) : "",
                    vendaPremio: vendaLeg.ops_premio ? formatCurrencyValue(vendaLeg.ops_premio) : "",
                });
            }
        }
    }, [strategy]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!strategy) return;

        const compraLeg = strategy.legs.find(leg => leg.ops_strategy_role === 'LONG_LEG');
        const vendaLeg = strategy.legs.find(leg => leg.ops_strategy_role === 'SHORT_LEG');

        if (!compraLeg || !vendaLeg) return;

        const compraData: Partial<Opcao> = {
            opcao: formData.compraTicker,
            ops_ticker: formData.compraTicker,
            ops_acao: formData.acao,
            acao_cotacao: parseCurrencyToNumber(formData.cotacao),
            ops_quanti: parseNumberToInt(formData.quantidade),
            ops_vencimento: formData.data,
            ops_strike: parseCurrencyToNumber(formData.compraStrike),
            ops_premio: parseCurrencyToNumber(formData.compraPremio),
        };

        const vendaData: Partial<Opcao> = {
            opcao: formData.vendaTicker,
            ops_ticker: formData.vendaTicker,
            ops_acao: formData.acao,
            acao_cotacao: parseCurrencyToNumber(formData.cotacao),
            ops_quanti: parseNumberToInt(formData.quantidade),
            ops_vencimento: formData.data,
            ops_strike: parseCurrencyToNumber(formData.vendaStrike),
            ops_premio: parseCurrencyToNumber(formData.vendaPremio),
        };

        onConfirm({ compraData, vendaData });
        onClose();
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCurrencyChange = (field: string, value: string) => {
        const formatted = formatCurrency(value);
        setFormData(prev => ({
            ...prev,
            [field]: formatted
        }));
    };

    const handleNumberChange = (field: string, value: string) => {
        const formatted = formatNumber(value);
        setFormData(prev => ({
            ...prev,
            [field]: formatted
        }));
    };

    if (!strategy) return null;

    return (
        <ResponsiveModal open={isOpen} onOpenChange={onClose}>
            <ResponsiveModalContent className="sm:max-w-lg max-h-[85vh] flex flex-col bg-white">
                <ResponsiveModalHeader>
                    <ResponsiveModalTitle>
                        {strategy.type === 'BULL_CALL_SPREAD' ? 'Editar trava de alta' : 'Editar trava de baixa'}
                    </ResponsiveModalTitle>
                </ResponsiveModalHeader>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="space-y-4 px-4 sm:px-0 pb-4 overflow-y-auto flex-1">

                        {/* Bloco Fixo - Dados Comuns */}
                        <Card className="bg-white border-l-4 border-l-gray-400">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold text-gray-700">
                                    Dados da operação
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="acao">Ação</Label>
                                        <Input
                                            id="acao"
                                            value={formData.acao}
                                            onChange={(e) => handleInputChange("acao", e.target.value)}
                                            className="placeholder-subtle bg-white"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label htmlFor="cotacao">Cotação</Label>
                                            <Input
                                                id="cotacao"
                                                value={formData.cotacao}
                                                onChange={(e) => handleCurrencyChange("cotacao", e.target.value)}
                                                className="placeholder-subtle bg-white"
                                                placeholder="0,00"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="quantidade">Quantidade</Label>
                                            <Input
                                                id="quantidade"
                                                value={formData.quantidade}
                                                onChange={(e) => handleNumberChange("quantidade", e.target.value)}
                                                className="placeholder-subtle bg-white"
                                                placeholder="100"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Vencimento</Label>
                                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background",
                                                        !formData.data && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {formData.data ? (
                                                        format(parseLocalDate(formData.data), "dd/MM/yyyy")
                                                    ) : (
                                                        <span>Selecione a data</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={formData.data ? parseLocalDate(formData.data) : undefined}
                                                    defaultMonth={formData.data ? parseLocalDate(formData.data) : undefined}
                                                    onSelect={(date) => {
                                                        if (date) {
                                                            const dateStr = formatDateForInput(date);
                                                            handleInputChange("data", dateStr);
                                                            setIsCalendarOpen(false);
                                                        }
                                                    }}
                                                    initialFocus
                                                    locale={ptBR}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Opção Comprada */}
                        <Card className="bg-white border-l-4 border-l-emerald-500">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold text-emerald-700">
                                    Opção comprada
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="compraTicker">Ticker</Label>
                                        <Input
                                            id="compraTicker"
                                            value={formData.compraTicker}
                                            onChange={(e) => handleInputChange("compraTicker", e.target.value)}
                                            className="placeholder-subtle bg-white"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label htmlFor="compraStrike">Strike</Label>
                                            <Input
                                                id="compraStrike"
                                                value={formData.compraStrike}
                                                onChange={(e) => handleCurrencyChange("compraStrike", e.target.value)}
                                                className="placeholder-subtle bg-white"
                                                placeholder="0,00"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="compraPremio">Prêmio</Label>
                                            <Input
                                                id="compraPremio"
                                                value={formData.compraPremio}
                                                onChange={(e) => handleCurrencyChange("compraPremio", e.target.value)}
                                                className="placeholder-subtle bg-white"
                                                placeholder="0,00"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Opção Vendida */}
                        <Card className="bg-white border-l-4 border-l-red-500">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold text-red-700">
                                    Opção vendida
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="vendaTicker">Ticker</Label>
                                        <Input
                                            id="vendaTicker"
                                            value={formData.vendaTicker}
                                            onChange={(e) => handleInputChange("vendaTicker", e.target.value)}
                                            className="placeholder-subtle bg-white"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label htmlFor="vendaStrike">Strike</Label>
                                            <Input
                                                id="vendaStrike"
                                                value={formData.vendaStrike}
                                                onChange={(e) => handleCurrencyChange("vendaStrike", e.target.value)}
                                                className="placeholder-subtle bg-white"
                                                placeholder="0,00"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="vendaPremio">Prêmio</Label>
                                            <Input
                                                id="vendaPremio"
                                                value={formData.vendaPremio}
                                                onChange={(e) => handleCurrencyChange("vendaPremio", e.target.value)}
                                                className="placeholder-subtle bg-white"
                                                placeholder="0,00"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <ResponsiveModalFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="default">
                            Salvar alterações
                        </Button>
                    </ResponsiveModalFooter>
                </form>
            </ResponsiveModalContent>
        </ResponsiveModal>
    );
}
