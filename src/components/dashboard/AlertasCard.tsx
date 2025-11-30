import { AlertTriangle, ChevronRight } from "lucide-react";
import { Opcao } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EncerrarOpcaoModal } from "@/components/opcoes/EncerrarOpcaoModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface AlertasCardProps {
  opcoes: Opcao[];
  onEncerrar: (data: {
    opcao_id: string;
    premio: number;
    data: string;
    quantidade: number;
  }) => Promise<void>;
}

export const AlertasCard = ({ opcoes, onEncerrar }: AlertasCardProps) => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOpcao, setSelectedOpcao] = useState<Opcao | null>(null);

  // Filtrar opções que vencem em 5 dias ou menos (incluindo as já vencidas)
  const getOpcoesComAlerta = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const cincoDiasAFrente = new Date();
    cincoDiasAFrente.setDate(hoje.getDate() + 5);
    cincoDiasAFrente.setHours(23, 59, 59, 999);

    return opcoes.filter(opcao => {
      if (opcao.status !== 'aberta' || !opcao.data) return false;

      // Criar data da opção ajustando fuso horário se necessário
      // Assumindo que a string vem como YYYY-MM-DD
      const [ano, mes, dia] = opcao.data.split('-').map(Number);
      const dataValidade = new Date(ano, mes - 1, dia);

      // Retorna true se estiver vencida (menor que hoje) OU próxima do vencimento (até 5 dias)
      return dataValidade <= cincoDiasAFrente;
    }).sort((a, b) => {
      const aVencida = isVencida(a.data!);
      const bVencida = isVencida(b.data!);

      // 1. Prioridade: Vencidas primeiro
      if (aVencida && !bVencida) return -1;
      if (!aVencida && bVencida) return 1;

      // 2. Secundária: Ordem alfabética
      return a.opcao.localeCompare(b.opcao);
    });
  };

  const handleEncerrarClick = (e: React.MouseEvent, opcao: Opcao) => {
    e.stopPropagation(); // Evitar navegação ao clicar no botão
    setSelectedOpcao(opcao);
    setModalOpen(true);
  };

  const handleConfirmEncerrar = async (data: any) => {
    // Garantir que estamos passando o ID correto (UUID) e não o ticker
    const dataCorrigida = {
      ...data,
      opcao_id: selectedOpcao?.ops_id
    };
    await onEncerrar(dataCorrigida);
    setModalOpen(false);
    setSelectedOpcao(null);
  };

  const isVencida = (dataString: string) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const [ano, mes, dia] = dataString.split('-').map(Number);
    const dataValidade = new Date(ano, mes - 1, dia);

    return dataValidade < hoje;
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
                <div className="hidden sm:flex items-center gap-2">
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
                <span className="font-medium text-sm">{opcao.opcao}</span>

                {isVencida(opcao.data!) ? (
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-xs text-gray-900">
                      Opção vencida
                    </span>
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 text-xs"
                      onClick={(e) => handleEncerrarClick(e, opcao)}
                    >
                      Encerrar
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-900 ml-auto">
                    Próximo ao vencimento: {format(new Date(opcao.data!), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                )}
              </div>
              {!isVencida(opcao.data!) && (
                <ChevronRight className="h-4 w-4 text-gray-900 ml-4" />
              )}
            </div>
          ))}
        </div>
      )}
      <EncerrarOpcaoModal
        opcao={selectedOpcao}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedOpcao(null);
        }}
        onConfirm={handleConfirmEncerrar}
      />
    </div>
  );
};