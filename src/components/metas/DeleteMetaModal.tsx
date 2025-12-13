import {
    ResponsiveModal,
    ResponsiveModalContent,
    ResponsiveModalDescription,
    ResponsiveModalFooter,
    ResponsiveModalHeader,
    ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Meta } from "@/types/database";

interface DeleteMetaModalProps {
    meta: Meta | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function DeleteMetaModal({
    meta,
    isOpen,
    onClose,
    onConfirm,
}: DeleteMetaModalProps) {
    if (!meta) return null;

    const metaTitulo = meta.goal_tipo === "mensal"
        ? "Meta mensal"
        : `Meta ${meta.goal_ano}`;

    return (
        <ResponsiveModal open={isOpen} onOpenChange={onClose}>
            <ResponsiveModalContent>
                <ResponsiveModalHeader>
                    <ResponsiveModalTitle>Confirmar exclusão</ResponsiveModalTitle>
                    <ResponsiveModalDescription>
                        Tem certeza que deseja excluir a "{metaTitulo}"?
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
                        Excluir
                    </Button>
                    <Button variant="outline" onClick={onClose} className="w-full">Cancelar</Button>
                </ResponsiveModalFooter>
            </ResponsiveModalContent>
        </ResponsiveModal>
    );
}

