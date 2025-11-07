import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Opcao, Venda } from "@/types/database";

// Adapter functions para mapear entre formatos antigo e novo
const mapOpsRegistryToOpcao = (data: any): Opcao => ({
  // Novos campos
  ops_id: data.ops_id,
  id: data.user_id, // Usar user_id para o campo id
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
  status: data.status || 'aberta', // Status baseado nos dados ou padrão
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
      console.log('useOpcoes: userId não fornecido');
      setLoading(false);
      return;
    }
    
    console.log('useOpcoes: Carregando opções para userId:', userId);
    
    try {
      // Buscar opções
      const { data: opcoesData, error: opcoesError } = await supabase
        .from('ops_registry')
        .select('*')
        .eq('user_id', userId)
        .order('ops_criado_em', { ascending: false });
        
      if (opcoesError) throw opcoesError;
      
      // Buscar vendas/encerramentos
      const { data: vendasData, error: vendasError } = await supabase
        .from('ops_completed')
        .select('*')
        .eq('user_id', userId);
        
      if (vendasError) throw vendasError;
      
      console.log('useOpcoes: Resposta do supabase:', { opcoes: opcoesData, vendas: vendasData });
      
      // Mapear opções com status correto
      const opcoesFormatadas = (opcoesData || []).map(opcaoData => {
        const temVenda = vendasData?.some(venda => venda.ops_id === opcaoData.ops_id);
        return mapOpsRegistryToOpcao({
          ...opcaoData,
          status: temVenda ? 'encerrada' : 'aberta'
        });
      });
      
      console.log('useOpcoes: Opções formatadas:', opcoesFormatadas);
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
      // Primeiro deletar o encerramento se existir
      await supabase
        .from('ops_completed')
        .delete()
        .eq('ops_id', opcaoId)
        .eq('user_id', userId);

      // Depois deletar a opção
      const { error } = await supabase
        .from('ops_registry')
        .delete()
        .eq('ops_id', opcaoId)
        .eq('user_id', userId);

      if (error) throw error;
      
      await carregarOpcoes();
      await carregarVendas();
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
        completed_data: vendaData.data || vendaData.encerramento,
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

  const editarEncerramento = async (completedId: string, dadosAtualizados: any) => {
    if (!userId) throw new Error('Usuário não autenticado');
    
    try {
      const dadosFormatados = {
        completed_premio: dadosAtualizados.premio,
        completed_data: dadosAtualizados.data,
        completed_quanti: dadosAtualizados.quantidade,
      };

      const { error } = await supabase
        .from('ops_completed')
        .update(dadosFormatados)
        .eq('completed_id', completedId)
        .eq('user_id', userId);

      if (error) throw error;
      
      await carregarOpcoes();
      await carregarVendas();
    } catch (error) {
      console.error('Erro ao editar encerramento:', error);
      throw error;
    }
  };

  const getDashboardMetrics = () => {
    const opcoesAbertas = opcoes.filter(opcao => opcao.status === 'aberta').length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Filtrar vendas do mês atual com correção de fuso horário
    const vendasMes = vendas.filter(venda => {
      let vendaDate: Date;
      if (venda.encerramento.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = venda.encerramento.split('-').map(Number);
        vendaDate = new Date(year, month - 1, day);
      } else {
        vendaDate = new Date(venda.encerramento);
      }
      return vendaDate.getMonth() === currentMonth && vendaDate.getFullYear() === currentYear;
    });
    
    // Calcular valor ganho no mês usando a mesma lógica das outras páginas
    const valorGanhoMes = vendasMes.reduce((total, venda) => {
      const opcaoOriginal = opcoes.find(opcao => opcao.ops_id === venda.ops_id);
      if (opcaoOriginal?.ops_premio && opcaoOriginal?.ops_quanti) {
        // Valor inicial: Quantidade * Prêmio inicial
        const valorInicial = opcaoOriginal.ops_quanti * opcaoOriginal.ops_premio;
        
        // Valor final: Quantidade * Novo prêmio (do encerramento)  
        const valorFinal = venda.completed_quanti * venda.completed_premio;
        
        // Para vendas: lucro = valor inicial - valor final
        // Para compras: lucro = valor final - valor inicial
        const resultado = opcaoOriginal.ops_operacao === 'venda' ? valorInicial - valorFinal : valorFinal - valorInicial;
        return total + resultado;
      }
      return total;
    }, 0);
    
    const lucroMaximoEstimado = opcoes
      .filter(opcao => opcao.status === 'aberta')
      .reduce((total, opcao) => {
        if (!opcao.ops_quanti || !opcao.ops_premio) return total;
        const ganho = opcao.ops_quanti * opcao.ops_premio;
        // Para operações de compra, o ganho máximo é negativo (subtrai do total)
        return opcao.ops_operacao === 'compra' ? total - ganho : total + ganho;
      }, 0);

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
    editarEncerramento,
    getDashboardMetrics,
    refreshData
  };
};