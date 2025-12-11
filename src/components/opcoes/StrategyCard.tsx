import { useState } from "react";
import { Opcao } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Edit, Trash2, FileTextIcon } from "lucide-react";
import { formatCurrency, formatDate, formatQuantidade, formatPercentage } from "@/utils/formatters";

interface StrategyGroup {
    id: string;
    type: string;
    legs: Opcao[];
    // Calculated fields
    acao: string;
    data: string;
    custoTotal: number;
    lucroMaximo: number;
    breakEven: number;
    quantidade: number;
}

interface StrategyCardProps {
    strategy: StrategyGroup;
    onEncerrar: (opcao: Opcao) => void; // Encerra perna individual
    onEncerrarTrava: (strategy: StrategyGroup) => void; // Encerra tudo
    onEditar: (strategy: StrategyGroup) => void; // Editar trava
    onDeletarTrava: (strategy: StrategyGroup) => void; // Deletar trava inteira
    onDeletar: (opcao: Opcao) => void;
    isHighlighted?: boolean;
}

export function StrategyCard({ strategy, onEncerrar, onEncerrarTrava, onEditar, onDeletar, onDeletarTrava, isHighlighted }: StrategyCardProps) {
    const [expandido, setExpandido] = useState(false);

    // Identify legs
    const compraLeg = strategy.legs.find(leg => leg.ops_strategy_role === 'LONG_LEG');
    const vendaLeg = strategy.legs.find(leg => leg.ops_strategy_role === 'SHORT_LEG');

    if (!compraLeg || !vendaLeg) return null; // Should not happen if grouped correctly

    // Detectar tipo de estratégia
    const isBullCallSpread = strategy.type === 'BULL_CALL_SPREAD';
    const isBearPutSpread = strategy.type === 'BEAR_PUT_SPREAD';
    const strategyTitle = isBullCallSpread ? 'Trava de alta' : 'Trava de baixa';
    const optionType = isBullCallSpread ? 'Call' : 'Put';

    // Calculate Risk/Reward for display
    const riscoMaximo = Math.abs(strategy.custoTotal); // Custo é negativo na compra, mas risco é absoluto

    return (
        <div
            className={`relative bg-white rounded-xl border 
            ${isHighlighted ? 'border-brand-blue-dark ring-2 ring-brand-blue-dark/20' : 'border-border'}
            transition-all duration-300 flex flex-col ${expandido ? 'py-7' : 'py-7'} px-5`}
            data-strategy-id={strategy.id}
        >

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-black">{strategyTitle}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="buy" className="px-3 py-0.5">
                        Débito
                    </Badge>
                    <Badge variant="outline" className="bg-neutral-bg text-foreground hover:bg-muted border-0 px-3 py-0.5">
                        {optionType}
                    </Badge>
                    <button
                        type="button"
                        className="ml-2 p-1 rounded-full hover:bg-muted transition"
                        onClick={() => setExpandido(e => !e)}
                    >
                        {expandido ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                    </button>
                </div>
            </div>

            {/* Summary Line (Closed View) */}
            <div className="flex justify-between mb-2">
                {/* Comprada */}
                <div className="flex flex-col items-center min-w-0">
                    <span className="text-[10px] uppercase text-muted-foreground font-bold pb-0.5">Comprada</span>
                    <span className="font-semibold text-xs">{compraLeg.ops_ticker}</span>
                </div>
                <div className="w-px bg-border mx-2 self-stretch" />

                {/* Vendida */}
                <div className="flex flex-col items-center min-w-0">
                    <span className="text-[10px] uppercase text-muted-foreground font-bold pb-0.5">Vendida</span>
                    <span className="font-semibold text-xs">{vendaLeg.ops_ticker}</span>
                </div>
                <div className="w-px bg-border mx-2 self-stretch" />

                {/* Qnt */}
                <div className="flex flex-col items-center min-w-0">
                    <span className="text-[10px] uppercase text-muted-foreground font-bold pb-0.5">Qnt</span>
                    <span className="font-semibold text-xs">{formatQuantidade(strategy.quantidade)}</span>
                </div>
                <div className="w-px bg-border mx-2 self-stretch" />

                {/* Validade */}
                <div className="flex flex-col items-center min-w-0">
                    <span className="text-[10px] uppercase text-muted-foreground font-bold pb-0.5">Validade</span>
                    <span className="font-semibold text-xs">{formatDate(strategy.data)}</span>
                </div>
            </div>

            {/* Separator */}
            <div className="mt-4 border-t-2 border-dashed border-border/60 pt-4 flex flex-col"></div>

            {/* Expanded Content */}
            {expandido && (
                <div className="flex flex-col gap-6 mt-2 mb-6">

                    {/* Financial Summary Table */}
                    <div className="grid grid-cols-1 gap-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Ação</span>
                            <span className="text-sm font-bold">{strategy.acao}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Cotação</span>
                            <span className="text-sm font-bold">{formatCurrency(compraLeg.acao_cotacao || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Ponto de equilibrio</span>
                            <span className="text-sm font-bold">{formatCurrency(strategy.breakEven)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Ganho máximo</span>
                            <span className="text-sm font-bold">{formatCurrency(strategy.lucroMaximo * strategy.quantidade)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Risco máximo</span>
                            <span className="text-sm font-bold">{formatCurrency(riscoMaximo * strategy.quantidade)}</span>
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="border-t-2 border-dashed border-dotted border-gray-400"></div>

                    {/* Opção Comprada Details */}
                    <div>
                        <h4 className="font-bold text-sm mb-3">Opção comprada</h4>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Strike</span>
                            <span className="text-sm font-bold">{formatCurrency(compraLeg.ops_strike || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Prêmio</span>
                            <span className="text-sm font-bold">{formatCurrency(compraLeg.ops_premio || 0)}</span>
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="border-t-2 border-dashed border-border/60"></div>

                    {/* Opção Vendida Details */}
                    <div>
                        <h4 className="font-bold text-sm mb-3">Opção vendida</h4>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Strike</span>
                            <span className="text-sm font-bold">{formatCurrency(vendaLeg.ops_strike || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Prêmio</span>
                            <span className="text-sm font-bold">{formatCurrency(vendaLeg.ops_premio || 0)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Actions */}
            <div className={`flex items-center justify-between ${expandido ? 'mt-0' : 'mt-2'} pt-2 gap-2`}>
                <Button
                    className="text-white text-sm font-semibold rounded-full px-5 py-2 transition whitespace-nowrap border-0 shadow-none"
                    className="bg-brand-blue-dark"
                    onClick={() => onEncerrarTrava(strategy)}
                >
                    Encerrar trava
                </Button>
                <div className="flex space-x-1">
                    <button className="p-4 hover:bg-muted rounded-full transition" onClick={() => onEditar(strategy)}><Edit size={18} /></button>
                    <button className="p-4 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-full transition" onClick={() => onDeletarTrava(strategy)}><Trash2 size={18} /></button>
                </div>
            </div>

        </div>
    );
}
