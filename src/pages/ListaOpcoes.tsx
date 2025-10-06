import { useState } from "react";
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
import { DeleteOpcaoModal } from "@/components/opcoes/DeleteOpcaoModal";
import { useOpcoes } from "@/hooks/useOpcoes";
import { useAuth } from "@/context/AuthContext";
import { Opcao } from "@/types/database";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { Edit, Trash2 } from "lucide-react";

export default function ListaOpcoes() {
  const { user } = useAuth();
  const { opcoes, vendas, loading, encerrarOpcao, editarOpcao, deletarOpcao, refreshData } = useOpcoes(user?.id || '');
  const [selectedOpcao, setSelectedOpcao] = useState<Opcao | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Ordenar opções abertas por data de validade (mais próxima da data atual primeiro)
  const opcoesAbertas = opcoes
    .filter(opcao => opcao.status === 'aberta')
    .sort((a, b) => {
      if (!a.data || !b.data) return 0;
      const today = new Date();
      const dateA = new Date(a.data);
      const dateB = new Date(b.data);
      
      // Calcular diferença em dias da data atual
      const diffA = Math.abs(dateA.getTime() - today.getTime());
      const diffB = Math.abs(dateB.getTime() - today.getTime());
      
      return diffA - diffB; // Ordenar da menor diferença (mais próxima) para maior
    });
  
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
    
    // Diferença entre prêmio inicial e novo prêmio
    return opcao.premio - venda.premio;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Carregando opções...</div>
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
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhuma opção cadastrada ainda.
              </p>
            </div>
          ) : (
            <Tabs defaultValue="abertas" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="abertas" className="data-[state=active]:text-white text-black">Abertas ({opcoesAbertas.length})</TabsTrigger>
                <TabsTrigger value="finalizadas" className="data-[state=active]:text-white text-black">Finalizadas ({opcoesFinalizadas.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="abertas" className="mt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">{/* Remove hover do header */}
                        <TableHead className="text-black font-semibold">Opção</TableHead>
                        <TableHead className="text-black font-semibold">Operação</TableHead>
                        <TableHead className="text-black font-semibold">Tipo</TableHead>
                        <TableHead className="text-black font-semibold">Ação</TableHead>
                        <TableHead className="text-black font-semibold">Strike</TableHead>
                        <TableHead className="text-black font-semibold">Cotação</TableHead>
                        <TableHead className="text-black font-semibold">Diferença</TableHead>
                        <TableHead className="text-black font-semibold">Quantidade</TableHead>
                        <TableHead className="text-black font-semibold">Prêmio</TableHead>
                        <TableHead className="text-black font-semibold">Ganho/Perda máxima</TableHead>
                        <TableHead className="text-black font-semibold">Rentabilidade máxima</TableHead>
                        <TableHead className="text-black font-semibold">Validade</TableHead>
                        <TableHead className="text-black font-semibold">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {opcoesAbertas.map((opcao, index) => (
                        <TableRow key={`${opcao.opcao}-${index}`}>
                          <TableCell className="font-medium">{opcao.opcao}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={opcao.operacao === 'compra' ? 'default' : 'destructive'}
                              className={opcao.operacao === 'compra' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                            >
                              {opcao.operacao?.charAt(0).toUpperCase() + opcao.operacao?.slice(1) || '-'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {opcao.tipo ? (
                              <Badge 
                                variant={opcao.tipo === 'put' ? 'secondary' : 'outline'}
                                className={opcao.tipo === 'put' ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-0' : ''}
                              >
                                {opcao.tipo.charAt(0).toUpperCase() + opcao.tipo.slice(1)}
                              </Badge>
                            ) : '-'}
                          </TableCell>
                          <TableCell>{opcao.acao || '-'}</TableCell>
                          <TableCell>
                            {opcao.strike ? formatCurrency(opcao.strike) : '-'}
                          </TableCell>
                          <TableCell>
                            {opcao.cotacao ? formatCurrency(opcao.cotacao) : '-'}
                          </TableCell>
                          <TableCell>
                            {calculateDiferencaPercentual(opcao)}
                          </TableCell>
                          <TableCell>{opcao.quantidade ? (opcao.operacao === 'venda' ? `-${opcao.quantidade}` : opcao.quantidade) : '-'}</TableCell>
                          <TableCell>
                            {opcao.premio ? formatCurrency(opcao.premio) : '-'}
                          </TableCell>
                          <TableCell>
                            {calculateGanhoMaximo(opcao) !== 0 ? formatCurrency(calculateGanhoMaximo(opcao)) : '-'}
                          </TableCell>
                          <TableCell>
                            {calculateRentabilidadeMaxima(opcao)}
                          </TableCell>
                          <TableCell>
                            {opcao.data ? formatDate(opcao.data) : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEncerrar(opcao)}
                              >
                                Encerrar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(opcao)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(opcao)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="finalizadas" className="mt-4">
                <div className="space-y-6">
                  {groupOpcoesFinalizadasByMonth().map((monthGroup) => (
                    <div key={monthGroup.key} className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                        {monthGroup.monthName}
                      </h3>
                      <Accordion type="multiple" className="w-full">
                        {monthGroup.opcoes.map((opcao, index) => {
                          const venda = vendas.find(v => v.ops_id === opcao.ops_id);
                          return (
                            <AccordionItem key={`${opcao.opcao}-${index}`} value={`${monthGroup.key}-item-${index}`}>
                              <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-4">
                                  <div className="flex items-center space-x-4">
                                    <span className="font-medium">{opcao.opcao}</span>
                                    <Badge 
                                      variant={opcao.operacao === 'compra' ? 'default' : 'destructive'}
                                      className={opcao.operacao === 'compra' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                                    >
                                      {opcao.operacao?.charAt(0).toUpperCase() + opcao.operacao?.slice(1) || '-'}
                                    </Badge>
                                    {opcao.tipo && (
                                      <Badge 
                                        variant={opcao.tipo === 'put' ? 'secondary' : 'outline'}
                                        className={opcao.tipo === 'put' ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-0' : ''}
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
                                  {/* Dados da Operação Original */}
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-base border-b pb-2">Dados da Operação</h4>
                                    <div className="space-y-3">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Ação:</span>
                                        <span className="font-medium">{opcao.acao || '-'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Strike:</span>
                                        <span className="font-medium">{opcao.strike ? formatCurrency(opcao.strike) : '-'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Cotação no cadastro:</span>
                                        <span className="font-medium">{opcao.cotacao ? formatCurrency(opcao.cotacao) : '-'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Quantidade:</span>
                                        <span className="font-medium">{opcao.quantidade ? (opcao.operacao === 'venda' ? `-${opcao.quantidade}` : opcao.quantidade) : '-'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Prêmio inicial:</span>
                                        <span className="font-medium">{opcao.premio ? formatCurrency(opcao.premio) : '-'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Data de abertura:</span>
                                        <span className="font-medium">{opcao.data ? formatDate(opcao.data) : '-'}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Dados do Encerramento */}
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-base border-b pb-2">Dados do Encerramento</h4>
                                    <div className="space-y-3">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Prêmio final:</span>
                                        <span className="font-medium">{venda?.premio !== undefined ? formatCurrency(venda.premio) : '-'}</span>
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
    </div>
  );
}