export interface Opcao {
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
  "update-id": string;
  premio: number;
  encerramento: string;
  quantidade: number;
  created_at: string | null;
  opcao_id: string | null;
}

export interface Cadastro {
  "user-id": string;
  nome: string;
  senha: number | null;
}

export interface Meta {
  "meta-id": string;
  "m-mensal": number;
  "m-anual": number | null;
  ano: number | null;
  "user-id": string | null;
}

export interface DashboardMetrics {
  opcoesAbertas: number;
  valorGanhoMes: number;
  lucroMaximoEstimado: number;
}