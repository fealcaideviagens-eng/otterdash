import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, ChevronDown, CirclePlus, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { formatCurrency as formatCurrencyDisplay, parseLocalDate } from "@/utils/formatters";
import { parseCurrencyToNumber } from "@/utils/inputFormatters";
import { getRiskColorHex } from "./utils";
import { Draft } from "./types";

interface DraftsListProps {
    drafts: Draft[];
    expandedDrafts: string[];
    setExpandedDrafts: React.Dispatch<React.SetStateAction<string[]>>;
    handleAddDraftToPortfolio: (draft: Draft) => void;
    handleEditDraft: (draft: Draft) => void;
    handleDeleteDraft: (id: string) => void;
}

export function DraftsList({
    drafts,
    expandedDrafts,
    setExpandedDrafts,
    handleAddDraftToPortfolio,
    handleEditDraft,
    handleDeleteDraft,
}: DraftsListProps) {
    if (drafts.length === 0) return null;

    return (
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
                                        className="flex-1 rounded-full bg-brand-blue-dark hover:bg-brand-blue text-white"
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
    );
}
