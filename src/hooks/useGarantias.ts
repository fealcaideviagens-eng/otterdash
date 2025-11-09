import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Garantia } from "@/types/garantia";

interface UseGarantiasProps {
  userId?: string;
}

export const useGarantias = (props?: UseGarantiasProps) => {
  const [garantias, setGarantias] = useState<Garantia[]>([]);
  const [loading, setLoading] = useState(true);

  const calcularStatusGarantias = async (): Promise<{
    quantidadesPorTicker: Map<string, number>;
    valorRendaFixaEmGarantia: number;
  }> => {
    if (!props?.userId) return { quantidadesPorTicker: new Map(), valorRendaFixaEmGarantia: 0 };
    
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
      
      // Filtrar opções abertas que usam garantia de ações (Venda de Call ou Compra de Put)
      const opcoesAbertasAcoes = (opcoesData || []).filter(opcao => {
        const naoEncerrada = !opcoesEncerradas.has(opcao.ops_id);
        const usaGarantiaAcao = 
          (opcao.ops_operacao?.toLowerCase() === 'venda' && opcao.ops_tipo?.toLowerCase() === 'call') ||
          (opcao.ops_operacao?.toLowerCase() === 'compra' && opcao.ops_tipo?.toLowerCase() === 'put');
        
        return naoEncerrada && usaGarantiaAcao;
      });
      
      // Filtrar opções abertas que usam garantia de renda fixa (Compra de Call ou Venda de Put)
      const opcoesAbertasRendaFixa = (opcoesData || []).filter(opcao => {
        const naoEncerrada = !opcoesEncerradas.has(opcao.ops_id);
        const usaGarantiaRendaFixa = 
          (opcao.ops_operacao?.toLowerCase() === 'compra' && opcao.ops_tipo?.toLowerCase() === 'call') ||
          (opcao.ops_operacao?.toLowerCase() === 'venda' && opcao.ops_tipo?.toLowerCase() === 'put');
        
        return naoEncerrada && usaGarantiaRendaFixa;
      });
      
      // Agrupar por ticker (ops_acao) e somar quantidades para garantia de ações
      const quantidadesPorTicker = new Map<string, number>();
      
      opcoesAbertasAcoes.forEach(opcao => {
        const ticker = opcao.ops_acao?.toUpperCase() || '';
        const quantidade = Number(opcao.ops_quanti) || 0;
        
        if (ticker) {
          const quantidadeAtual = quantidadesPorTicker.get(ticker) || 0;
          quantidadesPorTicker.set(ticker, quantidadeAtual + quantidade);
        }
      });
      
      // Calcular valor em garantia de renda fixa (Strike * Quantidade)
      let valorRendaFixaEmGarantia = 0;
      
      opcoesAbertasRendaFixa.forEach(opcao => {
        const strike = Number(opcao.ops_strike) || 0;
        const quantidade = Number(opcao.ops_quanti) || 0;
        valorRendaFixaEmGarantia += strike * quantidade;
      });
      
      return { quantidadesPorTicker, valorRendaFixaEmGarantia };
    } catch (error) {
      console.error('Erro ao calcular status das garantias:', error);
      return { quantidadesPorTicker: new Map(), valorRendaFixaEmGarantia: 0 };
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
      const { quantidadesPorTicker, valorRendaFixaEmGarantia } = await calcularStatusGarantias();
      
      // Separar ações e rendas fixas
      const acoes = (data || []).filter(g => g.tipo === 'acao');
      const rendasFixas = (data || []).filter(g => g.tipo === 'renda_fixa');
      
      // Processar ações
      const acoesComStatus = acoes.map(garantia => {
        if (garantia.ticker) {
          const tickerUpper = garantia.ticker.toUpperCase();
          const quantidadeEmGarantia = quantidadesPorTicker.get(tickerUpper) || 0;
          const quantidadeTotal = garantia.quantidade || 0;
          const quantidadeLivre = quantidadeTotal - quantidadeEmGarantia;
          
          return {
            ...garantia,
            status: quantidadeEmGarantia > 0 
              ? `Em garantia (${quantidadeEmGarantia})` 
              : 'Livre',
            quantidadeEmGarantia,
            quantidadeLivre
          } as Garantia;
        }
        return garantia as Garantia;
      });
      
      // Processar rendas fixas - distribuir o valor em garantia entre elas
      let valorRestante = valorRendaFixaEmGarantia;
      const rendasFixasComStatus = rendasFixas.map(garantia => {
        const valorTotal = garantia.valor_reais || 0;
        
        let valorEmGarantiaAtual = 0;
        let valorLivreAtual = valorTotal;
        
        if (valorRestante > 0) {
          if (valorRestante >= valorTotal) {
            // Usa toda essa renda fixa
            valorEmGarantiaAtual = valorTotal;
            valorLivreAtual = 0;
            valorRestante -= valorTotal;
          } else {
            // Usa apenas parte dessa renda fixa
            valorEmGarantiaAtual = valorRestante;
            valorLivreAtual = valorTotal - valorRestante;
            valorRestante = 0;
          }
        }
        
        return {
          ...garantia,
          valorEmGarantia: valorEmGarantiaAtual,
          valorLivre: valorLivreAtual
        } as Garantia;
      });
      
      // Se ainda sobrou valor em garantia necessário e não há mais rendas fixas, 
      // mostrar o negativo na última renda fixa (ou primeira se houver apenas uma)
      if (valorRestante > 0 && rendasFixasComStatus.length > 0) {
        const ultimaRendaFixa = rendasFixasComStatus[rendasFixasComStatus.length - 1];
        ultimaRendaFixa.valorEmGarantia = (ultimaRendaFixa.valorEmGarantia || 0) + valorRestante;
        ultimaRendaFixa.valorLivre = (ultimaRendaFixa.valorLivre || 0) - valorRestante;
      }
      
      const garantiasComStatus = [...acoesComStatus, ...rendasFixasComStatus];
      
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
