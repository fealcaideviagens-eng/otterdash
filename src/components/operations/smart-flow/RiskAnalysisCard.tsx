import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { HelpCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency as formatCurrencyDisplay, formatPercentage } from "@/utils/formatters";
import { parseCurrencyToNumber, parseNumberToInt } from "@/utils/inputFormatters";
import { getRiskColorHex } from "./utils";
import { OpcaoFormData } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

interface RiskAnalysisCardProps {
    operationData: any;
    formData: OpcaoFormData;
}

// Componente wrapper que mostra tooltip no desktop e bottomsheet no mobile
interface TooltipOrSheetProps {
    children: React.ReactNode;
    content: React.ReactNode;
    title?: string;
}

function TooltipOrSheet({ children, content, title }: TooltipOrSheetProps) {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);

    if (isMobile) {
        return (
            <Sheet open={open} onOpenChange={setOpen}>
                <div onClick={() => setOpen(true)} className="cursor-pointer">
                    {children}
                </div>
                <SheetContent side="bottom" className="rounded-t-2xl">
                    <SheetHeader>
                        {title && <SheetTitle>{title}</SheetTitle>}
                        <SheetDescription className="text-left">
                            {content}
                        </SheetDescription>
                    </SheetHeader>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    {content}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export function RiskAnalysisCard({ operationData, formData }: RiskAnalysisCardProps) {
    return (
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
                        <TooltipOrSheet
                            title="Diferença Strike vs Cotação"
                            content={
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
                            }
                        >
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
                        </TooltipOrSheet>
                    </div>
                )}

                {/* GRAFICO CORRIGIDO: Estrutura CSS/Div sem Gap */}
                {operationData.isTrava ? (
                    <div className="space-y-4 pb-4">
                        <div>
                            <div className="flex items-center gap-1">
                                <Label className="text-xs text-slate-500">Ponto de equilíbrio</Label>
                                <TooltipOrSheet
                                    title="Ponto de equilíbrio"
                                    content={
                                        <p className="text-xs">
                                            É o preço que a ação precisa atingir para você não ter lucro nem prejuízo. Acima disso, você ganha. Abaixo, você perde.
                                        </p>
                                    }
                                >
                                    <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                                </TooltipOrSheet>
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
                                <TooltipOrSheet
                                    title="Relação risco/retorno"
                                    content={
                                        <p className="text-xs">
                                            Para cada R$ 1,00 que você arrisca perder, você pode ganhar {formatCurrencyDisplay(operationData.payoffRatio)}.
                                        </p>
                                    }
                                >
                                    <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                                </TooltipOrSheet>
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
                                <TooltipOrSheet
                                    title="Ponto de equilíbrio"
                                    content={
                                        <p className="text-xs">
                                            É o preço que a ação precisa atingir para você não ter lucro nem prejuízo. Acima disso, você ganha. Abaixo, você perde.
                                        </p>
                                    }
                                >
                                    <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                                </TooltipOrSheet>
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
                                <TooltipOrSheet
                                    title="Ponto de equilíbrio"
                                    content={
                                        <p className="text-xs">
                                            É o preço que a ação precisa atingir para você não ter lucro nem prejuízo. Acima disso, você perde. Abaixo, você ganha.
                                        </p>
                                    }
                                >
                                    <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                                </TooltipOrSheet>
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
                                <TooltipOrSheet
                                    title="Ponto de equilíbrio"
                                    content={
                                        <p className="text-xs">
                                            É o preço que a ação precisa atingir para você não ter lucro nem prejuízo. Acima disso, você perde. Abaixo, você ganha.
                                        </p>
                                    }
                                >
                                    <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                                </TooltipOrSheet>
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
                                <TooltipOrSheet
                                    title="Ponto de equilíbrio"
                                    content={
                                        <p className="text-xs">
                                            É o preço que a ação precisa atingir para você não ter lucro nem prejuízo. Acima disso, você ganha. Abaixo, você perde.
                                        </p>
                                    }
                                >
                                    <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                                </TooltipOrSheet>
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
                                        <TooltipOrSheet
                                            title="Risco máximo"
                                            content={
                                                <p className="text-xs">
                                                    Representa o valor que você precisará ter em conta se for exercido. Você será obrigado a comprar as ações pelo valor do Strike, independente de quanto elas estejam valendo no mercado.
                                                </p>
                                            }
                                        >
                                            <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                                        </TooltipOrSheet>
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
                                        <TooltipOrSheet
                                            title="Risco máximo"
                                            content={
                                                <p className="text-xs">
                                                    Se for exercido, você terá que entregar esta quantidade de ações para o comprador ou ter {formatCurrencyDisplay((parseCurrencyToNumber(formData.strike) - parseCurrencyToNumber(formData.premio)) * parseNumberToInt(formData.quantidade))} para comprar as ações
                                                </p>
                                            }
                                        >
                                            <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                                        </TooltipOrSheet>
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
                                        <TooltipOrSheet
                                            title="Risco máximo"
                                            content={
                                                <p className="text-xs">
                                                    Este é o valor máximo que você pode perder: o dinheiro que você pagou para montar a operação. Você não fica devendo nada além disso.
                                                </p>
                                            }
                                        >
                                            <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                                        </TooltipOrSheet>
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
                                        <TooltipOrSheet
                                            title="Risco máximo"
                                            content={
                                                <p className="text-xs">
                                                    Valor máximo que você pode perder nesta operação. Limitado ao prêmio pago.
                                                </p>
                                            }
                                        >
                                            <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                                        </TooltipOrSheet>
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
    );
}
