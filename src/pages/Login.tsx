import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, User, UserPlus } from "lucide-react";

interface LoginFormData {
  login: string;
  senha: string;
}

interface CadastroFormData {
  usuario: string;
  senha: string;
  confirmacaoSenha: string;
}

interface LoginProps {
  onLogin: (nome: string, senha: string) => Promise<boolean>;
  onRegister: (nome: string, senha: string) => Promise<boolean>;
  onGoogleLogin: () => Promise<boolean>;
}

export default function Login({ onLogin, onRegister, onGoogleLogin }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { toast } = useToast();
  
  const loginForm = useForm<LoginFormData>({
    defaultValues: {
      login: "",
      senha: "",
    },
    mode: "onChange", // Permite mudanças em tempo real
  });

  const cadastroForm = useForm<CadastroFormData>({
    defaultValues: {
      usuario: "",
      senha: "",
      confirmacaoSenha: "",
    },
    mode: "onChange", // Permite mudanças em tempo real
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    console.log('Formulário de login enviado:', data);
    const success = await onLogin(data.login, data.senha);
    if (!success) {
      // Error handling is done in the login function
    }
  };

  const onCadastroSubmit = async (data: CadastroFormData) => {
    console.log('Formulário de cadastro enviado:', data);
    
    if (data.senha !== data.confirmacaoSenha) {
      toast({
        title: "Erro no cadastro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    const success = await onRegister(data.usuario, data.senha);
    if (success) {
      setIsRegistering(false);
      cadastroForm.reset();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-modern-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#61005D' }}>
              {isRegistering ? (
                <UserPlus className="w-8 h-8 text-white" />
              ) : (
                <Lock className="w-8 h-8 text-white" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {isRegistering ? "Criar nova conta" : "Acesso ao dashboard"}
          </CardTitle>
          <CardDescription>
            {isRegistering 
              ? "Preencha os dados para criar sua conta"
              : "Digite suas credenciais para acessar o sistema"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isRegistering ? (
            <Form {...cadastroForm}>
              <form onSubmit={cadastroForm.handleSubmit(onCadastroSubmit)} className="space-y-4">
                <FormField
                  control={cadastroForm.control}
                  name="usuario"
                  rules={{ 
                    required: "Usuário é obrigatório",
                    minLength: { 
                      value: 3, 
                      message: "Usuário deve ter pelo menos 3 caracteres" 
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="w-4 h-4" style={{ color: '#61005D' }} />
                        Usuário
                      </FormLabel>
                       <FormControl>
                          <Input
                            placeholder="Digite seu usuário"
                            className="placeholder-subtle"
                            autoComplete="username"
                            {...field}
                          />
                       </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={cadastroForm.control}
                  name="senha"
                  rules={{ 
                    required: "Senha é obrigatória",
                    minLength: { 
                      value: 3, 
                      message: "Senha deve ter pelo menos 3 caracteres" 
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="w-4 h-4" style={{ color: '#61005D' }} />
                        Senha
                      </FormLabel>
                      <FormControl>
                         <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Digite sua senha"
                              className="placeholder-subtle pr-10"
                              autoComplete="new-password"
                              {...field}
                            />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={cadastroForm.control}
                  name="confirmacaoSenha"
                  rules={{ 
                    required: "Confirmação de senha é obrigatória",
                    validate: (value) => 
                      value === cadastroForm.watch("senha") || "As senhas não coincidem"
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="w-4 h-4" style={{ color: '#61005D' }} />
                        Confirmar Senha
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                           <Input
                             type={showConfirmPassword ? "text" : "password"}
                             placeholder="Confirme sua senha"
                             className="placeholder-subtle pr-10"
                             {...field}
                           />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full shadow-modern mt-6 rounded-full"
                  style={{ backgroundColor: '#61005D' }}
                  size="lg"
                >
                  Criar conta
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="login"
                  rules={{ 
                    required: "Login é obrigatório",
                    minLength: { 
                      value: 3, 
                      message: "Login deve ter pelo menos 3 caracteres" 
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="w-4 h-4" style={{ color: '#61005D' }} />
                        Login
                      </FormLabel>
                      <FormControl>
                         <Input
                           placeholder="Digite seu login"
                           className="placeholder-subtle"
                           {...field}
                         />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="senha"
                  rules={{ 
                    required: "Senha é obrigatória",
                    minLength: { 
                      value: 3, 
                      message: "Senha deve ter pelo menos 3 caracteres" 
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="w-4 h-4" style={{ color: '#61005D' }} />
                        Senha
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                           <Input
                             type={showPassword ? "text" : "password"}
                             placeholder="Digite sua senha"
                             className="placeholder-subtle pr-10"
                             {...field}
                           />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 <Button 
                   type="submit" 
                   className="w-full shadow-modern mt-6 rounded-full"
                   style={{ backgroundColor: '#61005D' }}
                   size="lg"
                 >
                   Entrar no dashboard
                 </Button>
               </form>
             </Form>
           )}

           {/* Divisor para login com Google */}
           <div className="mt-6 relative">
             <div className="absolute inset-0 flex items-center">
               <span className="w-full border-t" />
             </div>
             <div className="relative flex justify-center text-xs uppercase">
               <span className="bg-background px-2 text-muted-foreground">ou</span>
             </div>
           </div>

           {/* Botão de login com Google */}
           <Button
             onClick={onGoogleLogin}
             variant="outline"
             className="w-full mt-4 mb-4"
             size="lg"
           >
             <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
               <path
                 fill="currentColor"
                 d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
               />
               <path
                 fill="currentColor"
                 d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
               />
               <path
                 fill="currentColor"
                 d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
               />
               <path
                 fill="currentColor"
                 d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
               />
             </svg>
             Continuar com Google
           </Button>
           
           <div className="mt-2 text-center">
            <Button
              variant="ghost"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm"
              style={{ color: '#61005D' }}
            >
              {isRegistering 
                ? "Já tem uma conta? Fazer login"
                : "Não tem conta? Criar nova conta"
              }
            </Button>
            
            {!isRegistering && (
                <p className="text-sm text-muted-foreground mt-2">
                  Dados para teste: <strong>teste</strong> / <strong>123</strong>
                </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}