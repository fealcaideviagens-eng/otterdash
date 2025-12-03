import { useState, useEffect } from "react";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatCurrency as formatCurrencyInput, parseCurrencyToNumber } from "@/utils/inputFormatters";
import { formatDateForInput, parseLocalDate, formatQuantidade } from "@/utils/formatters";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Venda } from "@/types/database";

interface EditarEncerramentoModalProps {
  venda: Venda | null;
  operacao: 'compra' | 'venda';
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { premio: number; data: string; quantidade: number }) => void;
}

export function EditarEncerramentoModal({
  venda,
  operacao,
  isOpen,
  onClose,
  onConfirm,
}: EditarEncerramentoModalProps) {
  const [formData, setFormData] = useState({
    premio: 0,
    data: "",
    quantidade: 0,
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [formattedValues, setFormattedValues] = useState({
    premio: "",
    quantidade: "",
  });

  useEffect(() => {
    if (venda && isOpen) {
      setFormData({
        premio: operacao === 'venda' ? -venda.premio : venda.premio,
        data: venda.encerramento,
        quantidade: venda.quantidade,
      });
      setFormattedValues({
        premio: formatCurrencyInput((operacao === 'venda' ? -venda.premio : venda.premio).toString()),
        quantidade: venda.quantidade.toString(),
      });
    }
  }, [venda, isOpen, operacao]);

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
    <ResponsiveModal open={isOpen} onOpenChange={onClose}>
      <ResponsiveModalContent className="sm:max-w-[500px]">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Editar encerramento</ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-4 sm:px-0 pb-4 sm:pb-0">
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
              type="text"
              inputMode="numeric"
              value={formatQuantidade(formattedValues.quantidade)}
              onChange={(e) => {
                // Remove tudo que não for número
                const apenasNumeros = e.target.value.replace(/\D/g, "");
                setFormattedValues(prev => ({ ...prev, quantidade: apenasNumeros }));
              }}
              placeholder="1.000"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              required
            />
          </div>

          <div>
            <Label>Data de Encerramento</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
                  defaultMonth={formData.data ? parseLocalDate(formData.data) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const dateStr = formatDateForInput(date);
                      setFormData({ ...formData, data: dateStr });
                      setIsCalendarOpen(false);
                    }
                  }}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <ResponsiveModalFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar
            </Button>
          </ResponsiveModalFooter>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

