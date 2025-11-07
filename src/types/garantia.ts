export interface Garantia {
  garantia_id: string;
  user_id?: string;
  tipo: 'acao' | 'renda_fixa';
  
  // Campos para ações
  ticker?: string;
  quantidade?: number;
  
  // Campos para renda fixa
  tipo_renda_fixa?: 'tesouro_selic' | 'caixa';
  valor_reais?: number;
  
  // Status calculado (em garantia ou livre)
  status?: string;
  
  criado_em?: string;
  atualizado_em?: string;
}
