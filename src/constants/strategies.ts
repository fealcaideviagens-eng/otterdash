import {
    Building2,
    DollarSign,
    ArrowBigUpDash,
    TrendingUp,
    ArrowBigDownDash,
    TrendingDown
} from "lucide-react";
import { StrategyOption } from "@/types/operation";

export const STRATEGIES: StrategyOption[] = [
    {
        id: "renda_extra_acoes",
        group: "Renda extra",
        title: "Com ações",
        subtitle: "venda de call",
        operacao: "venda",
        tipo: "call",
        disabled: false,
        headerTitle: "Renda extra - venda de call",
        icon: Building2,
        colorClass: "bg-blue-100 text-blue-700"
    },
    {
        id: "renda_extra_dinheiro",
        group: "Renda extra",
        title: "Com dinheiro",
        subtitle: "venda de put",
        operacao: "venda",
        tipo: "put",
        disabled: false,
        headerTitle: "Renda extra - venda de put",
        icon: DollarSign,
        colorClass: "bg-blue-100 text-blue-700"
    },
    {
        id: "alta_infinita",
        group: "Operar a alta",
        title: "Alta infinita",
        subtitle: "compra a seco - call",
        operacao: "compra",
        tipo: "call",
        disabled: false,
        headerTitle: "Compra de call",
        icon: ArrowBigUpDash,
        colorClass: "bg-green-100 text-green-700"
    },
    {
        id: "alta_moderada",
        group: "Operar a alta",
        title: "Alta moderada",
        subtitle: "trava de alta - call",
        operacao: "trava",
        tipo: "call",
        disabled: false,
        headerTitle: "Trava de alta",
        icon: TrendingUp,
        colorClass: "bg-green-100 text-green-700"
    },
    {
        id: "queda_infinita",
        group: "Operar a baixa",
        title: "Queda infinita",
        subtitle: "compra a seco - put",
        operacao: "compra",
        tipo: "put",
        disabled: false,
        headerTitle: "Compra de put",
        icon: ArrowBigDownDash,
        colorClass: "bg-red-100 text-red-700"
    },
    {
        id: "queda_moderada",
        group: "Operar a baixa",
        title: "Queda moderada",
        subtitle: "trava de baixa - put",
        operacao: "trava",
        tipo: "put",
        disabled: false,
        headerTitle: "Trava de baixa",
        icon: TrendingDown,
        colorClass: "bg-red-100 text-red-700"
    }
];
