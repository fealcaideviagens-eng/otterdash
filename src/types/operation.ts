import { Opcao } from './database';

export type { Opcao };

export interface OperationDraft {
    id?: string;
    strategyId?: string;
    status: 'draft' | 'completed';

    // Common fields (optional for drafts)
    ticker?: string;
    acao?: string;
    cotacao?: number;
    quantidade?: number;
    premio?: number;
    strike?: number;
    vencimento?: string;

    // Strategy specific
    tipo?: 'call' | 'put';
    operacao?: 'compra' | 'venda' | 'trava';

    // Trava specific
    legs?: {
        compra?: {
            ticker?: string;
            strike?: number;
            premio?: number;
        };
        venda?: {
            ticker?: string;
            strike?: number;
            premio?: number;
        };
    };

    createdAt: string;
    updatedAt: string;
}

export interface StrategyOption {
    id: string;
    group: string;
    title: string;
    subtitle: string;
    operacao: string;
    tipo: string;
    disabled: boolean;
    headerTitle: string;
    icon: any; // Lucide icon component
    colorClass: string;
}
