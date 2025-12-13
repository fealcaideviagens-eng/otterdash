import {
    ResponsiveModal,
    ResponsiveModalContent,
    ResponsiveModalDescription,
    ResponsiveModalFooter,
    ResponsiveModalHeader,
    ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Opcao } from "@/types/database";

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

interface DeleteTravaModalProps {
    strategy: StrategyGroup | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function DeleteTravaModal({
    strategy,
    isOpen,
    onClose,
    onConfirm,
}: DeleteTravaModalProps) {
    if (!strategy) return null;

    const compraLeg = strategy.legs.find(leg => leg.ops_strategy_role === 'LONG_LEG');
    const vendaLeg = strategy.legs.find(leg => leg.ops_strategy_role === 'SHORT_LEG');

    return (
        <ResponsiveModal open={isOpen} onOpenChange={onClose}>
            <ResponsiveModalContent>
                <ResponsiveModalHeader>
                    <ResponsiveModalTitle>Excluir Trava</ResponsiveModalTitle>
                    <ResponsiveModalDescription>
                        Tem certeza que deseja excluir esta estratégia?
                        <br /><br />
                        Isso excluirá permanentemente as seguintes opções:
                        <ul className="list-disc list-inside mt-2">
                            <li><strong>Compra:</strong> {compraLeg?.ops_ticker}</li>
                            <li><strong>Venda:</strong> {vendaLeg?.ops_ticker}</li>
                        </ul>
                        <br />
                        Esta ação não pode ser desfeita.
                    </ResponsiveModalDescription>
                </ResponsiveModalHeader>
                <ResponsiveModalFooter>
                    <Button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        variant="destructive"
                        className="w-full"
                    >
                        Excluir Estratégia
                    </Button>
                    <Button variant="outline" onClick={onClose} className="w-full">
                        Cancelar
                    </Button>
                </ResponsiveModalFooter>
            </ResponsiveModalContent>
        </ResponsiveModal>
    );
}
