export interface OpcaoFormData {
  opcao: string;
  operacao: string;
  tipo: string;
  acao: string;
  strike: string;
  cotacao: string;
  quantidade: string;
  premio: string;
  data: string;
  status: string;
}

export interface TravaLeg {
  ticker: string;
  strike: string;
  premio: string;
}

export interface TravaData {
  compra: TravaLeg;
  venda: TravaLeg;
}

export interface OperationData {
  isTrava: boolean;
  isShortPut: boolean;
  isShortCall: boolean;
  isLongPut: boolean;
  isLongCall: boolean;
  percentualDiferenca: number;
  valorTotal: number;
  valorTotalLabel: string;
  isGanho: boolean;
  nivelRisco: string;
  corRisco: string;
  progressValue: number;
  valorExercicio: number;
  quantidadeAcoes: number;
  mostrarValorExercicio: boolean;
  mostrarQuantidadeAcoes: boolean;
  percentualRelativoGarantia: number;
  labelPercentualGarantia: string;
  isGanhoGarantia: boolean;
  mostrarAlavancagem: boolean;
  statusAlavancagem: string;
  isAlavancado: boolean;
  quantidadeAlavancada: number;
  custoTotal: number;
  lucroMaximo: number;
  breakEven: number;
  payoffRatio: number;
  payoffLabel: string;
  payoffColor: string;
  distanciaAlvo: number;
  distanciaLabel: string;
  mostrarDistancia: boolean;
  riscoMaximo?: number;
  lucroMaximoLabel?: string;
}

export interface Draft {
  id: string;
  timestamp: number;
  expiresAt: number;
  strategyId: string;
  strategyName: string;
  isTrava: boolean;
  formData: OpcaoFormData;
  travaData?: TravaData;
  operationData: OperationData;
}

