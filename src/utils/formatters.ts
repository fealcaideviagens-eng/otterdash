export const formatCurrency = (value: number): string => {
  // CORREÇÃO: Remove o sinal negativo de zeros
  // Se o valor for -0 ou algo como -0.00001 que arredonda para 0, forçamos 0.
  const cleanValue = Object.is(value, -0) || Math.abs(value) < 0.005 ? 0 : value;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(cleanValue);
};

export const formatDate = (date: string | Date): string => {
  if (typeof date === 'string') {
    // Se a string está no formato YYYY-MM-DD, criar a data localmente para evitar problemas de fuso horário
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      return new Intl.DateTimeFormat('pt-BR').format(dateObj);
    } else {
      // Para outros formatos, usar normalmente
      const dateObj = new Date(date);
      return new Intl.DateTimeFormat('pt-BR').format(dateObj);
    }
  } else {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }
};

export const formatDateForInput = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0];
};

export const parseInputDate = (dateString: string): string => {
  return new Date(dateString).toISOString().split('T')[0];
};

export const formatPercentage = (value: number): string => {
  const formatted = value.toFixed(2);
  return value >= 0 ? `+${formatted}%` : `${formatted}%`;
};

// Converte string YYYY-MM-DD para Date sem problemas de fuso horário
export const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const formatQuantidade = (value: string | number): string => {
  if (!value) return "";
  const num = typeof value === "string" ? parseInt(value, 10) : value;
  if (isNaN(num)) return "";
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 0 });
};