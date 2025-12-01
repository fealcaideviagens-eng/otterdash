import { useState } from "react";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle
} from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, parseCurrencyToNumber } from "@/utils/inputFormatters";

interface EditarGarantiaModalProps {
  isOpen: boolean;
  onClose: () => void;
  valorAtual: number;
  onSalvar: (novoValor: number) => void;
}

export const EditarGarantiaModal = ({
  isOpen,
  onClose,
  valorAtual,
  onSalvar
}: EditarGarantiaModalProps) => {
  const [valor, setValor] = useState(
    valorAtual > 0 ? formatCurrency(valorAtual.toString()) : ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const novoValor = parseCurrencyToNumber(valor);
    if (novoValor >= 0) {
      onSalvar(novoValor);
      onClose();
    }
  };

  const handleCurrencyChange = (value: string) => {
    const formatted = formatCurrency(value);
    setValor(formatted);
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onClose}>
      <ResponsiveModalContent className="sm:max-w-md">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Editar garantia para put</ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-4 sm:px-0 pb-4 sm:pb-0">
          <div>
            <Label htmlFor="valor">Valor da Garantia (R$)</Label>
            <Input
              id="valor"
              type="text"
              value={valor}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              placeholder="0,00"
              className="mt-1 placeholder-subtle"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" style={{ backgroundColor: '#61005D' }}>
              Salvar
            </Button>
          </div>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
};