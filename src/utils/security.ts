/**
 * Utilitários de validação e sanitização para segurança
 */

/**
 * Valida formato de email
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Valida força da senha
 * Requisitos: mínimo 8 caracteres, pelo menos 1 letra e 1 número
 */
export const isStrongPassword = (password: string): {
    isValid: boolean;
    message: string
} => {
    if (password.length < 8) {
        return { isValid: false, message: 'A senha deve ter no mínimo 8 caracteres' };
    }

    if (!/[a-zA-Z]/.test(password)) {
        return { isValid: false, message: 'A senha deve conter pelo menos uma letra' };
    }

    if (!/\d/.test(password)) {
        return { isValid: false, message: 'A senha deve conter pelo menos um número' };
    }

    return { isValid: true, message: 'Senha válida' };
};

/**
 * Sanitiza string removendo caracteres perigosos para XSS
 */
export const sanitizeString = (input: string): string => {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Valida e sanitiza nome
 */
export const validateAndSanitizeName = (name: string): {
    isValid: boolean;
    sanitized: string;
    message: string
} => {
    const trimmed = name.trim();

    if (trimmed.length < 2) {
        return { isValid: false, sanitized: '', message: 'Nome deve ter pelo menos 2 caracteres' };
    }

    if (trimmed.length > 100) {
        return { isValid: false, sanitized: '', message: 'Nome muito longo (máximo 100 caracteres)' };
    }

    // Remove caracteres especiais perigosos mas mantém acentos
    const sanitized = trimmed.replace(/[<>\"'\/]/g, '');

    return { isValid: true, sanitized, message: 'Nome válido' };
};

/**
 * Valida número (para valores financeiros)
 */
export const isValidNumber = (value: any): boolean => {
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
};

/**
 * Sanitiza e valida valor numérico
 */
export const sanitizeNumber = (value: string | number): number | null => {
    const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
    return isValidNumber(num) ? num : null;
};

/**
 * Rate limiting simples no frontend (previne spam)
 */
class RateLimiter {
    private attempts: Map<string, number[]> = new Map();

    /**
     * Verifica se a ação pode ser executada
     * @param key - Identificador único da ação
     * @param maxAttempts - Número máximo de tentativas
     * @param windowMs - Janela de tempo em milissegundos
     */
    canProceed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
        const now = Date.now();
        const attempts = this.attempts.get(key) || [];

        // Remove tentativas antigas
        const recentAttempts = attempts.filter(time => now - time < windowMs);

        if (recentAttempts.length >= maxAttempts) {
            return false;
        }

        // Adiciona nova tentativa
        recentAttempts.push(now);
        this.attempts.set(key, recentAttempts);

        return true;
    }

    /**
     * Reseta o contador para uma chave
     */
    reset(key: string): void {
        this.attempts.delete(key);
    }
}

export const rateLimiter = new RateLimiter();

/**
 * Mascara informações sensíveis para logs
 */
export const maskSensitiveData = (data: any): any => {
    if (typeof data !== 'object' || data === null) {
        return data;
    }

    const masked = { ...data };
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'creditCard'];

    for (const key in masked) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
            masked[key] = '***MASKED***';
        }
    }

    return masked;
};
