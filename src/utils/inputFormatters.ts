// Utilitários para formatação de inputs de valores

export const formatCurrency = (value: string): string => {
  // Remove tudo que não for número
  const numbers = value.replace(/\D/g, '');
  
  if (!numbers) return '';
  
  // Converte para número e divide por 100 para obter centavos
  const numberValue = parseInt(numbers) / 100;
  
  // Formata com vírgula para centavos e ponto para milhares
  return numberValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatNumber = (value: string): string => {
  // Remove tudo que não for número
  const numbers = value.replace(/\D/g, '');
  
  if (!numbers) return '';
  
  // Formata com ponto para milhares
  return parseInt(numbers).toLocaleString('pt-BR');
};

export const parseCurrencyToNumber = (value: string): number => {
  // Remove pontos e substitui vírgula por ponto
  const cleanValue = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};

export const parseNumberToInt = (value: string): number => {
  // Remove pontos
  const cleanValue = value.replace(/\./g, '');
  return parseInt(cleanValue) || 0;
};