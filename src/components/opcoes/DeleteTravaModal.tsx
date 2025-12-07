import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Trava</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja excluir esta estratégia?
                        <br /><br />
                        Isso excluirá permanentemente as seguintes opções:
                        <ul className="list-disc list-inside mt-2">
                            <li><strong>Compra:</strong> {compraLeg?.ops_ticker}</li>
                            <li><strong>Venda:</strong> {vendaLeg?.ops_ticker}</li>
                        </ul>
                        <br />
                        Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Excluir Estratégia
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
