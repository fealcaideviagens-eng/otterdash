export interface Opcao {
  // Novos campos da tabela ops_registry
  ops_id: string;
  id: string;
  ops_ticker: string;
  ops_operacao: string;
  ops_tipo: string | null;
  ops_acao: string | null;
  ops_strike: number | null;
  acao_cotacao: number | null;
  ops_quanti: number | null;
  ops_premio: number | null;
  ops_vencimento: string | null;
  ops_criado_em: string | null;
  
  // Aliases para compatibilidade (campos antigos)
  opcao: string;
  operacao: string;
  tipo: string | null;
  acao: string | null;
  strike: number | null;
  cotacao: number | null;
  quantidade: number | null;
  premio: number | null;
  data: string | null;
  status: string | null;
  user_id?: string;
}

export interface Venda {
  // Novos campos da tabela ops_completed
  completed_id: string;
  completed_premio: number;
  completed_data: string;
  completed_quanti: number;
  completed_criado_em: string | null;
  ops_id: string | null;
  
  // Aliases para compatibilidade (campos antigos)
  "update-id": string;
  premio: number;
  encerramento: string;
  quantidade: number;
  created_at: string | null;
  opcao_id: string | null;
}

export interface Cadastro {
  id: string;
  nome: string;
  email: string;
  criado_em: string;
}

export interface Meta {
  goal_id: string;
  goal_tipo: string;
  goal_valor: number;
  goal_ano: number | null;
  id?: string;
  created_at?: string;
}

export interface DashboardMetrics {
  opcoesAbertas: number;
  valorGanhoMes: number;
  lucroMaximoEstimado: number;
}