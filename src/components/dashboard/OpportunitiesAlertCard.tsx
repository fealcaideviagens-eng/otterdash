import { useState } from "react";
import {
    Lightbulb,
    TrendingDown,
    TrendingUp,
    CheckCircle2,
    Sparkles,
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Garantia } from "@/types/garantia";
import { formatCurrency } from "@/utils/formatters";
import { useIsMobile } from "@/hooks/use-mobile";

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────
interface OpportunitiesAlertCardProps {
    garantias: Garantia[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Badge de ticker adaptativo — tooltip no desktop, drawer no mobile
// ─────────────────────────────────────────────────────────────────────────────
interface TickerBadgeProps {
    ticker: string;
    quantidadeLivre: number;
    isMobile: boolean;
}

const TickerBadge = ({ ticker, quantidadeLivre, isMobile }: TickerBadgeProps) => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const badgeClass =
        "cursor-pointer select-none bg-white/80 text-emerald-800 border border-emerald-300 hover:bg-white transition-colors font-medium";

    // Mobile: tap abre Drawer
    if (isMobile) {
        return (
            <>
                <Badge variant="outline" className={badgeClass} onClick={() => setDrawerOpen(true)}>
                    {ticker}
                </Badge>
                <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                    <DrawerContent>
                        <DrawerHeader className="pb-2">
                            <div className="flex items-center gap-3 mt-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 border border-emerald-200">
                                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <DrawerTitle>{ticker}</DrawerTitle>
                                    <DrawerDescription>Oportunidade de venda de call</DrawerDescription>
                                </div>
                            </div>
                        </DrawerHeader>
                        <div className="px-4 pb-8 space-y-4">
                            <div className="rounded-lg border bg-emerald-50 border-emerald-200 p-4 flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Ações livres para operar</span>
                                <span className="text-sm font-bold text-emerald-700">
                                    {quantidadeLivre.toLocaleString("pt-BR")} ações
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed px-1">
                                Você tem <strong>{quantidadeLivre.toLocaleString("pt-BR")} ações</strong> de{" "}
                                <strong>{ticker}</strong> livres — acima do mínimo de 100 — disponíveis
                                para uma operação de venda de call coberta.
                            </p>
                        </div>
                    </DrawerContent>
                </Drawer>
            </>
        );
    }

    // Desktop: hover exibe Tooltip
    return (
        <Tooltip>
            <TooltipTrigger>
                <Badge variant="outline" className={badgeClass}>
                    {ticker}
                </Badge>
            </TooltipTrigger>
            <TooltipContent side="top">
                <p className="text-xs font-medium">
                    {quantidadeLivre.toLocaleString("pt-BR")} ações livres para operar
                </p>
            </TooltipContent>
        </Tooltip>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────
export const OpportunitiesAlertCard = ({ garantias }: OpportunitiesAlertCardProps) => {
    const isMobile = useIsMobile();

    // ── 1. Cálculo de caixa (venda de put) ───────────────────────────────────
    const totalCashValue = garantias
        .filter((g) => g.tipo === "renda_fixa")
        .reduce((acc, g) => acc + (g.valor_reais || 0), 0);

    const usedAsMarginForPut = garantias
        .filter((g) => g.tipo === "renda_fixa")
        .reduce((acc, g) => acc + (g.valorEmGarantia || 0), 0);

    const maximumAllowedMargin = totalCashValue * 0.5;
    const availableForPut = Math.max(maximumAllowedMargin - usedAsMarginForPut, 0);
    const hasPutOpportunity = totalCashValue > 0 && usedAsMarginForPut < maximumAllowedMargin;

    // ── 2. Cálculo de ações (venda de call) ──────────────────────────────────
    const acoesPorTicker = new Map<string, { quantidadeLivre: number }>();
    garantias
        .filter((g) => g.tipo === "acao" && g.ticker)
        .forEach((g) => {
            const ticker = g.ticker!.toUpperCase();
            const existing = acoesPorTicker.get(ticker);
            acoesPorTicker.set(ticker, {
                quantidadeLivre: (existing?.quantidadeLivre ?? 0) + (g.quantidadeLivre || 0),
            });
        });

    const acoesCandidatasCall = Array.from(acoesPorTicker.entries())
        .filter(([, d]) => d.quantidadeLivre >= 100)
        .map(([ticker, d]) => ({ ticker, quantidadeLivre: d.quantidadeLivre }));

    const hasCallOpportunity = acoesCandidatasCall.length > 0;

    // ── 3. Não renderiza se não houver garantias cadastradas ─────────────────
    if (garantias.length === 0) return null;

    // ─────────────────────────────────────────────────────────────────────────
    // Renderização
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <TooltipProvider>
            {/* Card principal com gradiente suave */}
            <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/40 dark:via-card dark:to-teal-950/30 dark:border-emerald-800 shadow-sm overflow-hidden">

                {/* ── Grid de 3 colunas: identidade | put | call ─────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-emerald-100 dark:divide-emerald-800/60">

                    {/* ── Coluna 1: Título + ícone + texto de apoio ─────────── */}
                    <div className="flex flex-col justify-center gap-4 p-6">
                        {/* Ícone grande com halo */}
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-200 dark:shadow-emerald-900">
                            <Lightbulb className="h-7 w-7 text-white" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-100 leading-snug">
                                Oportunidades de rentabilização
                            </h3>
                            <p className="text-xs text-emerald-700/70 dark:text-emerald-400 leading-relaxed">
                                Identifique onde sua carteira pode gerar mais retorno agora mesmo.
                            </p>
                        </div>
                        {/* Linha decorativa */}
                        <div className="h-1 w-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
                    </div>

                    {/* ── Coluna 2: Box Venda de Put ────────────────────────── */}
                    <div className="p-5 flex flex-col justify-center">
                        {hasPutOpportunity ? (
                            <div className="flex flex-col gap-3 h-full">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                                        <TrendingDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                            Venda de Put
                                        </p>
                                        <p className="text-xs text-muted-foreground">Caixa disponível para margem</p>
                                    </div>
                                </div>
                                <p className="text-3xl font-extrabold text-emerald-800 dark:text-emerald-100 leading-none tracking-tight">
                                    {formatCurrency(availableForPut)}
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Ainda pode ser usado como margem em renda fixa, mantendo 50% do caixa livre.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 h-full">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                            Venda de Put
                                        </p>
                                        <p className="text-xs text-muted-foreground">Caixa em uso</p>
                                    </div>
                                </div>
                                <p className="text-lg font-bold text-emerald-800 dark:text-emerald-100">
                                    Caixa bem aproveitado! 🎉
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Você já utiliza o limite de 50% do caixa como margem. Continue assim!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ── Coluna 3: Box Venda de Call ───────────────────────── */}
                    <div className="p-5 flex flex-col justify-center">
                        {hasCallOpportunity ? (
                            <div className="flex flex-col gap-3 h-full">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900">
                                        <TrendingUp className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                                            Venda de Call
                                        </p>
                                        <p className="text-xs text-muted-foreground">Ações disponíveis</p>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {isMobile
                                        ? "Toque em um ticker para ver a quantidade:"
                                        : "Passe o mouse para ver a quantidade livre:"}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {acoesCandidatasCall.map(({ ticker, quantidadeLivre }) => (
                                        <TickerBadge
                                            key={ticker}
                                            ticker={ticker}
                                            quantidadeLivre={quantidadeLivre}
                                            isMobile={isMobile}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 h-full">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900">
                                        <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                                            Venda de Call
                                        </p>
                                        <p className="text-xs text-muted-foreground">Ações em uso</p>
                                    </div>
                                </div>
                                <p className="text-lg font-bold text-teal-800 dark:text-teal-100">
                                    Ações bem alocadas! ✨
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Nenhuma ação com 100+ unidades livres no momento. Suas posições estão totalmente em operação.
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </TooltipProvider>
    );
};

