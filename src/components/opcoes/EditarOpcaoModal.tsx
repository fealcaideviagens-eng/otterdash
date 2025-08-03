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
import { Opcao } from "@/types/database";
import { formatCurrency, formatNumber, parseCurrencyToNumber, parseNumberToInt } from "@/utils/inputFormatters";
import { CalendarIcon } from "lucide-react";
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
        opcao: opcao.opcao,
        operacao: opcao.operacao,
        tipo: opcao.tipo,
        acao: opcao.acao,
        strike: opcao.strike,
        cotacao: opcao.cotacao,
        quantidade: opcao.quantidade,
        premio: opcao.premio,
        data: opcao.data,
      });
      
      setFormattedValues({
        strike: opcao.strike ? formatCurrency(opcao.strike.toString()) : "",
        cotacao: opcao.cotacao ? formatCurrency(opcao.cotacao.toString()) : "",
        quantidade: opcao.quantidade ? formatNumber(opcao.quantidade.toString()) : "",
        premio: opcao.premio ? formatCurrency(opcao.premio.toString()) : "",
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
            <Label htmlFor="data">Vencimento</Label>
            <div className="relative">
              <Input
                id="data"
                type="date"
                value={formData.data || ""}
                onChange={(e) => handleInputChange("data", e.target.value)}
                className="pr-10"
              />
              <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
            </div>
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