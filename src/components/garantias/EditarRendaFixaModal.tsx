import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { formatCurrency, parseCurrencyToNumber } from "@/utils/inputFormatters";

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
      setValorReais(garantia.valor_reais ? formatCurrency(garantia.valor_reais.toString()) : "");
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Renda Fixa</DialogTitle>
          <DialogDescription>
            Atualize as informações da renda fixa
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
