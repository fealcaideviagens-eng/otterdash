import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isStrongPassword } from "@/utils/security";
import { Eye, EyeOff } from "lucide-react";
import lontralogin from "@/assets/lontra-login.png";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSessionReady, setIsSessionReady] = useState(false);
    const navigate = useNavigate();

    // Ref para guardar os tokens da URL assim que a página carrega
    // Isso evita o problema de "race condition" onde o Supabase limpa a URL antes de usarmos
    const hashParamsRef = useRef<{ accessToken: string | null; refreshToken: string | null }>({
        accessToken: null,
        refreshToken: null
    });

    // Captura os tokens ou código PKCE imediatamente
    useEffect(() => {
        const handleAuth = async () => {
            // 1. Verifica Hash (Implicit Flow)
            const hash = window.location.hash;
            if (hash) {
                const hashParams = new URLSearchParams(hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');

                if (accessToken && refreshToken) {
                    console.log('📥 Tokens (Hash) capturados e salvos em memória.');
                    hashParamsRef.current = { accessToken, refreshToken };
                    setIsSessionReady(true); // Já temos o que precisa
                    return;
                }
            }

            // 2. Verifica Query Params (PKCE Flow)
            const searchParams = new URLSearchParams(window.location.search);
            const code = searchParams.get('code');

            if (code) {
                console.log('📥 Código PKCE detectado. Trocando por sessão...');
                try {
                    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) {
                        console.error('❌ Erro ao trocar código por sessão:', error);
                        toast.error("Link inválido ou expirado.");
                    } else if (data.session) {
                        console.log('✅ Sessão estabelecida via PKCE!');
                        setIsSessionReady(true);
                    }
                } catch (err) {
                    console.error('❌ Erro inesperado no PKCE:', err);
                }
            }
        };

        handleAuth();
    }, []);

    // Monitora o estado da autenticação e força sessão se necessário
    // Monitora o estado da autenticação
    // Monitora o estado da autenticação
    useEffect(() => {
        let mounted = true;

        const checkSession = async () => {
            console.log('🔍 Verificando sessão inicial...');
            const { data: { session } } = await supabase.auth.getSession();

            if (session && mounted) {
                console.log('✅ Sessão ativa encontrada:', session.user.email);
                setIsSessionReady(true);
            } else {
                // Fallback: Verifica se há um token na URL (ou salvo no ref)
                const hash = window.location.hash;
                if ((hash && hash.includes('access_token')) || hashParamsRef.current.accessToken) {
                    console.log('⚠️ Sessão não estabelecida, mas token encontrado.');
                    console.log('✅ Liberando formulário para tentativa de atualização.');
                    if (mounted) setIsSessionReady(true);
                }
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔔 Auth State Change:', event);

            if (event === 'PASSWORD_RECOVERY') {
                console.log('✅ Evento de recuperação de senha detectado');
                setIsSessionReady(true);
            } else if (event === 'SIGNED_IN' && session) {
                console.log('✅ Usuário logado via token');
                setIsSessionReady(true);
            } else if (event === 'SIGNED_OUT') {
                console.log('👋 Usuário deslogado');
                setIsSessionReady(false);
            }
        });

        // Timeout de segurança: Libera o formulário após 1s para não travar o usuário
        const timeout = setTimeout(() => {
            if (mounted && !isSessionReady) {
                console.log('⚠️ Timeout: Forçando liberação do formulário.');
                setIsSessionReady(true);
            }
        }, 1000);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, [isSessionReady]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validação de senha forte
        const passwordValidation = isStrongPassword(password);
        if (!passwordValidation.isValid) {
            toast.error(passwordValidation.message);
            return;
        }

        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem");
            return;
        }

        setIsLoading(true);

        try {
            console.log('🔐 Tentando atualizar senha...');

            // Tenta garantir que existe uma sessão válida antes de atualizar
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                console.log('⚠️ Sessão não detectada automaticamente. Tentando forçar via tokens salvos...');

                // Tenta usar os tokens salvos no ref (prioridade) ou ler da URL novamente
                let accessToken = hashParamsRef.current.accessToken;
                let refreshToken = hashParamsRef.current.refreshToken;

                // Se não tiver no ref, tenta ler da URL (caso raro onde o useEffect ainda não rodou ou algo assim)
                if (!accessToken || !refreshToken) {
                    const hashParams = new URLSearchParams(window.location.hash.substring(1));
                    accessToken = hashParams.get('access_token');
                    refreshToken = hashParams.get('refresh_token');
                }

                if (accessToken && refreshToken) {
                    console.log('✅ Tokens encontrados. Definindo sessão manualmente...');
                    const { error: sessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });

                    if (sessionError) {
                        console.error('❌ Erro ao definir sessão manual:', sessionError);
                        throw new Error("Não foi possível validar seu acesso. Por favor, solicite um novo link.");
                    }
                    console.log('✅ Sessão definida manualmente com sucesso!');
                } else {
                    console.error('❌ Tokens não encontrados (nem na URL nem em memória).');
                    throw new Error("Link inválido ou expirado. Solicite uma nova recuperação de senha.");
                }
            }

            // O updateUser usa a sessão ativa (agora garantida)
            const { data, error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                console.error('❌ Erro ao atualizar senha:', error);
                toast.error(error.message || "Erro ao atualizar senha");
                return;
            }

            console.log('✅ Senha atualizada com sucesso:', data);

            // Faz logout para forçar novo login com a nova senha
            await supabase.auth.signOut();

            toast.success("Senha atualizada com sucesso! Faça login com sua nova senha.");
            navigate("/auth");
        } catch (error: any) {
            console.error('❌ Erro completo:', error);
            toast.error(error.message || "Erro ao atualizar senha");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-brand-purple via-brand-purple-dark to-[#1C2E51]">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>

            {/* Lado Esquerdo - Imagem da Lontra (oculto no mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden p-1">
                {/* Título sobreposto */}
                <div className="absolute bottom-[58%] left-16 z-10">
                    <h1 className="text-6xl font-bold text-[#EBDECE] leading-tight">
                        Otter ops
                    </h1>
                    <h1 className="text-4xl font-light text-[#EBDECE] leading-tight opacity-60">
                        nova senha, novo começo!
                    </h1>
                </div>

                {/* Imagem */}
                <img
                    src={lontralogin}
                    alt="Lontra Login"
                    className="w-full h-auto object-contain max-h-screen"
                />
            </div>

            {/* Lado Direito - Card de Redefinição */}
            <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6 lg:pl-0 lg:pr-1 lg:py-1">
                <Card className="w-full max-w-md shadow-2xl drop-shadow-2xl glass">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">
                            Redefinir Senha
                        </CardTitle>
                        <CardDescription className="text-center">
                            Digite sua nova senha abaixo
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Nova Senha</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Mínimo 8 caracteres, com letras e números
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="default"
                                className="w-full"
                                disabled={isLoading || !isSessionReady}
                            >
                                {!isSessionReady
                                    ? "Verificando link..."
                                    : isLoading
                                        ? "Atualizando..."
                                        : "Atualizar Senha"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
