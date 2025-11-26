import { useState, useEffect } from "react";
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

    // Monitora o estado da autenticação e força sessão se necessário
    useEffect(() => {
        let mounted = true;

        const handleAuthChange = async () => {
            console.log('🔍 Iniciando monitoramento de autenticação...');

            const hash = window.location.hash;
            const search = window.location.search;

            console.log('🔍 Analisando URL:', { hash, search });

            // CASO 1: PKCE (tem ?code=...)
            if (search.includes('code=')) {
                console.log('🔑 Código PKCE detectado! Realizando troca manual...');
                const params = new URLSearchParams(search);
                const code = params.get('code');

                if (code) {
                    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) {
                        console.error('❌ Erro na troca de código PKCE:', error);
                    } else if (data.session) {
                        console.log('✅ Sessão PKCE estabelecida com sucesso!');
                        setIsSessionReady(true);
                        return;
                    }
                }
            }

            // CASO 2: Implicit Flow (tem #access_token=...)
            else if (hash && (hash.includes('access_token') || hash.includes('type=recovery'))) {
                console.log('💊 Hash detectado. Tentando processar manualmente...');

                const params = new URLSearchParams(hash.replace('#', '?'));
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                if (accessToken && refreshToken) {
                    console.log('🛠️ Tokens encontrados. Forçando sessão...');
                    const { data, error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });

                    if (error) {
                        console.error('❌ Erro ao forçar sessão manual:', error);
                    } else if (data.session) {
                        console.log('✅ Sessão forçada com sucesso!');
                        setIsSessionReady(true);
                        return;
                    }
                }
            }

            // 3. Verificação de sessão existente (Backup)
            const { data: { session } } = await supabase.auth.getSession();
            if (session && mounted) {
                console.log('✅ Sessão encontrada na verificação manual:', session.user.email);
                setIsSessionReady(true);
            } else {
                // Fallback final: destrava o botão após 2 segundos
                setTimeout(() => {
                    if (mounted) {
                        console.log('⏰ Timeout. Destravando botão.');
                        setIsSessionReady(true);
                    }
                }, 2000);
            }
        };

        handleAuthChange();
    }, []);

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

            // O updateUser automaticamente valida o token da URL
            // Não precisa verificar sessão manualmente
            const { data, error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                console.error('❌ Erro ao atualizar senha:', error);

                // Mensagens de erro mais específicas
                if (error.message.includes('session') || error.message.includes('token')) {
                    toast.error("Link de recuperação inválido ou expirado. Solicite um novo link.");
                    setTimeout(() => navigate("/esqueci-senha"), 2000);
                } else {
                    toast.error(error.message || "Erro ao atualizar senha");
                }
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
                        Ottie ops
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
