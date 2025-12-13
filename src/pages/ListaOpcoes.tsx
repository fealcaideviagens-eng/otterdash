import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EncerrarOpcaoModal } from "@/components/opcoes/EncerrarOpcaoModal";
import { EditarOpcaoModal } from "@/components/opcoes/EditarOpcaoModal";
import { EditarEncerramentoModal } from "@/components/opcoes/EditarEncerramentoModal";
import { DeleteOpcaoModal } from "@/components/opcoes/DeleteOpcaoModal";
import { useOpcoes } from "@/hooks/useOpcoes";
import { useAuth } from "@/context/AuthContext";
import { Opcao, Venda } from "@/types/database";
import { formatCurrency, formatDate, formatQuantidade } from "@/utils/formatters";
import { ChevronDown, ChevronUp, Edit, Trash2, FileText, FileTextIcon, CirclePlus } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { StrategyCard } from "@/components/opcoes/StrategyCard";
import { EncerrarTravaModal } from "@/components/opcoes/EncerrarTravaModal";
import { EditarTravaModal } from "@/components/opcoes/EditarTravaModal";
import { DeleteTravaModal } from "@/components/opcoes/DeleteTravaModal";

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

export default function ListaOpcoes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { opcoes, vendas, loading, encerrarOpcao, editarOpcao, editarEncerramento, deletarOpcao, refreshData } = useOpcoes(user?.id || '');
  const [selectedOpcao, setSelectedOpcao] = useState<Opcao | null>(null);
  const [selectedVenda, setSelectedVenda] = useState<Venda | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editEncerramentoModalOpen, setEditEncerramentoModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyGroup | null>(null);
  const [travaModalOpen, setTravaModalOpen] = useState(false);
  const [editTravaModalOpen, setEditTravaModalOpen] = useState(false);
  const [deleteTravaModalOpen, setDeleteTravaModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);
  const [highlightedOpcaoId, setHighlightedOpcaoId] = useState<string | null>(null);
  const [highlightedStrategyId, setHighlightedStrategyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("abertas");
  const processedRef = useRef(false);

  // Log inicial para debug
  console.log('🚀 ListaOpcoes montado - opcoes:', opcoes.length, 'vendas:', vendas.length);

  // Remover destaque ao clicar em qualquer lugar
  useEffect(() => {
    const handleGlobalClick = () => {
      if (highlightedOpcaoId) {
        setHighlightedOpcaoId(null);
      }
      if (highlightedStrategyId) {
        setHighlightedStrategyId(null);
      }
    };

    if (highlightedOpcaoId || highlightedStrategyId) {
      document.addEventListener('click', handleGlobalClick);
    }

    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [highlightedOpcaoId, highlightedStrategyId]);

  // Detectar parâmetro da URL e destacar o card
  useEffect(() => {
    const opcaoId = searchParams.get('opcao');
    const strategyId = searchParams.get('strategy');
    console.log('🔍 URL Params - opcaoId:', opcaoId, 'strategyId:', strategyId);

    // Só executar se não estiver carregando, tiver dados e não tiver sido processado ainda
    if ((opcaoId || strategyId) && opcoes.length > 0 && !loading && !processedRef.current) {
      console.log('🎬 Iniciando processamento...');
      processedRef.current = true; // Marcar como processado

      if (opcaoId) {
        const opcao = opcoes.find(o => o.ops_id === opcaoId);
        if (opcao) {
          if (opcao.status === 'aberta') {
            console.log('✅ Opção está ABERTA - Destacando card');
            setActiveTab('abertas');
            setHighlightedOpcaoId(opcaoId);

            setTimeout(() => {
              const element = document.querySelector(`[data-opcao-id="${opcaoId}"]`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 500);
          }
          // Limpar o parâmetro da URL
          setTimeout(() => {
            searchParams.delete('opcao');
            setSearchParams(searchParams, { replace: true });
          }, 2000);
        }
      } else if (strategyId) {
        console.log('✅ Estratégia detectada - Destacando card');
        setActiveTab('abertas');
        setHighlightedStrategyId(strategyId);

        setTimeout(() => {
          const element = document.querySelector(`[data-strategy-id="${strategyId}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);

        // Limpar o parâmetro da URL
        setTimeout(() => {
          searchParams.delete('strategy');
          setSearchParams(searchParams, { replace: true });
        }, 2000);
      }
    }
  }, [opcoes, vendas, loading, searchParams, setSearchParams]);

  // Função para agrupar operações
  const groupOperations = (opcoes: Opcao[]): (Opcao | StrategyGroup)[] => {
    const grouped: { [key: string]: Opcao[] } = {};
    const singles: Opcao[] = [];

    opcoes.forEach(opcao => {
      if (opcao.ops_strategy_group_id) {
        if (!grouped[opcao.ops_strategy_group_id]) {
          grouped[opcao.ops_strategy_group_id] = [];
        }
        grouped[opcao.ops_strategy_group_id].push(opcao);
      } else {
        singles.push(opcao);
      }
    });

    const strategies: StrategyGroup[] = Object.keys(grouped).map(groupId => {
      const legs = grouped[groupId];
      const compraLeg = legs.find(l => l.ops_strategy_role === 'LONG_LEG');
      const vendaLeg = legs.find(l => l.ops_strategy_role === 'SHORT_LEG');

      if (!compraLeg || !vendaLeg) return null; // Incomplete strategy

      // Detectar o tipo de estratégia
      const strategyType = compraLeg.ops_strategy_type || 'BULL_CALL_SPREAD';
      const isBullCallSpread = strategyType === 'BULL_CALL_SPREAD';
      const isBearPutSpread = strategyType === 'BEAR_PUT_SPREAD';

      // Calculations
      const custoTotal = (compraLeg.ops_premio || 0) - (vendaLeg.ops_premio || 0);
      const strikeCompra = compraLeg.ops_strike || 0;
      const strikeVenda = vendaLeg.ops_strike || 0;

      // Calcular Lucro Máximo e Break-Even baseado no tipo de estratégia
      let lucroMaximo = 0;
      let breakEven = 0;

      if (isBullCallSpread) {
        // Bull Call: Max Profit = (Strike Venda - Strike Compra) - Custo
        lucroMaximo = (strikeVenda - strikeCompra) - custoTotal;
        // Break-Even: Strike Compra + Custo
        breakEven = strikeCompra + custoTotal;
      } else if (isBearPutSpread) {
        // Bear Put: Max Profit = (Strike Compra - Strike Venda) - Custo
        lucroMaximo = (strikeCompra - strikeVenda) - custoTotal;
        // Break-Even: Strike Compra - Custo
        breakEven = strikeCompra - custoTotal;
      }

      return {
        id: groupId,
        type: strategyType,
        legs,
        acao: compraLeg.ops_acao || '',
        data: compraLeg.ops_vencimento || '',
        custoTotal,
        lucroMaximo,
        breakEven,
        quantidade: compraLeg.ops_quanti || 0
      };
    }).filter(Boolean) as StrategyGroup[];

    return [...strategies, ...singles];
  };

  // Ordenar e Agrupar opções abertas
  const opcoesAbertasRaw = opcoes.filter(opcao => opcao.status === 'aberta');
  const opcoesAbertas = groupOperations(opcoesAbertasRaw).sort((a, b) => {
    // Sort logic (simplified for mixed types)
    const dateA = 'legs' in a ? new Date(a.data) : new Date(a.data || '');
    const dateB = 'legs' in b ? new Date(b.data) : new Date(b.data || '');
    return dateA.getTime() - dateB.getTime();
  });

  const handleEncerrarTrava = (strategy: StrategyGroup) => {
    setSelectedStrategy(strategy);
    setTravaModalOpen(true);
  };

  const handleConfirmEncerrarTrava = async (data: {
    strategy_id: string;
    compra_premio: number;
    venda_premio: number;
    data: string;
    quantidade: number;
  }) => {
    if (!selectedStrategy) return;

    const compraLeg = selectedStrategy.legs.find(leg => leg.ops_strategy_role === 'LONG_LEG');
    const vendaLeg = selectedStrategy.legs.find(leg => leg.ops_strategy_role === 'SHORT_LEG');

    if (!compraLeg || !vendaLeg) return;

    // Encerrar ambas as pernas
    await encerrarOpcao(compraLeg.ops_id, {
      premio: data.compra_premio,
      data: data.data,
      quantidade: data.quantidade,
    });

    await encerrarOpcao(vendaLeg.ops_id, {
      premio: data.venda_premio,
      data: data.data,
      quantidade: data.quantidade,
    });

    await refreshData();
  };

  const handleEditTrava = (strategy: StrategyGroup) => {
    setSelectedStrategy(strategy);
    setEditTravaModalOpen(true);
  };

  const handleConfirmEditTrava = async (data: {
    compraData: Partial<Opcao>;
    vendaData: Partial<Opcao>;
  }) => {
    if (!selectedStrategy) return;

    const compraLeg = selectedStrategy.legs.find(leg => leg.ops_strategy_role === 'LONG_LEG');
    const vendaLeg = selectedStrategy.legs.find(leg => leg.ops_strategy_role === 'SHORT_LEG');

    if (!compraLeg || !vendaLeg) return;

    // Detectar tipo de opção baseado na estratégia
    const optionType = selectedStrategy.type === 'BULL_CALL_SPREAD' ? 'call' : 'put';

    // Mapear para o formato esperado pela função editarOpcao
    const compraFormatted = {
      opcao: data.compraData.ops_ticker,
      operacao: 'compra',
      tipo: optionType,
      acao: data.compraData.ops_acao,
      strike: data.compraData.ops_strike,
      cotacao: data.compraData.acao_cotacao,
      quantidade: data.compraData.ops_quanti,
      premio: data.compraData.ops_premio,
      data: data.compraData.ops_vencimento,
    };

    const vendaFormatted = {
      opcao: data.vendaData.ops_ticker,
      operacao: 'venda',
      tipo: optionType,
      acao: data.vendaData.ops_acao,
      strike: data.vendaData.ops_strike,
      cotacao: data.vendaData.acao_cotacao,
      quantidade: data.vendaData.ops_quanti,
      premio: data.vendaData.ops_premio,
      data: data.vendaData.ops_vencimento,
    };

    // Editar ambas as pernas
    await editarOpcao(compraLeg.ops_id, compraFormatted);
    await editarOpcao(vendaLeg.ops_id, vendaFormatted);
    await refreshData();
  };

  const handleDeleteTrava = (strategy: StrategyGroup) => {
    setSelectedStrategy(strategy);
    setDeleteTravaModalOpen(true);
  };

  const handleConfirmDeleteTrava = async () => {
    if (!selectedStrategy) return;

    const compraLeg = selectedStrategy.legs.find(leg => leg.ops_strategy_role === 'LONG_LEG');
    const vendaLeg = selectedStrategy.legs.find(leg => leg.ops_strategy_role === 'SHORT_LEG');

    if (compraLeg) await deletarOpcao(compraLeg.ops_id);
    if (vendaLeg) await deletarOpcao(vendaLeg.ops_id);

    await refreshData();
  };

  // ... inside render ...



  // Ordenar opções finalizadas por data de encerramento (mais recente primeiro)
  const opcoesFinalizadas = opcoes
    .filter(opcao => opcao.status === 'encerrada')
    .sort((a, b) => {
      const vendaA = vendas.find(v => v.ops_id === a.ops_id);
      const vendaB = vendas.find(v => v.ops_id === b.ops_id);

      if (!vendaA?.encerramento || !vendaB?.encerramento) return 0;

      const dateA = new Date(vendaA.encerramento);
      const dateB = new Date(vendaB.encerramento);

      return dateB.getTime() - dateA.getTime(); // Ordenar da mais recente para mais antiga
    });

  const calculateGanhoMaximo = (opcao: Opcao): number => {
    if (!opcao.quantidade || !opcao.premio) return 0;
    const ganho = opcao.quantidade * opcao.premio;
    // Para operações de compra, o ganho máximo é negativo
    return opcao.operacao === 'compra' ? -ganho : ganho;
  };

  const calculateDiferencaPercentual = (opcao: Opcao): string => {
    if (!opcao.strike || !opcao.cotacao) return '-';

    // Fórmula única para todas as operações: (Strike-Cotação)/Cotação sempre positiva
    const diferenca = Math.abs((opcao.strike - opcao.cotacao) / opcao.cotacao) * 100;
    return `${diferenca.toFixed(2)}%`;
  };

  const calculateRentabilidadeMaxima = (opcao: Opcao): string => {
    if (!opcao.quantidade || !opcao.strike || !opcao.tipo || !opcao.operacao) return '-';

    if ((opcao.tipo === 'call' || opcao.tipo === 'put') && opcao.operacao === 'venda') {
      const baseValue = opcao.quantidade * opcao.strike;
      const valueWithBonus = baseValue + (baseValue * 0.0025); // 0.25%
      const ganhoMaximo = calculateGanhoMaximo(opcao);
      const rentabilidade = (ganhoMaximo / valueWithBonus) * 100;
      return `${rentabilidade.toFixed(2)}%`;
    }

    return '-';
  };

  const calculateLucroPrejuizoReais = (opcao: Opcao): number => {
    if (!opcao.quantidade || !opcao.premio) return 0;

    // Encontrar a venda correspondente a essa opção
    const venda = vendas.find(v => v.ops_id === opcao.ops_id);
    if (!venda) return 0;

    // Valor inicial: Quantidade * Prêmio inicial
    const valorInicial = opcao.quantidade * opcao.premio;

    // Valor final: Quantidade * Novo prêmio (do encerramento)
    const valorFinal = venda.quantidade * venda.premio;

    // Para vendas: lucro = valor inicial - valor final
    // Para compras: lucro = valor final - valor inicial
    return opcao.operacao === 'venda' ? valorInicial - valorFinal : valorFinal - valorInicial;
  };

  const calculateDiferencaPremio = (opcao: Opcao): number => {
    // Encontrar a venda correspondente a essa opção
    const venda = vendas.find(v => v.ops_id === opcao.ops_id);
    if (!venda || !opcao.premio) return 0;

    // Para Venda: Prêmio inicial - Prêmio final
    // Para Compra: Prêmio final - Prêmio inicial
    if (opcao.operacao === 'venda') {
      return opcao.premio - venda.premio;
    } else {
      return venda.premio - opcao.premio;
    }
  };

  const calculateLucroPrejuizoPorcentagem = (opcao: Opcao): string => {
    if (!opcao.quantidade || !opcao.premio || !opcao.operacao) return '-';

    // Encontrar a venda correspondente a essa opção
    const venda = vendas.find(v => v.ops_id === opcao.ops_id);
    if (!venda) return '-';

    const premioOriginal = opcao.premio;
    const premioNovo = venda.premio;

    let ganhoPercentual: number;

    if (opcao.operacao === 'compra') {
      // Para operações de COMPRA: (premioNovo - premioOriginal) / premioOriginal * 100
      ganhoPercentual = ((premioNovo - premioOriginal) / premioOriginal) * 100;
    } else {
      // Para operações de VENDA: (premioOriginal - premioNovo) / premioOriginal * 100
      ganhoPercentual = ((premioOriginal - premioNovo) / premioOriginal) * 100;
    }

    return `${ganhoPercentual.toFixed(2)}%`;
  };

  const getDataEncerramento = (opcao: Opcao): string => {
    const venda = vendas.find(v => v.ops_id === opcao.ops_id);
    return venda?.encerramento ? formatDate(venda.encerramento) : '-';
  };

  // Função para agrupar operações finalizadas por mês
  const groupOpcoesFinalizadasByMonth = () => {
    const groups: { [key: string]: Opcao[] } = {};

    opcoesFinalizadas.forEach(opcao => {
      const venda = vendas.find(v => v.ops_id === opcao.ops_id);
      if (venda?.encerramento) {
        // Criar a data localmente para evitar problemas de fuso horário
        const [year, month, day] = venda.encerramento.split('-').map(Number);
        const dataEncerramento = new Date(year, month - 1, day);
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
        const monthName = dataEncerramento.toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric'
        });

        if (!groups[monthKey]) {
          groups[monthKey] = [];
        }
        groups[monthKey].push(opcao);
      }
    });

    // Ordenar as chaves (meses) do mais recente para o mais antigo
    const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));

    return sortedKeys.map(key => {
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const monthName = date.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
      });

      return {
        key,
        monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        opcoes: groups[key]
      };
    });
  };

  const handleEncerrar = (opcao: Opcao) => {
    setSelectedOpcao(opcao);
    setModalOpen(true);
  };

  const handleEdit = (opcao: Opcao) => {
    setSelectedOpcao(opcao);
    setEditModalOpen(true);
  };

  const handleDelete = (opcao: Opcao) => {
    setSelectedOpcao(opcao);
    setDeleteModalOpen(true);
  };

  const handleConfirmEncerrar = async (data: {
    opcao_id: string;
    premio: number;
    data: string;
    quantidade: number;
  }) => {
    if (selectedOpcao?.ops_id) {
      await encerrarOpcao(selectedOpcao.ops_id, data);
      await refreshData();
    }
  };

  const handleConfirmEdit = async (data: Partial<Opcao>) => {
    if (selectedOpcao?.ops_id) {
      await editarOpcao(selectedOpcao.ops_id, data);
      await refreshData();
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedOpcao?.ops_id) {
      await deletarOpcao(selectedOpcao.ops_id);
      await refreshData();
    }
  };

  const handleEditEncerramento = (opcao: Opcao) => {
    const venda = vendas.find(v => v.ops_id === opcao.ops_id);
    if (venda) {
      setSelectedOpcao(opcao);
      setSelectedVenda(venda);
      setEditEncerramentoModalOpen(true);
    }
  };

  const handleConfirmEditEncerramento = async (data: { premio: number; data: string; quantidade: number }) => {
    if (selectedVenda?.completed_id) {
      await editarEncerramento(selectedVenda.completed_id, data);
      await refreshData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Carregando suas opções...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Portfólio</h1>
        <p className="text-muted-foreground">
          Gerencie todas as suas operações de opções
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suas opções</CardTitle>
        </CardHeader>
        <CardContent>
          {opcoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
              <p className="text-muted-foreground text-lg">
                Nenhuma opção cadastrada ainda
              </p>

              <Button
                onClick={() => navigate("/nova-operacao")} // Ajuste a rota se for /cadastro ou /nova-operacao
                className="shadow-modern hover:bg-brand-blue transition-colors bg-brand-blue-dark"
              >
                <CirclePlus className="mr-2 h-4 w-4" />
                Cadastre uma opção
              </Button>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="abertas" className="data-[state=active]:text-white text-black">Abertas ({opcoesAbertas.length})</TabsTrigger>
                <TabsTrigger value="finalizadas" className="data-[state=active]:text-white text-black">Finalizadas ({opcoesFinalizadas.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="abertas" className="mt-4">
                <div className="cards-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 items-start">
                  {opcoesAbertas.map((item, index) => {
                    if ('legs' in item) {
                      // Render Strategy Card
                      return (
                        <StrategyCard
                          key={item.id}
                          strategy={item}
                          onEncerrar={handleEncerrar}
                          onEncerrarTrava={handleEncerrarTrava}
                          onEditar={handleEditTrava}
                          onDeletar={handleDelete}
                          onDeletarTrava={handleDeleteTrava}
                          isHighlighted={highlightedStrategyId === item.id}
                        />
                      );
                    } else {
                      // Render Single Option Card
                      return (
                        <CardOpcao
                          key={`${item.opcao}-${index}`}
                          opcao={item}
                          isHighlighted={highlightedOpcaoId === item.ops_id}
                          onEncerrar={handleEncerrar}
                          onEditar={handleEdit}
                          onDeletar={handleDelete}
                          calculateDiferencaPercentual={calculateDiferencaPercentual}
                          calculateGanhoMaximo={calculateGanhoMaximo}
                          calculateRentabilidadeMaxima={calculateRentabilidadeMaxima}
                          formatCurrency={formatCurrency}
                          formatDate={formatDate}
                        />
                      );
                    }
                  })}
                </div>
              </TabsContent>

              <TabsContent value="finalizadas" className="mt-4">
                <div className="space-y-6">
                  {groupOpcoesFinalizadasByMonth().map((monthGroup) => (
                    <div key={monthGroup.key} className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                        {monthGroup.monthName}
                      </h3>
                      <Accordion type="multiple" className="w-full" value={openAccordions} onValueChange={setOpenAccordions}>
                        {monthGroup.opcoes.map((opcao, index) => {
                          const venda = vendas.find(v => v.ops_id === opcao.ops_id);
                          const accordionValue = `${monthGroup.key}-item-${index}`;
                          return (
                            <AccordionItem
                              key={`${opcao.opcao}-${index}`}
                              value={accordionValue}
                              id={`accordion-${accordionValue}`}
                            >
                              <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-4">
                                  <div className="flex items-center space-x-2 sm:space-x-4">
                                    <span className="font-medium">{opcao.opcao}</span>
                                    <Badge
                                      variant={opcao.operacao === 'compra' ? 'default' : 'destructive'}
                                      className={`hidden sm:inline-flex ${opcao.operacao === 'compra' ? 'bg-buy text-buy-foreground hover:bg-buy/90' : ''}`}
                                    >
                                      {opcao.operacao?.charAt(0).toUpperCase() + opcao.operacao?.slice(1) || '-'}
                                    </Badge>
                                    {opcao.tipo && (
                                      <Badge
                                        variant="secondary"
                                        className={`hidden sm:inline-flex ${opcao.tipo === 'put'
                                          ? 'bg-neutral-bg text-foreground hover:bg-muted border-0'
                                          : 'bg-neutral-bg text-foreground hover:bg-muted border-0'
                                          }`}
                                      >
                                        {opcao.tipo.charAt(0).toUpperCase() + opcao.tipo.slice(1)}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-6 text-sm">
                                    <span className={`font-medium ${calculateLucroPrejuizoReais(opcao) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {formatCurrency(calculateLucroPrejuizoReais(opcao))}
                                    </span>
                                    <span className={`${calculateLucroPrejuizoPorcentagem(opcao).includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                                      {calculateLucroPrejuizoPorcentagem(opcao)}
                                    </span>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 p-4 bg-muted/30 rounded-lg">
                                  {/* Dados da Operação Original */}
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-base border-b pb-2">Dados da operação</h4>
                                    <div className="space-y-3">
                                      {opcao.acao && /\d/.test(opcao.acao) && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Ação:</span>
                                          <span className="font-medium">{opcao.acao}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Strike:</span>
                                        <span className="font-medium">{opcao.strike ? formatCurrency(opcao.strike).replace(/^R\$\s*/, 'R$ ') : '-'}</span>
                                      </div>
                                      {!!opcao.cotacao && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Cotação no cadastro:</span>
                                          <span className="font-medium">{formatCurrency(opcao.cotacao)}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Quantidade:</span>
                                        <span className="font-medium">{opcao.quantidade ? (opcao.operacao === 'venda' ? `-${formatQuantidade(opcao.quantidade)}` : formatQuantidade(opcao.quantidade)) : '-'}</span>                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Prêmio inicial:</span>
                                        <span className="font-medium">
                                          {opcao.premio ? formatCurrency(opcao.operacao === 'compra' ? -opcao.premio : opcao.premio).replace(/^R\$\s*/, 'R$ ') : '-'}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Data de abertura:</span>
                                        <span className="font-medium">{opcao.data ? formatDate(opcao.data) : '-'}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Dados do Encerramento */}
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-base border-b pb-2">Dados do encerramento</h4>
                                    <div className="space-y-3">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Prêmio final:</span>
                                        <span className="font-medium">
                                          {venda?.premio !== undefined ? formatCurrency(opcao.operacao === 'venda' ? -venda.premio : venda.premio).replace(/^R\$\s*/, 'R$ ') : '-'}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Diferença de prêmio:</span>
                                        <span className={`font-medium ${calculateDiferencaPremio(opcao) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {formatCurrency(calculateDiferencaPremio(opcao))}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Data de encerramento:</span>
                                        <span className="font-medium">{getDataEncerramento(opcao)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Resultado (R$):</span>
                                        <span className={`font-medium ${calculateLucroPrejuizoReais(opcao) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {formatCurrency(calculateLucroPrejuizoReais(opcao))}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Resultado (%):</span>
                                        <span className={`font-medium ${calculateLucroPrejuizoPorcentagem(opcao).includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                                          {calculateLucroPrejuizoPorcentagem(opcao)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Botões de Ação */}
                                <div className="flex justify-end space-x-2 pt-4 border-t">
                                  <button
                                    className="p-4 hover:bg-gray-100 rounded-full transition flex items-center gap-2"
                                    onClick={() => handleEdit(opcao)}
                                  >
                                    <FileTextIcon size={18} />
                                    <span className="hidden sm:inline text-sm">Editar opção</span>
                                  </button>
                                  <button
                                    className="p-4 hover:bg-gray-100 rounded-full transition flex items-center gap-2"
                                    onClick={() => handleEditEncerramento(opcao)}
                                  >
                                    <Edit size={18} />
                                    <span className="hidden sm:inline text-sm">Editar encerramento</span>
                                  </button>
                                  <button
                                    className="p-4 text-red-600 hover:bg-red-600 hover:text-white rounded-full transition flex items-center gap-2"
                                    onClick={() => handleDelete(opcao)}
                                  >
                                    <Trash2 size={18} />
                                    <span className="hidden sm:inline text-sm">Deletar</span>
                                  </button>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <EncerrarOpcaoModal
        opcao={selectedOpcao}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedOpcao(null);
        }}
        onConfirm={handleConfirmEncerrar}
      />

      <EditarOpcaoModal
        opcao={selectedOpcao}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedOpcao(null);
        }}
        onConfirm={handleConfirmEdit}
      />

      <DeleteOpcaoModal
        opcao={selectedOpcao}
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedOpcao(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <EditarEncerramentoModal
        venda={selectedVenda}
        operacao={(selectedOpcao?.operacao || 'venda') as 'compra' | 'venda'}
        isOpen={editEncerramentoModalOpen}
        onClose={() => {
          setEditEncerramentoModalOpen(false);
          setSelectedOpcao(null);
          setSelectedVenda(null);
        }}
        onConfirm={handleConfirmEditEncerramento}
      />

      <EncerrarTravaModal
        strategy={selectedStrategy}
        isOpen={travaModalOpen}
        onClose={() => {
          setTravaModalOpen(false);
          setSelectedStrategy(null);
        }}
        onConfirm={handleConfirmEncerrarTrava}
      />

      <EditarTravaModal
        strategy={selectedStrategy}
        isOpen={editTravaModalOpen}
        onClose={() => {
          setEditTravaModalOpen(false);
          setSelectedStrategy(null);
        }}
        onConfirm={handleConfirmEditTrava}
      />

      <DeleteTravaModal
        strategy={selectedStrategy}
        isOpen={deleteTravaModalOpen}
        onClose={() => {
          setDeleteTravaModalOpen(false);
          setSelectedStrategy(null);
        }}
        onConfirm={handleConfirmDeleteTrava}
      />
    </div>
  );
}

function CardOpcao({ opcao, isHighlighted, onEncerrar, onEditar, onDeletar, calculateDiferencaPercentual, calculateGanhoMaximo, calculateRentabilidadeMaxima, formatCurrency, formatDate }) {
  const [expandido, setExpandido] = useState(false);
  return (
    <div
      className={`relative bg-white rounded-2xl border 
      ${isHighlighted ? 'border-brand-blue-dark ring-2 ring-brand-blue-dark/20' : 'border-border'}
      transition-all duration-300 flex flex-col
      ${expandido ? 'min-h-[250px] py-7' : 'min-h-[100px] py-7 '}
      px-5
    `}
      data-opcao-id={opcao.ops_id}
    >
      {/* Header e controles */}
      <div className="flex items-center justify-between">
        <span className="font-bold text-base text-black">{opcao.opcao}</span>
        <div className="flex space-x-2 items-center">
          {/* Tag Operação */}
          <span
            className={`text-xs font-semibold px-4 py-0.5 rounded-full 
              ${opcao.operacao === 'compra' ? 'bg-buy text-buy-foreground' : ''}
              ${opcao.operacao === 'venda' ? 'bg-sell text-sell-foreground' : ''}
            `}
          >
            {opcao.operacao === 'compra' ? 'Compra' : 'Venda'}
          </span>
          {/* Tag Tipo */}
          <span
            className={`text-xs font-semibold px-4 py-0.5 rounded-full 
              ${opcao.tipo === 'put' ? 'bg-neutral-bg text-foreground' : ''}
              ${opcao.tipo === 'call' ? 'bg-neutral-bg text-foreground' : ''}
            `}
          >
            {opcao.tipo ? (opcao.tipo.charAt(0).toUpperCase() + opcao.tipo.slice(1)) : '-'}
          </span>
          <button type="button" className="ml-2 p-1 rounded-full hover:bg-muted transition" onClick={() => setExpandido(e => !e)}>
            {expandido ? (
              <ChevronUp size={22} />
            ) : (
              <ChevronDown size={22} />
            )}
          </button>
        </div>
      </div>
      {/* Infos principais - espaçamento compacto fechado, flexível aberto */}
      <div className="flex justify-between mt-5 mb-3">
        {/* Bloco Strike */}
        <div className="flex flex-col items-center min-w-0">
          <span className="text-[10px] uppercase text-gray-500 font-bold pb-0.5">Strike</span>
          <span className="font-semibold text-xs">{opcao.strike ? formatCurrency(opcao.strike).replace(/^R\$\s*/, 'R$ ') : '-'}</span>
        </div>
        <div className="w-px bg-border mx-2 self-stretch" />
        {/* Bloco Prêmio */}
        <div className="flex flex-col items-center min-w-0">
          <span className="text-[10px] uppercase text-gray-500 font-bold pb-0.5">Prêmio</span>
          <span className="font-semibold text-xs">{opcao.premio ? formatCurrency(opcao.premio).replace(/^R\$\s*/, 'R$ ') : '-'}</span>
        </div>
        <div className="w-px bg-border mx-2 self-stretch" />
        {/* Bloco Qnt */}
        <div className="flex flex-col items-center min-w-0">
          <span className="text-[10px] uppercase text-gray-500 font-bold pb-0.5">Qnt</span>
          <span className="font-semibold text-xs">{formatQuantidade(opcao.quantidade)}</span>
        </div>
        <div className="w-px bg-border mx-2 self-stretch" />
        {/* Bloco Validade */}
        <div className="flex flex-col items-center min-w-0">
          <span className="text-[10px] uppercase text-gray-500 font-bold pb-0.5">Validade</span>
          <span className="font-semibold text-xs">{opcao.data ? formatDate(opcao.data) : '-'}</span>
        </div>
      </div>
      {/* LINHA PONTILHADA → SEMPRE VISÍVEL */}
      <div className="mt-4 border-t-2 border-dashed border-dotted border-gray-400 pt-4 flex flex-col">
      </div>

      {/* Detalhes - exibidos apenas quando expandido */}
      {expandido && (
        <div className="flex flex-col gap-3">
          {opcao.acao && opcao.acao.length >= 5 && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-sm text-gray-500 font-regular">Ação</span>
              <span className="font-semibold text-sm">{opcao.acao}</span>
            </div>
          )}
          {!!opcao.cotacao && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-sm text-gray-500 font-regular">Cotação</span>
              <span className="text-sm font-bold">{formatCurrency(opcao.cotacao)}</span>
            </div>
          )}
          {!!opcao.cotacao && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-sm text-gray-500 font-regular">% Diferença</span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-50 text-green-600 border border-green-200 ml-1">{calculateDiferencaPercentual(opcao)}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-xs">
            <span className="text-sm text-gray-500 font-regular">
              {calculateGanhoMaximo(opcao) < 0 ? 'Perda máxima' : 'Lucro máximo'}
            </span>
            <span className="text-sm font-semibold">{calculateGanhoMaximo(opcao) !== 0 ? formatCurrency(calculateGanhoMaximo(opcao)) : '-'}</span>
          </div>
          {calculateRentabilidadeMaxima(opcao) !== '-' && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-sm text-gray-500 font-regular">Rentab. máx.</span>
              <span className="text-sm font-semibold">{calculateRentabilidadeMaxima(opcao)}</span>
            </div>
          )}
        </div>
      )}
      {/* Rodapé ações */}
      <div className={`flex items-center justify-between ${expandido ? 'mt-6' : 'mt-2'} pt-2 gap-2`}>
        <Button
          className="bg-brand-blue-dark text-white text-sm font-semibold rounded-full px-5 py-2 transition whitespace-nowrap border-0 shadow-none"
          onClick={() => onEncerrar(opcao)}
        >
          Encerrar opção
        </Button>
        <div className="flex space-x-1">
          <button className="p-4 hover:bg-gray-100 rounded-full transition" onClick={() => onEditar(opcao)}><Edit size={18} /></button>
          <button className="p-4 text-red-600 hover:bg-red-600 hover:text-white rounded-full transition" onClick={() => onDeletar(opcao)}><Trash2 size={18} /></button>
        </div>
      </div>
    </div>
  );
}