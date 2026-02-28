import { useState, useEffect } from "react";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Garantia } from "@/types/garantia";
import { toast } from "sonner";

interface EditarAcaoModalProps {
  garantia: Garantia | null;
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (garantiaId: string, dados: Partial<Garantia>) => Promise<void>;
}

export function EditarAcaoModal({
  garantia,
  isOpen,
  onClose,
  onSalvar,
}: EditarAcaoModalProps) {
  const [ticker, setTicker] = useState("");
  const [quantidade, setQuantidade] = useState("");

  useEffect(() => {
    if (garantia) {
      setTicker(garantia.ticker || "");
      setQuantidade(garantia.quantidade?.toString() || "");
    }
  }, [garantia]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!garantia) return;

    // Validar ticker (4 letras + 1-2 números)
    const tickerRegex = /^[A-Z]{4}\d{1,2}$/i;
    if (!tickerRegex.test(ticker)) {
      toast.error("Ticker inválido. Use 4 letras seguidas de 1 ou 2 números.");
      return;
    }

    try {
      await onSalvar(garantia.garantia_id, {
        ticker: ticker.toUpperCase(),
        quantidade: parseFloat(quantidade),
      });
      toast.success("Ação atualizada com sucesso!");
      onClose();
    } catch (error) {
      toast.error("Erro ao atualizar ação");
    }
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onClose}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Editar Ação</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Atualize as informações da ação
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 pt-0 pb-4 px-4 sm:px-0">
            <div className="space-y-2">
              <Label htmlFor="ticker">Ticker</Label>
              <Input
                id="ticker"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="Ex: PETR4"
                maxLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                type="number"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="100"
                step="1"
                min="0"
                required
              />
            </div>
          </div>
          <ResponsiveModalFooter>
            <div className="space-y-2 w-full">
              <Button type="submit" className="w-full">Salvar</Button>
              <Button type="button" variant="outline" onClick={onClose} className="w-full">
                Cancelar
              </Button>
            </div>
          </ResponsiveModalFooter>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

