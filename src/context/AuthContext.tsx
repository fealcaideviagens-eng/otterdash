import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { isValidEmail, isStrongPassword, validateAndSanitizeName, rateLimiter } from '@/utils/security';
import { handleError } from '@/utils/errorHandler';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, nome: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user?.user_metadata?.deleted) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          toast.error('Esta conta foi deletada e não pode ser acessada.');
          navigate('/auth');
          return;
        }
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user?.user_metadata?.deleted) {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        toast.error('Esta conta foi deletada e não pode ser acessada.');
        navigate('/auth');
        return;
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, nome: string) => {
    // Rate limiting - máximo 3 tentativas por minuto
    if (!rateLimiter.canProceed('signup', 3, 60000)) {
      toast.error('Muitas tentativas de cadastro. Aguarde um minuto.');
      throw new Error('Rate limit exceeded');
    }

    // Validação de email
    if (!isValidEmail(email)) {
      toast.error('Email inválido');
      throw new Error('Invalid email format');
    }

    // Validação de senha
    const passwordValidation = isStrongPassword(password);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.message);
      throw new Error(passwordValidation.message);
    }

    // Validação e sanitização do nome
    const nameValidation = validateAndSanitizeName(nome);
    if (!nameValidation.isValid) {
      toast.error(nameValidation.message);
      throw new Error(nameValidation.message);
    }

    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(), // Normaliza email
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome: nameValidation.sanitized // Usa nome sanitizado
          }
        }
      });

      if (error) throw error;

      toast.success('Cadastro realizado com sucesso!');
      rateLimiter.reset('signup'); // Reset no sucesso
      navigate('/');
    } catch (error) {
      handleError(error, 'SignUp');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    // Rate limiting - máximo 5 tentativas por minuto
    if (!rateLimiter.canProceed('signin', 5, 60000)) {
      toast.error('Muitas tentativas de login. Aguarde um minuto.');
      throw new Error('Rate limit exceeded');
    }

    // Validação básica de email
    if (!isValidEmail(email)) {
      toast.error('Email inválido');
      throw new Error('Invalid email format');
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(), // Normaliza email
        password,
      });

      if (error) throw error;

      toast.success('Login realizado com sucesso!');
      rateLimiter.reset('signin'); // Reset no sucesso
      navigate('/');
    } catch (error) {
      handleError(error, 'SignIn');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success('Logout realizado com sucesso!');
      navigate('/auth');
    } catch (error) {
      handleError(error, 'SignOut');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
