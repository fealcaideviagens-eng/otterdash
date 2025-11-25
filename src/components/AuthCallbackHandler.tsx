import { useEffect } from 'react';

/**
 * Componente que monitora tokens de autenticação na URL
 */
export function AuthCallbackHandler({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Captura o hash imediatamente quando o componente monta
        const hash = window.location.hash;
        const pathname = window.location.pathname;

        console.log('🔍 AuthCallbackHandler montado:', {
            pathname,
            hash,
            hasToken: hash.includes('access_token') || hash.includes('recovery_token')
        });
    }, []);

    return <>{children}</>;
}
