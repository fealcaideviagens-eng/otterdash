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

    // Aguarda o Supabase processar o token da URL
    useEffect(() => {
        const checkAndWaitForSession = async () => {
            console.log('🔍 Verificando token na URL...');

            // Verifica se há token na URL
            const hash = window.location.hash;
            if (!hash.includes('access_token') && !hash.includes('recovery_token')) {
                console.log('⚠️ Nenhum token encontrado na URL - usuário pode ter acessado diretamente');
                // NÃO redireciona aqui - deixa o usuário ver a página
                // A validação será feita no submit
                setIsSessionReady(true); // Permite que o usuário tente
                return;
            }

            console.log('✅ Token encontrado na URL, aguardando Supabase processar...');

            // Aguarda um pouco para o Supabase processar o token
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Verifica se a sessão foi criada
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('❌ Erro ao obter sessão:', error);
            }

            if (session) {
                console.log('✅ Sessão criada com sucesso!', session.user.email);
                setIsSessionReady(true);
            } else {
                console.log('⚠️ Sessão ainda não criada, aguardando mais um pouco...');
                // Tenta novamente após mais tempo
                await new Promise(resolve => setTimeout(resolve, 2000));

                const { data: { session: retrySession } } = await supabase.auth.getSession();
                if (retrySession) {
                    console.log('✅ Sessão criada após retry!', retrySession.user.email);
                    setIsSessionReady(true);
                } else {
                    console.log('❌ Sessão não foi criada - mas permite tentar mesmo assim');
                    // Permite que o usuário tente - a validação será no submit
                    setIsSessionReady(true);
                }
            }
        };

        checkAndWaitForSession();
    }, [navigate]);

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
            // Verifica se há uma sessão válida antes de tentar atualizar
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                console.error('Erro ao obter sessão:', sessionError);
                toast.error("Erro ao verificar sessão. Tente novamente.");
                setIsLoading(false);
                return;
            }

            if (!session) {
                toast.error("Sessão inválida. Por favor, solicite um novo link de recuperação.");
                navigate("/esqueci-senha");
                return;
            }

            console.log('Sessão válida, atualizando senha...');

            // Atualiza a senha
            const { data, error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                console.error('Erro ao atualizar senha:', error);
                throw error;
            }

            console.log('Senha atualizada com sucesso:', data);

            // Faz logout para forçar novo login com a nova senha
            await supabase.auth.signOut();

            toast.success("Senha atualizada com sucesso! Faça login com sua nova senha.");
            navigate("/auth");
        } catch (error: any) {
            console.error('Erro completo:', error);
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
