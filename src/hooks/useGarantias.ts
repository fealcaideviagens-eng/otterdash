import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Garantia } from "@/types/garantia";

interface UseGarantiasProps {
  userId?: string;
}

export const useGarantias = (props?: UseGarantiasProps) => {
  const [garantias, setGarantias] = useState<Garantia[]>([]);
  const [loading, setLoading] = useState(true);

  const calcularStatusGarantias = async (): Promise<Map<string, number>> => {
    if (!props?.userId) return new Map();
    
    try {
      // Buscar todas as opções do usuário
      const { data: opcoesData, error: opcoesError } = await supabase
        .from('ops_registry')
        .select('*')
        .eq('user_id', props.userId);
      
      if (opcoesError) throw opcoesError;
      
      // Buscar todos os encerramentos
      const { data: completedData, error: completedError } = await supabase
        .from('ops_completed')
        .select('*')
        .eq('user_id', props.userId);
      
      if (completedError) throw completedError;
      
      // Criar um Set com os IDs das opções encerradas
      const opcoesEncerradas = new Set(
        (completedData || []).map(c => c.ops_id)
      );
      
      // Filtrar opções abertas que usam garantia
      const opcoesAbertas = (opcoesData || []).filter(opcao => {
        // Verificar se não está encerrada
        const naoEncerrada = !opcoesEncerradas.has(opcao.ops_id);
        
        // Verificar se usa garantia: Venda de Call ou Compra de Put
        const usaGarantia = 
          (opcao.ops_operacao?.toLowerCase() === 'venda' && opcao.ops_tipo?.toLowerCase() === 'call') ||
          (opcao.ops_operacao?.toLowerCase() === 'compra' && opcao.ops_tipo?.toLowerCase() === 'put');
        
        return naoEncerrada && usaGarantia;
      });
      
      // Agrupar por ticker (ops_acao) e somar quantidades
      const quantidadesPorTicker = new Map<string, number>();
      
      opcoesAbertas.forEach(opcao => {
        const ticker = opcao.ops_acao?.toUpperCase() || '';
        const quantidade = Number(opcao.ops_quanti) || 0;
        
        if (ticker) {
          const quantidadeAtual = quantidadesPorTicker.get(ticker) || 0;
          quantidadesPorTicker.set(ticker, quantidadeAtual + quantidade);
        }
      });
      
      return quantidadesPorTicker;
    } catch (error) {
      console.error('Erro ao calcular status das garantias:', error);
      return new Map();
    }
  };

  const fetchGarantias = async () => {
    if (!props?.userId) return;
    
    try {
      const { data, error } = await supabase
        .from('garantias')
        .select('*')
        .eq('user_id', props.userId)
        .order('criado_em', { ascending: false });
      
      if (error) throw error;
      
      // Calcular status para cada garantia
      const quantidadesPorTicker = await calcularStatusGarantias();
      
      const garantiasComStatus = (data || []).map(garantia => {
        if (garantia.tipo === 'acao' && garantia.ticker) {
          const tickerUpper = garantia.ticker.toUpperCase();
          const quantidadeEmGarantia = quantidadesPorTicker.get(tickerUpper) || 0;
          
          return {
            ...garantia,
            status: quantidadeEmGarantia > 0 
              ? `Em garantia (${quantidadeEmGarantia})` 
              : 'Livre'
          } as Garantia;
        }
        return garantia as Garantia;
      });
      
      setGarantias(garantiasComStatus);
    } catch (error) {
      console.error('Erro ao buscar garantias:', error);
      setGarantias([]);
    } finally {
      setLoading(false);
    }
  };

  const adicionarGarantia = async (garantia: Partial<Garantia>) => {
    if (!props?.userId) throw new Error('Usuário não autenticado');
    
    try {
      const garantiaData: any = { ...garantia, user_id: props.userId };
      const { data, error } = await supabase
        .from('garantias')
        .insert([garantiaData])
        .select();
      
      if (error) throw error;
      
      await fetchGarantias();
      return data;
    } catch (error) {
      console.error('Erro ao adicionar garantia:', error);
      throw error;
    }
  };

  const editarGarantia = async (garantiaId: string, dadosAtualizados: Partial<Garantia>) => {
    if (!props?.userId) throw new Error('Usuário não autenticado');
    
    try {
      const { error } = await supabase
        .from('garantias')
        .update(dadosAtualizados)
        .eq('garantia_id', garantiaId)
        .eq('user_id', props.userId);
      
      if (error) throw error;
      
      await fetchGarantias();
    } catch (error) {
      console.error('Erro ao editar garantia:', error);
      throw error;
    }
  };

  const deletarGarantia = async (garantiaId: string) => {
    if (!props?.userId) throw new Error('Usuário não autenticado');
    
    try {
      const { error } = await supabase
        .from('garantias')
        .delete()
        .eq('garantia_id', garantiaId)
        .eq('user_id', props.userId);
      
      if (error) throw error;
      
      await fetchGarantias();
    } catch (error) {
      console.error('Erro ao deletar garantia:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (props?.userId) {
      fetchGarantias();
    }
  }, [props?.userId]);

  return {
    garantias,
    loading,
    adicionarGarantia,
    editarGarantia,
    deletarGarantia,
    refreshData: fetchGarantias,
  };
};
