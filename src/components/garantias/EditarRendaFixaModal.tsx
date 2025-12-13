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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Garantia } from "@/types/garantia";
import { toast } from "sonner";
import { formatCurrency, formatCurrencyValue, parseCurrencyToNumber } from "@/utils/inputFormatters";

interface EditarRendaFixaModalProps {
  garantia: Garantia | null;
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (garantiaId: string, dados: Partial<Garantia>) => Promise<void>;
}

export function EditarRendaFixaModal({
  garantia,
  isOpen,
  onClose,
  onSalvar,
}: EditarRendaFixaModalProps) {
  const [tipoRendaFixa, setTipoRendaFixa] = useState<"tesouro_selic" | "caixa">("tesouro_selic");
  const [valorReais, setValorReais] = useState("");

  useEffect(() => {
    if (garantia) {
      setTipoRendaFixa(garantia.tipo_renda_fixa || "tesouro_selic");
      setValorReais(garantia.valor_reais ? formatCurrencyValue(garantia.valor_reais) : "");
    }
  }, [garantia]);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setValorReais(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!garantia) return;

    const valor = parseCurrencyToNumber(valorReais);

    if (valor < 0) {
      toast.error("O valor não pode ser negativo");
      return;
    }

    try {
      await onSalvar(garantia.garantia_id, {
        tipo_renda_fixa: tipoRendaFixa,
        valor_reais: valor,
      });
      toast.success("Renda fixa atualizada com sucesso!");
      onClose();
    } catch (error) {
      toast.error("Erro ao atualizar renda fixa");
    }
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onClose}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Editar Renda Fixa</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Atualize as informações da renda fixa
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 pt-0 pb-4 px-4 sm:px-0">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={tipoRendaFixa} onValueChange={(value: "tesouro_selic" | "caixa") => setTipoRendaFixa(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tesouro_selic">Tesouro Selic</SelectItem>
                  <SelectItem value="caixa">Caixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                value={valorReais}
                onChange={handleCurrencyChange}
                placeholder="0,00"
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

