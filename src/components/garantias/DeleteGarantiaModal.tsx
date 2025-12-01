import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Garantia } from "@/types/garantia";

interface DeleteGarantiaModalProps {
  garantia: Garantia | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteGarantiaModal({
  garantia,
  isOpen,
  onClose,
  onConfirm,
}: DeleteGarantiaModalProps) {
  if (!garantia) return null;

  const getNome = () => {
    if (garantia.tipo === 'acao') {
      return `a ação ${garantia.ticker}`;
    }
    return `a renda fixa ${garantia.tipo_renda_fixa === 'tesouro_selic' ? 'Tesouro Selic' : 'Caixa'}`;
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onClose}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Confirmar exclusão</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Tem certeza que deseja excluir {getNome()}?
            Esta ação não pode ser desfeita.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <ResponsiveModalFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            variant="destructive"
          >
            Excluir
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

