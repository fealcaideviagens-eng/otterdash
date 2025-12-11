import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Layers2, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseLocalDate } from "@/utils/formatters";
import { OpcaoFormData, TravaData } from "./types";
import { CALL_MONTHS, PUT_MONTHS } from "./utils";

interface TravaFormProps {
    formData: OpcaoFormData;
    travaData: TravaData;
    errors: Record<string, string>;
    loading: boolean;
    currentStrategy: any;
    isCalendarOpen: boolean;
    setIsCalendarOpen: (open: boolean) => void;
    acaoInputRef: React.RefObject<HTMLInputElement>;
    handleSubmit: (e: React.FormEvent) => void;
    handleSaveDraft: () => void;
    handleAcaoFocus: () => void;
    handleAcaoChange: (value: string) => void;
    handleTravaChange: (leg: 'compra' | 'venda', field: string, value: string) => void;
    handleTravaCurrencyChange: (leg: 'compra' | 'venda', field: string, value: string) => void;
    handleCurrencyChange: (field: string, value: string) => void;
    handleNumberChange: (field: string, value: string) => void;
    handleInputChange: (field: string, value: any) => void;
    setStep: (step: number) => void;
    isBullCallSpread: boolean;
    selectedStrategyId: string;
}

export function TravaForm({
    formData,
    travaData,
    errors,
    loading,
    currentStrategy,
    isCalendarOpen,
    setIsCalendarOpen,
    acaoInputRef,
    handleSubmit,
    handleSaveDraft,
    handleAcaoFocus,
    handleAcaoChange,
    handleTravaChange,
    handleTravaCurrencyChange,
    handleCurrencyChange,
    handleNumberChange,
    handleInputChange,
    setStep,
    isBullCallSpread,
    selectedStrategyId,
}: TravaFormProps) {
    return (
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
                                    errors.acao ? "border-destructive focus-visible:ring-destructive" : ""
                                )}
                            />
                            {errors.acao && (
                                <p className="text-xs text-destructive mt-1">{errors.acao}</p>
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
                                    errors.cotacao ? "border-destructive focus-visible:ring-destructive" : ""
                                )}
                            />
                            {errors.cotacao && (
                                <p className="text-xs text-destructive mt-1">{errors.cotacao}</p>
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
                                    errors.quantidade ? "border-destructive focus-visible:ring-destructive" : ""
                                )}
                            />
                            {errors.quantidade && (
                                <p className="text-xs text-destructive mt-1">{errors.quantidade}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="data">Vencimento</Label>
                            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
                                        defaultMonth={formData.data ? parseLocalDate(formData.data) : undefined}
                                        onSelect={(date) => {
                                            if (date) {
                                                const year = date.getFullYear();
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const day = String(date.getDate()).padStart(2, '0');
                                                const dateString = `${year}-${month}-${day}`;
                                                handleInputChange("data", dateString);
                                                setIsCalendarOpen(false);
                                            }
                                        }}
                                        disabled={(date) => {
                                            const dayOfWeek = date.getDay();
                                            return dayOfWeek === 0 || dayOfWeek === 6;
                                        }}
                                        initialFocus
                                        locale={ptBR}
                                        className={cn("p-3 pointer-events-auto")}
                                    />
                                </PopoverContent>
                            </Popover>
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
                            <Label htmlFor="compra-ticker">Ticker da opção</Label>
                            <div className={cn(
                                "flex rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 mt-1.5",
                                errors['compra.ticker'] ? "border-destructive focus-within:ring-destructive" : ""
                            )}>
                                <div className="flex items-center px-3 text-muted-foreground bg-muted/50 border-r border-input rounded-l-md select-none">
                                    {formData.acao.substring(0, 4) || ""}
                                    {formData.data ? (
                                        (() => {
                                            const vencimento = parseLocalDate(formData.data);
                                            const monthIndex = vencimento.getMonth();
                                            const letter = isBullCallSpread ? CALL_MONTHS[monthIndex] : PUT_MONTHS[monthIndex];
                                            return letter;
                                        })()
                                    ) : ""}
                                </div>
                                <Input
                                    id="compra-ticker"
                                    value={(() => {
                                        const prefix = formData.acao.substring(0, 4);
                                        const fullTicker = travaData.compra.ticker;

                                        // Se temos data, removemos prefix (4 letras) + 5ª letra (1 letra) = 5 caracteres
                                        if (formData.data && fullTicker.length >= 5) {
                                            return fullTicker.substring(5); // Remove PRIO + L, mostra só os números
                                        } else if (fullTicker.length > prefix.length) {
                                            return fullTicker.substring(prefix.length);
                                        }
                                        return "";
                                    })()}
                                    onChange={(e) => {
                                        const prefix = formData.acao.substring(0, 4);
                                        const numbers = e.target.value.replace(/[^0-9W]/g, '');

                                        if (formData.data) {
                                            const vencimento = parseLocalDate(formData.data);
                                            const monthIndex = vencimento.getMonth();
                                            const letter = isBullCallSpread ? CALL_MONTHS[monthIndex] : PUT_MONTHS[monthIndex];
                                            handleTravaChange('compra', 'ticker', prefix + letter + numbers);
                                        } else {
                                            handleTravaChange('compra', 'ticker', prefix + numbers);
                                        }
                                    }}
                                    placeholder="123"
                                    maxLength={5}
                                    disabled={!formData.data}
                                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-l-none placeholder-subtle disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                            {errors['compra.ticker'] && (
                                <p className="text-xs text-destructive mt-1">{errors['compra.ticker']}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="compra-strike">Strike (R$)</Label>
                            <Input
                                id="compra-strike"
                                value={travaData.compra.strike}
                                onChange={(e) => handleTravaCurrencyChange('compra', 'strike', e.target.value)}
                                placeholder="0,00"
                                className={cn(
                                    "placeholder-subtle mt-1.5",
                                    errors['compra.strike'] ? "border-destructive focus-visible:ring-destructive" : ""
                                )}
                            />
                            {errors['compra.strike'] && (
                                <p className="text-xs text-destructive mt-1">{errors['compra.strike']}</p>
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
                                    errors['compra.premio'] ? "border-destructive focus-visible:ring-destructive" : ""
                                )}
                            />
                            {errors['compra.premio'] && (
                                <p className="text-xs text-destructive mt-1">{errors['compra.premio']}</p>
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
                            <Label htmlFor="venda-ticker">Ticker da opção</Label>
                            <div className={cn(
                                "flex rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 mt-1.5",
                                errors['venda.ticker'] ? "border-destructive focus-within:ring-destructive" : ""
                            )}>
                                <div className="flex items-center px-3 text-muted-foreground bg-muted/50 border-r border-input rounded-l-md select-none">
                                    {formData.acao.substring(0, 4) || ""}
                                    {formData.data ? (
                                        (() => {
                                            const vencimento = parseLocalDate(formData.data);
                                            const monthIndex = vencimento.getMonth();
                                            const letter = isBullCallSpread ? CALL_MONTHS[monthIndex] : PUT_MONTHS[monthIndex];
                                            return letter;
                                        })()
                                    ) : ""}
                                </div>
                                <Input
                                    id="venda-ticker"
                                    value={(() => {
                                        const prefix = formData.acao.substring(0, 4);
                                        const fullTicker = travaData.venda.ticker;

                                        // Se temos data, removemos prefix (4 letras) + 5ª letra (1 letra) = 5 caracteres
                                        if (formData.data && fullTicker.length >= 5) {
                                            return fullTicker.substring(5); // Remove PRIO + L, mostra só os números
                                        } else if (fullTicker.length > prefix.length) {
                                            return fullTicker.substring(prefix.length);
                                        }
                                        return "";
                                    })()}
                                    onChange={(e) => {
                                        const prefix = formData.acao.substring(0, 4);
                                        const numbers = e.target.value.replace(/[^0-9W]/g, '');

                                        if (formData.data) {
                                            const vencimento = parseLocalDate(formData.data);
                                            const monthIndex = vencimento.getMonth();
                                            const letter = isBullCallSpread ? CALL_MONTHS[monthIndex] : PUT_MONTHS[monthIndex];
                                            handleTravaChange('venda', 'ticker', prefix + letter + numbers);
                                        } else {
                                            handleTravaChange('venda', 'ticker', prefix + numbers);
                                        }
                                    }}
                                    placeholder="123"
                                    maxLength={5}
                                    disabled={!formData.data}
                                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-l-none placeholder-subtle disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                            {errors['venda.ticker'] && (
                                <p className="text-xs text-destructive mt-1">{errors['venda.ticker']}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="venda-strike">Strike (R$)</Label>
                            <Input
                                id="venda-strike"
                                value={travaData.venda.strike}
                                onChange={(e) => handleTravaCurrencyChange('venda', 'strike', e.target.value)}
                                placeholder="0,00"
                                className={cn(
                                    "placeholder-subtle mt-1.5",
                                    errors['venda.strike'] ? "border-destructive focus-visible:ring-destructive" : ""
                                )}
                            />
                            {errors['venda.strike'] && (
                                <p className="text-xs text-destructive mt-1">{errors['venda.strike']}</p>
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
                                    errors['venda.premio'] ? "border-destructive focus-visible:ring-destructive" : ""
                                )}
                            />
                            {errors['venda.premio'] && (
                                <p className="text-xs text-destructive mt-1">{errors['venda.premio']}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Botão de Submit */}
            <div className="pt-2 flex items-center gap-3">
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
    );
}
