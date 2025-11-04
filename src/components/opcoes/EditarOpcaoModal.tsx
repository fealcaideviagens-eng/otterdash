import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Opcao } from "@/types/database";
import { formatCurrency, formatNumber, formatCurrencyValue, parseCurrencyToNumber, parseNumberToInt } from "@/utils/inputFormatters";
import { formatDateForInput, parseLocalDate } from "@/utils/formatters";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface EditarOpcaoModalProps {
  opcao: Opcao | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Partial<Opcao>) => void;
}

export function EditarOpcaoModal({
  opcao,
  isOpen,
  onClose,
  onConfirm,
}: EditarOpcaoModalProps) {
  const [formData, setFormData] = useState<Partial<Opcao>>({});
  const [formattedValues, setFormattedValues] = useState({
    strike: "",
    cotacao: "",
    quantidade: "",
    premio: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (opcao) {
      setFormData({
        opcao: opcao.ops_ticker,      // Usar campo real da tabela
        operacao: opcao.ops_operacao, // Usar campo real da tabela
        tipo: opcao.ops_tipo,         // Usar campo real da tabela
        acao: opcao.ops_acao,         // Usar campo real da tabela
        strike: opcao.ops_strike,     // Usar campo real da tabela
        cotacao: opcao.acao_cotacao,  // Usar campo real da tabela
        quantidade: opcao.ops_quanti, // Usar campo real da tabela
        premio: opcao.ops_premio,     // Usar campo real da tabela
        data: opcao.ops_vencimento,   // Usar campo real da tabela
      });
      
      setFormattedValues({
        strike: opcao.ops_strike ? formatCurrencyValue(opcao.ops_strike) : "",
        cotacao: opcao.acao_cotacao ? formatCurrencyValue(opcao.acao_cotacao) : "",
        quantidade: opcao.ops_quanti ? formatNumber(opcao.ops_quanti.toString()) : "",
        premio: opcao.ops_premio ? formatCurrencyValue(opcao.ops_premio) : "",
      });
    }
  }, [opcao]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Converter valores formatados para números antes de enviar
    const processedData = {
      ...formData,
      strike: formattedValues.strike ? parseCurrencyToNumber(formattedValues.strike) : formData.strike,
      cotacao: formattedValues.cotacao ? parseCurrencyToNumber(formattedValues.cotacao) : formData.cotacao,
      premio: formattedValues.premio ? parseCurrencyToNumber(formattedValues.premio) : formData.premio,
      quantidade: formattedValues.quantidade ? parseNumberToInt(formattedValues.quantidade) : formData.quantidade,
    };
    
    onConfirm(processedData);
    onClose();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCurrencyChange = (field: string, value: string) => {
    const formatted = formatCurrency(value);
    setFormattedValues(prev => ({
      ...prev,
      [field]: formatted
    }));
  };

  const handleNumberChange = (field: string, value: string) => {
    const formatted = formatNumber(value);
    setFormattedValues(prev => ({
      ...prev,
      [field]: formatted
    }));
  };

  if (!opcao) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar opção</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="opcao">Opção</Label>
            <Input
              id="opcao"
              value={formData.opcao || ""}
              onChange={(e) => handleInputChange("opcao", e.target.value)}
              className="placeholder-subtle"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="operacao">Operação</Label>
            <Select value={formData.operacao || ""} onValueChange={(value) => handleInputChange("operacao", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a operação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compra">Compra</SelectItem>
                <SelectItem value="venda">Venda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select value={formData.tipo || ""} onValueChange={(value) => handleInputChange("tipo", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="put">Put</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="acao">Ação</Label>
            <Input
              id="acao"
              value={formData.acao || ""}
              onChange={(e) => handleInputChange("acao", e.target.value)}
              className="placeholder-subtle"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="strike">Strike</Label>
              <Input
                id="strike"
                value={formattedValues.strike}
                onChange={(e) => handleCurrencyChange("strike", e.target.value)}
                className="placeholder-subtle"
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cotacao">Cotação</Label>
              <Input
                id="cotacao"
                value={formattedValues.cotacao}
                onChange={(e) => handleCurrencyChange("cotacao", e.target.value)}
                className="placeholder-subtle"
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                value={formattedValues.quantidade}
                onChange={(e) => handleNumberChange("quantidade", e.target.value)}
                className="placeholder-subtle"
                placeholder="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="premio">Prêmio</Label>
              <Input
                id="premio"
                value={formattedValues.premio}
                onChange={(e) => handleCurrencyChange("premio", e.target.value)}
                className="placeholder-subtle"
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Vencimento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
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
                      handleInputChange("data", dateStr);
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
            <Button type="submit" style={{ backgroundColor: '#61005D' }}>
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}