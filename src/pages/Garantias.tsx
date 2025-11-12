import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGarantias } from "@/hooks/useGarantias";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, TrendingUp, Landmark, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatCurrency, parseCurrencyToNumber } from "@/utils/inputFormatters";
import { Garantia } from "@/types/garantia";
import { EditarAcaoModal } from "@/components/garantias/EditarAcaoModal";
import { EditarRendaFixaModal } from "@/components/garantias/EditarRendaFixaModal";
import { DeleteGarantiaModal } from "@/components/garantias/DeleteGarantiaModal";
export default function Garantias() {
  const {
    user
  } = useAuth();
  const {
    garantias,
    loading,
    adicionarGarantia,
    editarGarantia,
    deletarGarantia
  } = useGarantias({
    userId: user?.id
  });

  // Estados do formulário de ações
  const [ticker, setTicker] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const tickerInputRef = useRef<HTMLInputElement>(null);

  // Estados do formulário de renda fixa
  const [tipoRendaFixa, setTipoRendaFixa] = useState<"tesouro_selic" | "caixa">("tesouro_selic");
  const [valorReais, setValorReais] = useState("");

  // Estados dos modais
  const [editarAcaoModal, setEditarAcaoModal] = useState<Garantia | null>(null);
  const [editarRendaFixaModal, setEditarRendaFixaModal] = useState<Garantia | null>(null);
  const [deleteModal, setDeleteModal] = useState<Garantia | null>(null);

  // Estados de ordenação
  const [sortTickerOrder, setSortTickerOrder] = useState<'asc' | 'desc' | null>(null);
  const [sortQuantidadeOrder, setSortQuantidadeOrder] = useState<'asc' | 'desc' | null>(null);
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setValorReais(formatted);
  };
  const handleAdicionarAcao = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar ticker (4 letras + 1-2 números)
    const tickerRegex = /^[A-Z]{4}\d{1,2}$/i;
    if (!tickerRegex.test(ticker)) {
      toast.error("Ticker inválido. Use 4 letras seguidas de 1 ou 2 números.");
      return;
    }
    try {
      await adicionarGarantia({
        tipo: 'acao',
        ticker: ticker.toUpperCase(),
        quantidade: parseFloat(quantidade)
      });
      toast.success("Ação cadastrada com sucesso!");
      setTicker("");
      setQuantidade("");
      // Focar no campo Ticker após cadastro
      setTimeout(() => {
        tickerInputRef.current?.focus();
      }, 0);
    } catch (error) {
      toast.error("Erro ao cadastrar ação");
    }
  };
  const handleAdicionarRendaFixa = async (e: React.FormEvent) => {
    e.preventDefault();
    const valor = parseCurrencyToNumber(valorReais);
    if (valor < 0) {
      toast.error("O valor não pode ser negativo");
      return;
    }
    try {
      await adicionarGarantia({
        tipo: 'renda_fixa',
        tipo_renda_fixa: tipoRendaFixa,
        valor_reais: valor
      });
      toast.success("Renda fixa cadastrada com sucesso!");
      setValorReais("");
    } catch (error) {
      toast.error("Erro ao cadastrar renda fixa");
    }
  };
  const handleDelete = async (garantia: Garantia) => {
    try {
      await deletarGarantia(garantia.garantia_id);
      toast.success("Garantia excluída com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir garantia");
    }
  };
  const handleSortTicker = () => {
    if (sortTickerOrder === 'asc') {
      setSortTickerOrder('desc');
    } else {
      setSortTickerOrder('asc');
    }
    setSortQuantidadeOrder(null);
  };
  const handleSortQuantidade = () => {
    if (sortQuantidadeOrder === 'asc') {
      setSortQuantidadeOrder('desc');
    } else {
      setSortQuantidadeOrder('asc');
    }
    setSortTickerOrder(null);
  };
  let acoes = garantias.filter(g => g.tipo === 'acao');
  const rendasFixas = garantias.filter(g => g.tipo === 'renda_fixa');

  // Aplicar ordenação
  if (sortTickerOrder) {
    acoes = [...acoes].sort((a, b) => {
      const tickerA = a.ticker || '';
      const tickerB = b.ticker || '';
      if (sortTickerOrder === 'asc') {
        return tickerA.localeCompare(tickerB);
      } else {
        return tickerB.localeCompare(tickerA);
      }
    });
  } else if (sortQuantidadeOrder) {
    acoes = [...acoes].sort((a, b) => {
      const qtdA = a.quantidade || 0;
      const qtdB = b.quantidade || 0;
      if (sortQuantidadeOrder === 'asc') {
        return qtdA - qtdB;
      } else {
        return qtdB - qtdA;
      }
    });
  }
  if (loading) {
    return <div className="container mx-auto p-6">Carregando...</div>;
  }
  return <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Garantias</h1>
        <p className="text-muted-foreground">
          Gerencie suas garantias em ações e renda fixa
        </p>
      </div>

      <Tabs defaultValue="acoes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="acoes">
            <TrendingUp className="mr-2 h-4 w-4" />
            Ações
          </TabsTrigger>
          <TabsTrigger value="renda-fixa">
            <Landmark className="mr-2 h-4 w-4" />
            Renda Fixa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="acoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cadastrar Ação</CardTitle>
              <CardDescription>
                Adicione ações que fazem parte das suas garantias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdicionarAcao} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ticker">Ticker</Label>
                    <Input id="ticker" ref={tickerInputRef} value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} placeholder="Ex: PETR4" maxLength={6} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input id="quantidade" type="number" value={quantidade} onChange={e => setQuantidade(e.target.value)} placeholder="100" step="1" min="0" required />
                  </div>
                </div>
                <Button type="submit" className="text-[590051] bg-[#61055d] text-white">Cadastrar Ação</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
              {acoes.length === 0 ? <p className="text-muted-foreground text-center py-8">
                  Nenhuma ação cadastrada
                </p> : <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button variant="ghost" onClick={handleSortTicker} className="h-8 px-2 lg:px-3">
                          Ticker
                          {sortTickerOrder === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : sortTickerOrder === 'desc' ? <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUpDown className="ml-2 h-4 w-4" />}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" onClick={handleSortQuantidade} className="h-8 px-2 lg:px-3">
                          Quantidade
                          {sortQuantidadeOrder === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : sortQuantidadeOrder === 'desc' ? <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUpDown className="ml-2 h-4 w-4" />}
                        </Button>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {acoes.map(acao => <TableRow key={acao.garantia_id}>
                        <TableCell className="font-medium">{acao.ticker}</TableCell>
                        <TableCell>{acao.quantidade}</TableCell>
                        <TableCell>
                          <Badge variant={acao.status?.includes('Em garantia') ? 'default' : 'secondary'}>
                            {acao.status || 'Livre'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" onClick={() => setEditarAcaoModal(acao)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => setDeleteModal(acao)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="renda-fixa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cadastrar Renda Fixa</CardTitle>
              <CardDescription>
                Adicione investimentos de renda fixa que fazem parte das suas garantias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdicionarRendaFixa} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select value={tipoRendaFixa} onValueChange={(value: "tesouro_selic" | "caixa") => setTipoRendaFixa(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tesouro_selic">Tesouro Selic</SelectItem>
                        <SelectItem value="caixa">Caixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor (R$)</Label>
                    <Input id="valor" value={valorReais} onChange={handleCurrencyChange} placeholder="0,00" required />
                  </div>
                </div>
                <Button type="submit">Cadastrar Renda Fixa</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rendas Fixas Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
              {rendasFixas.length === 0 ? <p className="text-muted-foreground text-center py-8">
                  Nenhuma renda fixa cadastrada
                </p> : <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor em investimento</TableHead>
                      <TableHead>Em garantia</TableHead>
                      <TableHead>Livre</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rendasFixas.map(rf => <TableRow key={rf.garantia_id}>
                        <TableCell className="font-medium">
                          {rf.tipo_renda_fixa === 'tesouro_selic' ? 'Tesouro Selic' : 'Caixa'}
                        </TableCell>
                        <TableCell>
                          R$ {rf.valor_reais?.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                        </TableCell>
                        <TableCell>
                          R$ {rf.valorEmGarantia?.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }) || '0,00'}
                        </TableCell>
                        <TableCell>
                          R$ {rf.valorLivre?.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }) || '0,00'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" onClick={() => setEditarRendaFixaModal(rf)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => setDeleteModal(rf)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditarAcaoModal garantia={editarAcaoModal} isOpen={!!editarAcaoModal} onClose={() => setEditarAcaoModal(null)} onSalvar={editarGarantia} />

      <EditarRendaFixaModal garantia={editarRendaFixaModal} isOpen={!!editarRendaFixaModal} onClose={() => setEditarRendaFixaModal(null)} onSalvar={editarGarantia} />

      <DeleteGarantiaModal garantia={deleteModal} isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} onConfirm={() => deleteModal && handleDelete(deleteModal)} />
    </div>;
}