import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ResponsiveModal,
    ResponsiveModalContent,
    ResponsiveModalHeader,
    ResponsiveModalTitle,
    ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Opcao } from "@/types/database";
import { formatCurrency, formatDateForInput, parseLocalDate } from "@/utils/formatters";
import { formatCurrency as formatCurrencyInput, parseCurrencyToNumber } from "@/utils/inputFormatters";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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

interface EncerrarTravaModalProps {
    strategy: StrategyGroup | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: {
        strategy_id: string;
        compra_premio: number;
        venda_premio: number;
        data: string;
        quantidade: number;
    }) => void;
}

export const EncerrarTravaModal = ({
    strategy,
    isOpen,
    onClose,
    onConfirm,
}: EncerrarTravaModalProps) => {
    const [formData, setFormData] = useState({
        compraPremio: "0,00",
        vendaPremio: "0,00",
        data: formatDateForInput(new Date()),
    });

    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    if (!strategy) return null;

    const compraLeg = strategy.legs.find(leg => leg.ops_strategy_role === 'LONG_LEG');
    const vendaLeg = strategy.legs.find(leg => leg.ops_strategy_role === 'SHORT_LEG');

    if (!compraLeg || !vendaLeg) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar se não é fim de semana
        const selectedDate = new Date(formData.data);
        const dayOfWeek = selectedDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            toast({
                title: "❌ Erro",
                description: "Não é possível encerrar opções em finais de semana.",
                className: "border-red-200 bg-red-50 text-red-900",
            });
            return;
        }

        const compraPremioValue = parseCurrencyToNumber(formData.compraPremio);
        const vendaPremioValue = parseCurrencyToNumber(formData.vendaPremio);

        // Validação para não aceitar valores negativos
        if (compraPremioValue < 0 || vendaPremioValue < 0) {
            toast({
                title: "❌ Erro",
                description: "Os prêmios não podem ser negativos.",
                className: "border-red-200 bg-red-50 text-red-900",
            });
            return;
        }

        setLoading(true);
        try {
            await onConfirm({
                strategy_id: strategy.id,
                compra_premio: compraPremioValue,
                venda_premio: vendaPremioValue,
                data: formData.data,
                quantidade: strategy.quantidade,
            });

            toast({
                title: "✅ Sucesso!",
                description: "Trava encerrada com sucesso.",
                className: "border-green-200 bg-green-50 text-green-900",
            });

            // Reset form
            setFormData({
                compraPremio: "0,00",
                vendaPremio: "0,00",
                data: formatDateForInput(new Date()),
            });
            onClose();
        } catch (error) {
            console.error("Erro ao encerrar trava:", error);
            toast({
                title: "❌ Erro",
                description: "Não foi possível encerrar a trava.",
                className: "border-red-200 bg-red-50 text-red-900",
            });
        } finally {
            setLoading(false);
        }
    };

    const calcularResultado = () => {
        if (!formData.compraPremio || !formData.vendaPremio) return null;

        const compraPremioOriginal = compraLeg.ops_premio || 0;
        const vendaPremioOriginal = vendaLeg.ops_premio || 0;
        const compraPremioNovo = parseCurrencyToNumber(formData.compraPremio);
        const vendaPremioNovo = parseCurrencyToNumber(formData.vendaPremio);
        const quantidade = strategy.quantidade;

        // Cálculo do resultado da trava:
        // Compra: (Novo - Original) * Qtd (positivo se vendeu mais caro)
        // Venda: (Original - Novo) * Qtd (positivo se recomprou mais barato)
        const resultadoCompra = (compraPremioNovo - compraPremioOriginal) * quantidade;
        const resultadoVenda = (vendaPremioOriginal - vendaPremioNovo) * quantidade;
        const resultadoTotal = resultadoCompra + resultadoVenda;

        // Custo original da trava
        const custoOriginal = Math.abs(strategy.custoTotal * quantidade);
        const percentual = custoOriginal > 0 ? (resultadoTotal / custoOriginal) * 100 : 0;

        return { resultadoTotal, percentual };
    };

    const resultado = calcularResultado();

    const handleCurrencyChange = (field: 'compraPremio' | 'vendaPremio', value: string) => {
        const formatted = formatCurrencyInput(value);
        setFormData(prev => ({ ...prev, [field]: formatted }));
    };

    return (
        <ResponsiveModal open={isOpen} onOpenChange={onClose}>
            <ResponsiveModalContent className="sm:max-w-lg max-h-[85vh] flex flex-col bg-white">
                <ResponsiveModalHeader>
                    <ResponsiveModalTitle className="text-modal-title">Encerrar trava de alta</ResponsiveModalTitle>
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
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-600">Quantidade:</span>
                                        <span className="font-semibold ml-2">{strategy.quantidade}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Vencimento:</span>
                                        <span className="font-semibold ml-2">{format(parseLocalDate(strategy.data), "dd/MM/yyyy")}</span>
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
                                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                    <div>
                                        <span className="text-gray-600">Ticker:</span>
                                        <span className="font-semibold ml-2">{compraLeg.ops_ticker}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Prêmio original:</span>
                                        <span className="font-semibold ml-2">{formatCurrency(compraLeg.ops_premio || 0)}</span>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="compraPremio">Novo prêmio</Label>
                                    <Input
                                        id="compraPremio"
                                        value={formData.compraPremio}
                                        onChange={(e) => handleCurrencyChange('compraPremio', e.target.value)}
                                        className="placeholder-subtle bg-white"
                                        placeholder="0,00"
                                        required
                                    />
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
                                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                    <div>
                                        <span className="text-gray-600">Ticker:</span>
                                        <span className="font-semibold ml-2">{vendaLeg.ops_ticker}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Prêmio original:</span>
                                        <span className="font-semibold ml-2">{formatCurrency(vendaLeg.ops_premio || 0)}</span>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="vendaPremio">Novo prêmio</Label>
                                    <Input
                                        id="vendaPremio"
                                        value={formData.vendaPremio}
                                        onChange={(e) => handleCurrencyChange('vendaPremio', e.target.value)}
                                        className="placeholder-subtle bg-white"
                                        placeholder="0,00"
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Data de Encerramento */}
                        <div>
                            <Label htmlFor="data">Data de encerramento</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background",
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
                                                setFormData(prev => ({ ...prev, data: dateString }));
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

                        {/* Resultado */}
                        {resultado && (
                            <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-medium mb-2">Resultado da operação:</h4>
                                <div className="space-y-1 text-sm">
                                    <div className={`font-medium ${resultado.resultadoTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {resultado.resultadoTotal >= 0 ? 'Ganho' : 'Prejuízo'}: {formatCurrency(Math.abs(resultado.resultadoTotal))}
                                    </div>
                                    <div className={`${resultado.percentual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {resultado.percentual.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <ResponsiveModalFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} variant="default">
                            {loading ? "Encerrando..." : "Confirmar encerramento"}
                        </Button>
                    </ResponsiveModalFooter>
                </form>
            </ResponsiveModalContent>
        </ResponsiveModal>
    );
};
