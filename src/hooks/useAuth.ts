import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// Tipo de usuário simples para teste
interface User {
  "user-id": string;
  nome: string;
  senha?: number;
  email?: string;
}

// Banco de dados simples em memória para teste
const testUsers: User[] = [
  {
    "user-id": "550e8400-e29b-41d4-a716-446655440000",
    nome: "teste",
    senha: 123,
  }
];

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar autenticação do Supabase
    const checkSupabaseAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const supabaseUser: User = {
          "user-id": session.user.id,
          nome: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "Usuário",
          email: session.user.email,
        };
        setUser(supabaseUser);
      } else {
        // Fallback para autenticação local
        const savedUser = localStorage.getItem("currentUser");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
      setLoading(false);
    };

    checkSupabaseAuth();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const supabaseUser: User = {
          "user-id": session.user.id,
          nome: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "Usuário",
          email: session.user.email,
        };
        setUser(supabaseUser);
      } else {
        setUser(null);
        localStorage.removeItem("currentUser");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (nome: string, senha: string) => {
    try {
      console.log('Tentando fazer login:', { nome, senha });
      
      // Buscar usuário no "banco" interno
      const foundUser = testUsers.find(u => u.nome === nome);
      
      if (!foundUser) {
        toast({
          title: "Erro no login",
          description: "Nome ou senha incorretos",
          variant: "destructive",
        });
        return false;
      }

      // Verificar senha
      const senhaCorreta = foundUser.senha === Number(senha);
      
      if (!senhaCorreta) {
        toast({
          title: "Erro no login",
          description: "Nome ou senha incorretos",
          variant: "destructive",
        });
        return false;
      }

      console.log('Login bem-sucedido!');
      
      setUser(foundUser);
      localStorage.setItem("currentUser", JSON.stringify(foundUser));
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta ao dashboard.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro no login",
        description: "Não foi possível fazer login",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (nome: string, senha: string) => {
    try {
      console.log('Tentando registrar:', { nome, senha });
      
      // Verificar se usuário já existe
      const existingUser = testUsers.find(u => u.nome === nome);

      if (existingUser) {
        toast({
          title: "Erro no cadastro",
          description: "Usuário já existe",
          variant: "destructive",
        });
        return false;
      }

      // Criar novo usuário no "banco" interno  
      // Gerar UUID v4 simples para compatibilidade com Supabase
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      const newUser: User = {
        "user-id": generateUUID(),
        nome,
        senha: Number(senha),
      };
      
      testUsers.push(newUser);

      toast({
        title: "Conta criada com sucesso!",
        description: "Agora você pode fazer login com suas credenciais.",
      });

      return true;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: "Não foi possível criar a conta",
        variant: "destructive",
      });
      return false;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });

      if (error) {
        toast({
          title: "Erro no login com Google",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro no login com Google:', error);
      toast({
        title: "Erro no login com Google",
        description: "Não foi possível fazer login com Google",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro no logout:', error);
      }
      
      setUser(null);
      localStorage.removeItem("currentUser");
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  return {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user,
  };
};