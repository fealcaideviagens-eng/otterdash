import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Opcao, Venda } from "@/types/database";

// Adapter functions para mapear entre formatos antigo e novo
const mapOpsRegistryToOpcao = (data: any): Opcao => ({
  // Novos campos
  ops_id: data.ops_id,
  id: data.id,
  ops_ticker: data.ops_ticker,
  ops_operacao: data.ops_operacao,
  ops_tipo: data.ops_tipo,
  ops_acao: data.ops_acao,
  ops_strike: data.ops_strike,
  acao_cotacao: data.acao_cotacao,
  ops_quanti: data.ops_quanti,
  ops_premio: data.ops_premio,
  ops_vencimento: data.ops_vencimento,
  ops_criado_em: data.ops_criado_em,
  
  // Mapeamento para campos antigos (compatibilidade)
  opcao: data.ops_ticker || '',
  operacao: data.ops_operacao || '',
  tipo: data.ops_tipo,
  acao: data.ops_acao,
  strike: data.ops_strike,
  cotacao: data.acao_cotacao,
  quantidade: data.ops_quanti,
  premio: data.ops_premio,
  data: data.ops_vencimento,
  status: 'aberta', // Status padrão
  user_id: data.user_id
});

const mapOpsCompletedToVenda = (data: any): Venda => ({
  // Novos campos
  completed_id: data.completed_id,
  completed_premio: data.completed_premio,
  completed_data: data.completed_data,
  completed_quanti: data.completed_quanti,
  completed_criado_em: data.completed_criado_em,
  ops_id: data.ops_id,
  
  // Mapeamento para campos antigos (compatibilidade)
  "update-id": data.completed_id,
  premio: data.completed_premio,
  encerramento: data.completed_data,
  quantidade: data.completed_quanti,
  created_at: data.completed_criado_em,
  opcao_id: data.ops_id
});

export const useOpcoes = (userId?: string) => {
  const [opcoes, setOpcoes] = useState<Opcao[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarOpcoes = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('ops_registry')
        .select('*')
        .eq('user_id', userId)
        .order('ops_criado_em', { ascending: false });
        
      if (error) throw error;
      
      const opcoesFormatadas = (data || []).map(mapOpsRegistryToOpcao);
      setOpcoes(opcoesFormatadas);
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
      const { data, error } = await supabase
        .from('ops_completed')
        .select('*')
        .eq('user_id', userId)
        .order('completed_criado_em', { ascending: false });
        
      if (error) throw error;
      
      const vendasFormatadas = (data || []).map(mapOpsCompletedToVenda);
      setVendas(vendasFormatadas);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      setVendas([]);
    }
  };

  const adicionarOpcao = async (dadosOpcao: any) => {
    if (!userId) throw new Error('Usuário não autenticado');
    
    try {
      console.log('Dados recebidos para adicionar:', dadosOpcao);
      console.log('User ID:', userId);
      
      // Mapear dados antigos para o novo formato
      const novoFormatoOpcao = {
        user_id: userId, // Campo para RLS
        ops_ticker: dadosOpcao.opcao,
        ops_operacao: dadosOpcao.operacao,
        ops_tipo: dadosOpcao.tipo,
        ops_acao: dadosOpcao.acao,
        ops_strike: dadosOpcao.strike ? parseFloat(dadosOpcao.strike.toString()) : null,
        acao_cotacao: dadosOpcao.cotacao ? parseFloat(dadosOpcao.cotacao.toString()) : null,
        ops_quanti: dadosOpcao.quantidade ? parseFloat(dadosOpcao.quantidade.toString()) : null,
        ops_premio: dadosOpcao.premio ? parseFloat(dadosOpcao.premio.toString()) : null,
        ops_vencimento: dadosOpcao.data,
        ops_criado_em: new Date().toISOString()
      };
      
      console.log('Dados formatados para inserir:', novoFormatoOpcao);

      const { data, error } = await supabase
        .from('ops_registry')
        .insert([novoFormatoOpcao])
        .select();

      console.log('Resposta do Supabase:', { data, error });

      if (error) throw error;
      
      console.log('Opção cadastrada com sucesso:', data);
      await carregarOpcoes();
      return data;
    } catch (error) {
      console.error('Erro ao adicionar opção:', error);
      throw error;
    }
  };

  const editarOpcao = async (opcaoId: string, dadosAtualizados: any) => {
    if (!userId) throw new Error('Usuário não autenticado');
    
    try {
      // Mapear dados antigos para o novo formato
      const dadosFormatados = {
        ops_ticker: dadosAtualizados.opcao,
        ops_operacao: dadosAtualizados.operacao,
        ops_tipo: dadosAtualizados.tipo,
        ops_acao: dadosAtualizados.acao,
        ops_strike: dadosAtualizados.strike,
        acao_cotacao: dadosAtualizados.cotacao,
        ops_quanti: dadosAtualizados.quantidade,
        ops_premio: dadosAtualizados.premio,
        ops_vencimento: dadosAtualizados.data
      };

      const { error } = await supabase
        .from('ops_registry')
        .update(dadosFormatados)
        .eq('ops_id', opcaoId)
        .eq('user_id', userId);

      if (error) throw error;
      
      await carregarOpcoes();
    } catch (error) {
      console.error('Erro ao editar:', error);
      throw error;
    }
  };

  const deletarOpcao = async (opcaoId: string) => {
    if (!userId) throw new Error('Usuário não autenticado');
    
    try {
      const { error } = await supabase
        .from('ops_registry')
        .delete()
        .eq('ops_id', opcaoId)
        .eq('user_id', userId);

      if (error) throw error;
      
      await carregarOpcoes();
    } catch (error) {
      console.error('Erro ao deletar opção:', error);
      throw error;
    }
  };

  const encerrarOpcao = async (opcaoId: string, vendaData: any) => {
    if (!userId) throw new Error('Usuário não autenticado');
    
    try {
      // Inserir dados no ops_completed
      const dadosEncerramento = {
        ops_id: opcaoId,
        user_id: userId,
        completed_premio: vendaData.premio,
        completed_data: vendaData.encerramento,
        completed_quanti: vendaData.quantidade,
        completed_criado_em: new Date().toISOString()
      };

      const { error } = await supabase
        .from('ops_completed')
        .insert([dadosEncerramento]);

      if (error) throw error;
      
      await carregarOpcoes();
      await carregarVendas();
    } catch (error) {
      console.error('Erro ao encerrar opção:', error);
      throw error;
    }
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