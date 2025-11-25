/**
 * Sistema de tratamento de erros seguro
 * Evita expor detalhes técnicos sensíveis ao usuário
 */

import { toast } from 'sonner';

export interface ErrorLog {
    timestamp: string;
    type: string;
    message: string;
    stack?: string;
    userId?: string;
}

/**
 * Mapeia erros técnicos para mensagens amigáveis
 */
const ERROR_MESSAGES: Record<string, string> = {
    // Erros de autenticação
    'Invalid login credentials': 'Email ou senha incorretos',
    'Email not confirmed': 'Por favor, confirme seu email antes de fazer login',
    'User already registered': 'Este email já está cadastrado',
    'Password should be at least 6 characters': 'A senha deve ter no mínimo 6 caracteres',

    // Erros de rede
    'Failed to fetch': 'Erro de conexão. Verifique sua internet',
    'Network request failed': 'Erro de conexão. Verifique sua internet',

    // Erros de validação
    'Invalid email': 'Email inválido',
    'Email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos',

    // Erros de banco de dados
    'duplicate key value': 'Este registro já existe',
    'violates foreign key constraint': 'Não é possível realizar esta operação',
    'permission denied': 'Você não tem permissão para esta ação',

    // Erros genéricos
    'PGRST116': 'Registro não encontrado',
    'JWT expired': 'Sessão expirada. Faça login novamente',
};

/**
 * Traduz erro técnico para mensagem amigável
 */
const getUserFriendlyMessage = (error: any): string => {
    const errorMessage = error?.message || error?.error_description || String(error);

    // Procura por mensagens conhecidas
    for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
        if (errorMessage.includes(key)) {
            return message;
        }
    }

    // Mensagem genérica se não encontrar correspondência
    return 'Ocorreu um erro. Por favor, tente novamente';
};

/**
 * Loga erro de forma segura (sem expor dados sensíveis)
 */
const logError = (error: any, context?: string): void => {
    const errorLog: ErrorLog = {
        timestamp: new Date().toISOString(),
        type: error?.name || 'UnknownError',
        message: error?.message || String(error),
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    };

    // Em produção, você enviaria isso para um serviço de logging (Sentry, LogRocket, etc)
    if (process.env.NODE_ENV === 'development') {
        console.error(`[${context || 'Error'}]`, errorLog);
    }

    // TODO: Integrar com serviço de logging em produção
    // Example: Sentry.captureException(error);
};

/**
 * Handler principal de erros
 */
export const handleError = (
    error: any,
    context?: string,
    showToast: boolean = true
): void => {
    // Loga o erro
    logError(error, context);

    // Mostra mensagem amigável ao usuário
    if (showToast) {
        const userMessage = getUserFriendlyMessage(error);
        toast.error(userMessage);
    }
};

/**
 * Wrapper para funções assíncronas com tratamento de erro
 */
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context?: string
): T => {
    return (async (...args: any[]) => {
        try {
            return await fn(...args);
        } catch (error) {
            handleError(error, context);
            throw error; // Re-throw para permitir tratamento adicional se necessário
        }
    }) as T;
};

/**
 * Valida resposta da API
 */
export const validateApiResponse = (response: any): boolean => {
    if (!response) {
        throw new Error('Resposta vazia da API');
    }

    if (response.error) {
        throw new Error(response.error.message || 'Erro na API');
    }

    return true;
};

/**
 * Wrapper seguro para operações do Supabase
 */
export const safeSupabaseOperation = async <T>(
    operation: () => Promise<{ data: T | null; error: any }>,
    context?: string
): Promise<T> => {
    try {
        const { data, error } = await operation();

        if (error) {
            handleError(error, context);
            throw error;
        }

        if (data === null) {
            throw new Error('Nenhum dado retornado');
        }

        return data;
    } catch (error) {
        handleError(error, context);
        throw error;
    }
};
