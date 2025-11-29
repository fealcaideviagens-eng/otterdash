import { AlertTriangle, ChevronRight } from "lucide-react";
import { Opcao } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface AlertasCardProps {
  opcoes: Opcao[];
}

export const AlertasCard = ({ opcoes }: AlertasCardProps) => {
  const navigate = useNavigate();
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
            <div
              key={opcao.opcao + index}
              className="flex items-center justify-between p-3 rounded-lg bg-[#FBFBF2] cursor-pointer hover:bg-[#F6F6E6] dark:hover:bg-gray-950/30 transition-colors"
              onClick={() => navigate(`/opcoes?opcao=${opcao.ops_id}`)}
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="font-medium text-sm">{opcao.opcao}</span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={opcao.operacao === 'compra' ? 'default' : 'destructive'}
                    className={`text-xs ${opcao.operacao === 'compra' ? 'bg-[#307B58] text-white hover:bg-[#225B44]' : ''}`}
                  >
                    {opcao.operacao?.charAt(0).toUpperCase() + opcao.operacao?.slice(1) || '-'}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="text-xs bg-[#F6F6E6] text-gray-900 hover:bg-gray-200 border-0"
                  >
                    {opcao.tipo?.charAt(0).toUpperCase() + opcao.tipo?.slice(1) || '-'}
                  </Badge>
                </div>
                <span className="text-xs text-gray-900 ml-auto">
                  Vencimento: {format(new Date(opcao.data!), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-900 ml-4" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};