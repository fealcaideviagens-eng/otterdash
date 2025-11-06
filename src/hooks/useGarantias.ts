import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Garantia } from "@/types/garantia";

interface UseGarantiasProps {
  userId?: string;
}

export const useGarantias = (props?: UseGarantiasProps) => {
  const [garantias, setGarantias] = useState<Garantia[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGarantias = async () => {
    if (!props?.userId) return;
    
    try {
      const { data, error } = await supabase
        .from('garantias')
        .select('*')
        .eq('user_id', props.userId)
        .order('criado_em', { ascending: false });
      
      if (error) throw error;
      setGarantias((data || []) as Garantia[]);
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
