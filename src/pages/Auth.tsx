import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DollarSign, Heart } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import lontralogin from "@/assets/lontra-login.png";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (mode === 'login') {
      setIsLogin(true);
    } else if (mode === 'signup') {
      setIsLogin(false);
    }
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!nome.trim()) {
          toast.error('Nome é obrigatório');
          return;
        }
        await signUp(email, password, nome);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar solicitação');
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
      bora ter controle!
    </h1>
        </div>
  
  {/* Imagem */}        
        <img 
          src={lontralogin} 
          alt="Lontra Login" 
          className="w-full h-auto object-contain max-h-screen"
        />
      </div>

      {/* Lado Direito - Card de Login */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6 lg:pl-0 lg:pr-1 lg:py-1">
         <Card className="w-full max-w-md shadow-2xl drop-shadow-2xl glass">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? 'Entrar' : 'Crie sua conta'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin 
              ? 'Opções no controle, lucro na veia!' 
              : 'Monte seu time de opções e entre no jogo!'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              variant="default"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar conta')}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
            >
              {isLogin 
                ? 'Não tem uma conta? Criar conta' 
                : 'Já tem uma conta? Entrar'}
            </button>
          </div>

          <Alert className="mt-6 border-brand-purple/20 bg-brand-purple/5">
            <Heart className="h-4 w-4 text-brand-purple" />
            <AlertDescription className="text-sm">
              <strong className="text-brand-purple">Apoie o projeto!</strong> Esta plataforma é 100% gratuita.
              Se quiser contribuir, faça uma doação via PIX:{" "}
              <span className="font-mono font-semibold">otteropcoes@gmail.com</span>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
