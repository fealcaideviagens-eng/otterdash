import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { STRATEGIES } from "@/constants/strategies";

interface StrategySelectorProps {
    selectedStrategyId: string;
    onSelectStrategy: (id: string) => void;
}

export function StrategySelector({ selectedStrategyId, onSelectStrategy }: StrategySelectorProps) {
    // Agrupar estratégias por grupo
    const groupedStrategies = STRATEGIES.reduce((acc, strategy) => {
        if (!acc[strategy.group]) {
            acc[strategy.group] = [];
        }
        acc[strategy.group].push(strategy);
        return acc;
    }, {} as Record<string, typeof STRATEGIES>);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.keys(groupedStrategies).map((groupName) => (
                <Card key={groupName} className="h-full bg-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bold">{groupName}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {groupedStrategies[groupName].map((strategy) => (
                            <div
                                key={strategy.id}
                                className={cn(
                                    "flex items-center justify-between py-3 px-5 rounded-full transition-colors",
                                    strategy.disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-slate-50",
                                    selectedStrategyId === strategy.id && !strategy.disabled ? "bg-slate-50" : ""
                                )}
                                onClick={() => !strategy.disabled && onSelectStrategy(strategy.id)}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Div do Ícone com cor dinâmica e ícone dinâmico */}
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center",
                                        strategy.colorClass
                                    )}>
                                        <strategy.icon className="h-5 w-5" />
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm text-slate-900">{strategy.title}</span>
                                        <span className="text-xs text-slate-500">{strategy.subtitle}</span>
                                    </div>
                                </div>

                                {strategy.disabled ? (
                                    <span className="text-[10px] font-medium bg-neutral-bg-lighter text-muted-foreground px-2 py-1 rounded-full">
                                        em breve
                                    </span>
                                ) : (
                                    <div className={cn(
                                        "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                                        selectedStrategyId === strategy.id
                                            ? "border-blue-600"
                                            : "border-slate-300"
                                    )}>
                                        {selectedStrategyId === strategy.id && (
                                            <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
