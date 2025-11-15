import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatCurrency as formatCurrencyInput, parseCurrencyToNumber } from "@/utils/inputFormatters";
import { formatDateForInput, parseLocalDate } from "@/utils/formatters";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Venda } from "@/types/database";

interface EditarEncerramentoModalProps {
  venda: Venda | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { premio: number; data: string; quantidade: number }) => void;
}

export function EditarEncerramentoModal({
  venda,
  isOpen,
  onClose,
  onConfirm,
}: EditarEncerramentoModalProps) {
  const [formData, setFormData] = useState({
    premio: 0,
    data: "",
    quantidade: 0,
  });

  const [formattedValues, setFormattedValues] = useState({
    premio: "",
    quantidade: "",
  });

  useEffect(() => {
    if (venda && isOpen) {
      setFormData({
        premio: venda.premio,
        data: venda.encerramento,
        quantidade: venda.quantidade,
      });
      setFormattedValues({
        premio: formatCurrencyInput(venda.premio.toString()),
        quantidade: venda.quantidade.toString(),
      });
    }
  }, [venda, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dadosFormatados = {
      premio: parseCurrencyToNumber(formattedValues.premio),
      data: formData.data,
      quantidade: parseFloat(formattedValues.quantidade),
    };
    
    onConfirm(dadosFormatados);
    onClose();
  };

  const handleCurrencyChange = (field: string, value: string) => {
    const formatted = formatCurrencyInput(value);
    setFormattedValues(prev => ({ ...prev, [field]: formatted }));
  };

  if (!venda) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Encerramento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="premio">Prêmio de Encerramento</Label>
            <Input
              id="premio"
              value={formattedValues.premio}
              onChange={(e) => handleCurrencyChange("premio", e.target.value)}
              placeholder="R$ 0,00"
              required
            />
          </div>

          <div>
            <Label htmlFor="quantidade">Quantidade</Label>
            <Input
              id="quantidade"
              type="number"
              value={formattedValues.quantidade}
              onChange={(e) => setFormattedValues(prev => ({ ...prev, quantidade: e.target.value }))}
              placeholder="100"
              required
            />
          </div>

          <div>
            <Label>Data de Encerramento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                    !formData.data && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.data ? (
                    format(parseLocalDate(formData.data), "dd/MM/yyyy")
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.data ? parseLocalDate(formData.data) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const dateStr = formatDateForInput(date);
                      setFormData({ ...formData, data: dateStr });
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
