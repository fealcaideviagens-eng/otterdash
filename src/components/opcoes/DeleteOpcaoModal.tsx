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

interface DeleteOpcaoModalProps {
  opcao: Opcao | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteOpcaoModal({
  opcao,
  isOpen,
  onClose,
  onConfirm,
}: DeleteOpcaoModalProps) {
  if (!opcao) return null;

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onClose}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Confirmar exclusão</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Tem certeza que deseja excluir a opção "{opcao.opcao}"?
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