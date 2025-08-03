import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Meta } from "@/types/database";

interface UseMetasProps {
  userId?: string;
}

export const useMetas = (props?: UseMetasProps) => {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetas = async () => {
    if (!props?.userId) return;
    
    try {
      const { data, error } = await supabase
        .from('metas')
        .select('*')
        .eq('user-id', props.userId)
        .order('ano', { ascending: false });
      
      if (error) throw error;
      setMetas(data || []);
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
      setMetas([]);
    } finally {
      setLoading(false);
    }
  };

  const addMeta = async (meta: { tipo: string; valor: number; ano: number }) => {
    if (!props?.userId) throw new Error('Usuário não autenticado');
    
    try {
      const metaData = {
        "m-mensal": meta.tipo === "mensal" ? meta.valor : 0,
        "m-anual": meta.tipo === "anual" ? meta.valor : null,
        ano: meta.ano,
        "user-id": props.userId,
      };

      const { data, error } = await supabase
        .from('metas')
        .insert([metaData])
        .select();
      
      if (error) throw error;
      
      await fetchMetas();
      return data;
    } catch (error) {
      console.error('Erro ao adicionar meta:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (props?.userId) {
      fetchMetas();
    }
  }, [props?.userId]);

  return {
    metas,
    loading,
    addMeta,
    refreshData: fetchMetas,
  };
};