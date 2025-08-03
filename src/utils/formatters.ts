export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
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