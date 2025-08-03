import { useState, useEffect } from "react";

export const useOpcoes = (userId?: string) => {
  const [opcoes, setOpcoes] = useState<any[]>([]);
  const [vendas, setVendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarOpcoes = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      // Mock data para teste - substitua pela implementação real do Supabase
      console.log('Carregando opções para userId:', userId);
      setOpcoes([]);
    } catch (error) {
      console.error('Erro ao buscar opções:', error);
      setOpcoes([]);
    } finally {
      setLoading(false);
    }
  };

  const carregarVendas = async () => {
    if (!userId) return;
    
    try {
      // Mock data para teste - substitua pela implementação real do Supabase
      console.log('Carregando vendas para userId:', userId);
      setVendas([]);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      setVendas([]);
    }
  };

  const adicionarOpcao = async (dadosOpcao: any) => {
    if (!userId) throw new Error('Usuário não autenticado');
    
    try {
      // Mock implementation - substitua pela implementação real do Supabase
      console.log('Adicionando opção:', dadosOpcao, 'para userId:', userId);
      await carregarOpcoes();
      return [dadosOpcao];
    } catch (error) {
      console.error('Erro ao adicionar opção:', error);
      throw error;
    }
  };

  const editarOpcao = async (opcaoId: string, dadosAtualizados: any) => {
    if (!userId) throw new Error('Usuário não autenticado');
    
    try {
      console.log('Editando opção:', opcaoId, dadosAtualizados);
      await carregarOpcoes();
    } catch (error) {
      console.error('Erro ao editar:', error);
      throw error;
    }
  };

  const deletarOpcao = async (opcaoId: string) => {
    if (!userId) throw new Error('Usuário não autenticado');
    
    console.log('Deletando opção:', opcaoId);
    await carregarOpcoes();
  };

  const encerrarOpcao = async (opcaoId: string, vendaData: any) => {
    if (!userId) throw new Error('Usuário não autenticado');
    
    console.log('Encerrando opção:', opcaoId, vendaData);
    
    await carregarOpcoes();
    await carregarVendas();
  };

  const getDashboardMetrics = () => {
    const opcoesAbertas = opcoes.filter(opcao => opcao.status === 'aberta').length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const vendasMes = vendas.filter(venda => {
      const vendaDate = new Date(venda.encerramento);
      return vendaDate.getMonth() === currentMonth && vendaDate.getFullYear() === currentYear;
    });
    
    const valorGanhoMes = vendasMes.reduce((total, venda) => {
      const opcaoOriginal = opcoes.find(opcao => opcao.opcao === venda.opcao_id);
      if (opcaoOriginal?.premio && venda.premio) {
        return total + (opcaoOriginal.premio - venda.premio) * venda.quantidade;
      }
      return total;
    }, 0);
    
    const lucroMaximoEstimado = opcoes
      .filter(opcao => opcao.status === 'aberta')
      .reduce((total, opcao) => total + (opcao.premio || 0) * (opcao.quantidade || 0), 0);

    return { opcoesAbertas, valorGanhoMes, lucroMaximoEstimado };
  };

  const refreshData = async () => {
    await carregarOpcoes();
    await carregarVendas();
  };

  useEffect(() => {
    if (userId) {
      carregarOpcoes();
      carregarVendas();
    } else {
      setLoading(false);
    }
  }, [userId]);

  return {
    opcoes, 
    vendas, 
    loading, 
    addOpcao: adicionarOpcao, 
    editarOpcao, 
    deletarOpcao, 
    encerrarOpcao, 
    getDashboardMetrics,
    refreshData
  };
};