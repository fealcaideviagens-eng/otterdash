import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Opcao } from "@/types/database";
import { formatCurrency, formatDateForInput, parseLocalDate } from "@/utils/formatters";
import { formatCurrency as formatCurrencyInput, parseCurrencyToNumber } from "@/utils/inputFormatters";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EncerrarOpcaoModalProps {
  opcao: Opcao | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    opcao_id: string;
    premio: number;
    data: string;
    quantidade: number;
  }) => void;
}

export const EncerrarOpcaoModal = ({
  opcao,
  isOpen,
  onClose,
  onConfirm,
}: EncerrarOpcaoModalProps) => {
  const [formData, setFormData] = useState({
    premio: "0,00",
    data: formatDateForInput(new Date()),
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opcao) return;

    // Validar se não é fim de semana
    const selectedDate = new Date(formData.data);
    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      toast({
        title: "❌ Erro",
        description: "Não é possível encerrar opções em finais de semana.",
        className: "border-red-200 bg-red-50 text-red-900",
      });
      return;
    }

    const premioValue = parseCurrencyToNumber(formData.premio);
    
    // Validação para não aceitar valores negativos
    if (premioValue < 0) {
      toast({
        title: "❌ Erro",
        description: "O prêmio não pode ser negativo.",
        className: "border-red-200 bg-red-50 text-red-900",
      });
      return;
    }

    setLoading(true);
    try {
      await onConfirm({
        opcao_id: opcao.opcao,
        premio: premioValue,
        data: formData.data,
        quantidade: opcao.quantidade || 0,
      });
      
      toast({
        title: "✅ Sucesso!",
        description: "Opção encerrada com sucesso.",
        className: "border-green-200 bg-green-50 text-green-900",
      });
      
      // Reset form
      setFormData({
        premio: "0,00",
        data: formatDateForInput(new Date()),
      });
      onClose();
    } catch (error) {
      console.error("Erro ao encerrar opção:", error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível encerrar a opção.",
        className: "border-red-200 bg-red-50 text-red-900",
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularGanho = () => {
    if (!opcao || !formData.premio) return null;
    
    const premioOriginal = opcao.premio || 0;
    const premioNovo = parseCurrencyToNumber(formData.premio);
    const quantidade = opcao.quantidade || 0;
    
    let ganhoReais: number;
    let ganhoPercentual: number;
    
    if (opcao.operacao === 'compra') {
      // Para operações de COMPRA:
      // - Novo prêmio = 0 → Perda máxima (perda do prêmio original)
      // - Novo prêmio = Prêmio original → Resultado 0%
      // - Novo prêmio > Prêmio original → Lucro positivo
      ganhoReais = (premioNovo - premioOriginal) * quantidade;
      ganhoPercentual = premioOriginal > 0 ? ((premioNovo - premioOriginal) / premioOriginal) * 100 : 0;
    } else {
      // Para operações de VENDA (lógica original)
      ganhoReais = (premioOriginal - premioNovo) * quantidade;
      ganhoPercentual = premioOriginal > 0 ? ((premioOriginal - premioNovo) / premioOriginal) * 100 : 0;
    }
    
    return { ganhoReais, ganhoPercentual };
  };

  const ganho = calcularGanho();

  const handleCurrencyChange = (value: string) => {
    const formatted = formatCurrencyInput(value);
    setFormData(prev => ({ ...prev, premio: formatted }));
  };

  if (!opcao) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-modal-title">Encerrar opção: {opcao.opcao}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Prêmio original:</strong> {formatCurrency(opcao.premio || 0)}
              </div>
              <div>
                <strong>Quantidade:</strong> {opcao.quantidade || 0}
              </div>
            </div>

            <div>
              <Label htmlFor="premio">Novo prêmio</Label>
              <Input
                id="premio"
                value={formData.premio}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="placeholder-subtle"
                placeholder="0,00"
                required
              />
            </div>

            <div>
              <Label htmlFor="data">Data de encerramento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                      !formData.data && "text-muted-foreground"
                    )}
                  >
                    {formData.data ? (
                      format(parseLocalDate(formData.data), "dd/MM/yyyy")
                    ) : (
                      <span>Selecione a data</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.data ? parseLocalDate(formData.data) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        // Usar formato ISO sem conversão de fuso horário
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const dateString = `${year}-${month}-${day}`;
                        setFormData(prev => ({ ...prev, data: dateString }));
                      }
                    }}
                    disabled={(date) => {
                      // Desabilitar sábados (6) e domingos (0)
                      const dayOfWeek = date.getDay();
                      return dayOfWeek === 0 || dayOfWeek === 6;
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {ganho && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Resultado da operação:</h4>
                <div className="space-y-1 text-sm">
                  <div className={`font-medium ${ganho.ganhoReais >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {ganho.ganhoReais >= 0 ? 'Ganho' : 'Prejuízo'}: {formatCurrency(Math.abs(ganho.ganhoReais))}
                  </div>
                  <div className={`${ganho.ganhoPercentual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {ganho.ganhoPercentual.toFixed(2)}%
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} variant="default">
              {loading ? "Encerrando..." : "Confirmar encerramento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};