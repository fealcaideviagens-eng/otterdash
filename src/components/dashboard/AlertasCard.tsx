import { AlertTriangle, ChevronRight, TrendingUp } from "lucide-react";
import { Opcao } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EncerrarOpcaoModal } from "@/components/opcoes/EncerrarOpcaoModal";
import { EncerrarTravaModal } from "@/components/opcoes/EncerrarTravaModal";
import { formatDate } from "@/utils/formatters";
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
  onEncerrarTrava?: (data: {
    strategy_id: string;
    compra_premio: number;
    venda_premio: number;
    data: string;
    quantidade: number;
  }) => Promise<void>;
}

interface StrategyAlert {
  type: 'strategy';
  groupId: string;
  strategyType: string;
  legs: Opcao[];
  data: string;
}

// Interface compatível com o Modal
interface StrategyGroup {
  id: string;
  type: string;
  legs: Opcao[];
  acao: string;
  data: string;
  custoTotal: number;
  lucroMaximo: number;
  breakEven: number;
  quantidade: number;
}

type AlertItem = Opcao | StrategyAlert;

export const AlertasCard = ({ opcoes, onEncerrar, onEncerrarTrava }: AlertasCardProps) => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOpcao, setSelectedOpcao] = useState<Opcao | null>(null);

  const [strategyModalOpen, setStrategyModalOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyGroup | null>(null);

  const isVencida = (dataString: string) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const [ano, mes, dia] = dataString.split('-').map(Number);
    const dataValidade = new Date(ano, mes - 1, dia);

    return dataValidade < hoje;
  };

  // Filtrar e Agrupar opções
  const getAlertItems = (): AlertItem[] => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const cincoDiasAFrente = new Date();
    cincoDiasAFrente.setDate(hoje.getDate() + 5);
    cincoDiasAFrente.setHours(23, 59, 59, 999);

    // 1. Filtrar opções relevantes (vencidas ou próximas)
    const opcoesRelevantes = opcoes.filter(opcao => {
      if (opcao.status !== 'aberta' || !opcao.data) return false;
      const [ano, mes, dia] = opcao.data.split('-').map(Number);
      const dataValidade = new Date(ano, mes - 1, dia);
      return dataValidade <= cincoDiasAFrente;
    });

    // 2. Agrupar por Strategy Group ID
    const groups: Record<string, Opcao[]> = {};
    const singles: Opcao[] = [];

    opcoesRelevantes.forEach(opcao => {
      if (opcao.ops_strategy_group_id) {
        if (!groups[opcao.ops_strategy_group_id]) {
          groups[opcao.ops_strategy_group_id] = [];
        }
        groups[opcao.ops_strategy_group_id].push(opcao);
      } else {
        singles.push(opcao);
      }
    });

    // 3. Construir lista final
    const items: AlertItem[] = [...singles];

    Object.keys(groups).forEach(groupId => {
      const legs = groups[groupId];
      if (legs.length > 0) {
        // Assume all legs have same expiration and strategy type
        items.push({
          type: 'strategy',
          groupId,
          strategyType: legs[0].ops_strategy_type || 'Trava',
          legs,
          data: legs[0].data!
        });
      }
    });

    // 4. Ordenar
    return items.sort((a, b) => {
      const dataA = ('type' in a && a.type === 'strategy') ? a.data : a.data!;
      const dataB = ('type' in b && b.type === 'strategy') ? b.data : b.data!;

      const aVencida = isVencida(dataA);
      const bVencida = isVencida(dataB);

      // Prioridade: Vencidas primeiro
      if (aVencida && !bVencida) return -1;
      if (!aVencida && bVencida) return 1;

      // Secundária: Data mais próxima
      return new Date(dataA).getTime() - new Date(dataB).getTime();
    });
  };

  const handleEncerrarClick = (e: React.MouseEvent, opcao: Opcao) => {
    e.stopPropagation();
    setSelectedOpcao(opcao);
    setModalOpen(true);
  };

  const handleConfirmEncerrar = async (data: {
    premio: number;
    data: string;
    quantidade: number;
  }) => {
    const dataCorrigida = {
      ...data,
      opcao_id: selectedOpcao?.ops_id || ''
    };
    await onEncerrar(dataCorrigida);
    setModalOpen(false);
    setSelectedOpcao(null);
  };

  const handleEncerrarTravaClick = (e: React.MouseEvent, strategyItem: StrategyAlert) => {
    e.stopPropagation();

    // Construir objeto StrategyGroup para o modal
    const legs = strategyItem.legs;
    const compraLeg = legs.find(l => l.ops_strategy_role === 'LONG_LEG');
    const vendaLeg = legs.find(l => l.ops_strategy_role === 'SHORT_LEG');

    if (!compraLeg || !vendaLeg) return; // Should not happen if data is correct

    const quantidade = compraLeg.ops_quanti || 0;
    const premioCompra = compraLeg.ops_premio || 0;
    const premioVenda = vendaLeg.ops_premio || 0;

    // Custo Total (Débito) = (Premio Compra - Premio Venda) * Quantidade
    // Se for Crédito (Venda > Compra), custo seria negativo (lucro na montagem)
    // Mas para Trava de Alta é Débito.
    const custoTotal = (premioCompra - premioVenda);

    const groupData: StrategyGroup = {
      id: strategyItem.groupId,
      type: strategyItem.strategyType,
      legs: legs,
      acao: legs[0].ops_acao || '',
      data: strategyItem.data,
      custoTotal: custoTotal,
      lucroMaximo: 0, // Não essencial para o modal de encerramento
      breakEven: 0,   // Não essencial
      quantidade: quantidade
    };

    setSelectedStrategy(groupData);
    setStrategyModalOpen(true);
  };

  const handleConfirmEncerrarTrava = async (data: {
    strategy_id: string;
    compra_premio: number;
    venda_premio: number;
    data: string;
    quantidade: number;
  }) => {
    if (onEncerrarTrava) {
      await onEncerrarTrava(data);
    }
    setStrategyModalOpen(false);
    setSelectedStrategy(null);
  };

  const alertItems = getAlertItems();

  const getStrategyTitle = (type: string) => {
    if (type === 'BULL_CALL_SPREAD') return 'Trava de Alta';
    if (type === 'BEAR_PUT_SPREAD') return 'Trava de Baixa';
    return 'Estratégia';
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold">Alertas</h3>
          <Badge variant="secondary" className="ml-2">
            {alertItems.length}
          </Badge>
        </div>
      </div>

      {alertItems.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhuma opção próxima da validade</p>
      ) : (
        <div className="space-y-2">
          {alertItems.map((item, index) => {
            // RENDERIZAÇÃO DE ESTRATÉGIA (TRAVA)
            if ('type' in item && item.type === 'strategy') {
              const strategyItem = item as StrategyAlert;
              const isExpired = isVencida(strategyItem.data);
              const tickers = strategyItem.legs.map(l => l.ops_ticker).join(' e ');

              return (
                <div
                  key={strategyItem.groupId}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#FBFBF2] cursor-pointer hover:bg-[#F6F6E6] dark:hover:bg-gray-950/30 transition-colors border border-amber-100"
                  onClick={() => navigate(`/opcoes?strategy=${strategyItem.groupId}`)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="hidden sm:flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-800" />
                      <span className="font-semibold text-sm text-green-800 whitespace-nowrap">
                        {getStrategyTitle(strategyItem.strategyType)}
                      </span>
                    </div>

                    <span className="text-sm text-gray-700 truncate">
                      <span className="font-medium">{tickers}</span>
                    </span>

                    <div className="ml-auto flex items-center gap-3">
                      <span className="text-xs text-gray-900 hidden sm:inline">
                        {isExpired ? 'Trava vencida' : `Próximo ao vencimento: ${formatDate(strategyItem.data)}`}
                      </span>
                      {isExpired && (
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 text-xs"
                          onClick={(e) => handleEncerrarTravaClick(e, strategyItem)}
                        >
                          Encerrar
                        </Button>
                      )}
                    </div>
                  </div>
                  {!isExpired && (
                    <ChevronRight className="h-4 w-4 text-gray-900 ml-4" />
                  )}
                </div>
              );
            }

            // RENDERIZAÇÃO DE OPÇÃO SIMPLES (ORIGINAL)
            const opcao = item as Opcao;
            return (
              <div
                key={opcao.ops_id + index}
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
                      Próximo ao vencimento: {formatDate(opcao.data!)}
                    </span>
                  )}
                </div>
                {!isVencida(opcao.data!) && (
                  <ChevronRight className="h-4 w-4 text-gray-900 ml-4" />
                )}
              </div>
            );
          })}
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
      <EncerrarTravaModal
        strategy={selectedStrategy}
        isOpen={strategyModalOpen}
        onClose={() => {
          setStrategyModalOpen(false);
          setSelectedStrategy(null);
        }}
        onConfirm={handleConfirmEncerrarTrava}
      />
    </div>
  );
};