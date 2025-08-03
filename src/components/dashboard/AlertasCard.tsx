import { AlertTriangle } from "lucide-react";
import { Opcao } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AlertasCardProps {
  opcoes: Opcao[];
}

export const AlertasCard = ({ opcoes }: AlertasCardProps) => {
  // Filtrar opções que vencem em 5 dias ou menos
  const getOpcoesComAlerta = () => {
    const hoje = new Date();
    const cincoDiasAFrente = new Date();
    cincoDiasAFrente.setDate(hoje.getDate() + 5);

    return opcoes.filter(opcao => {
      if (opcao.status !== 'aberta' || !opcao.data) return false;
      
      const dataValidade = new Date(opcao.data);
      return dataValidade >= hoje && dataValidade <= cincoDiasAFrente;
    });
  };

  const opcoesComAlerta = getOpcoesComAlerta();

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold">Alertas</h3>
          <Badge variant="secondary" className="ml-2">
            {opcoesComAlerta.length}
          </Badge>
        </div>
      </div>
      
      {opcoesComAlerta.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhuma opção próxima da validade</p>
      ) : (
        <div className="space-y-2">
          {opcoesComAlerta.map((opcao, index) => (
            <div key={opcao.opcao + index} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3 flex-1">
                <span className="font-medium text-sm">{opcao.opcao}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={opcao.tipo?.toLowerCase() === 'call' ? 'default' : 'secondary'} className="text-xs">
                    {opcao.tipo}
                  </Badge>
                  <Badge variant={opcao.operacao?.toLowerCase() === 'compra' ? 'default' : 'outline'} className="text-xs">
                    {opcao.operacao}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground ml-auto">
                  Vence: {format(new Date(opcao.data!), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};