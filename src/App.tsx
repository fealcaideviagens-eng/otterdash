import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/navigation/Sidebar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CadastroOpcao from "./pages/CadastroOpcao";
import ListaOpcoes from "./pages/ListaOpcoes";
import Lucros from "./pages/Lucros";
import Metas from "./pages/Metas";
import Garantias from "./pages/Garantias";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import DadosPessoais from "./pages/DadosPessoais";
import EsqueciSenha from "./pages/EsqueciSenha";
import ResetPassword from "./pages/ResetPassword";
import { AuthCallbackHandler } from "./components/AuthCallbackHandler";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Verifica se há um token de autenticação sendo processado na URL
  const hash = typeof window !== 'undefined' ? window.location.hash : '';
  const isAuthRedirect = hash.includes('access_token') || hash.includes('recovery_token');

  // Log para debug (remover depois)
  console.log('🛡️ ProtectedRoute:', {
    hash,
    isAuthRedirect,
    user: !!user,
    loading,
    willRedirect: !user && !isAuthRedirect
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  // Só redireciona se não houver usuário E não estiver processando um token
  if (!user && !isAuthRedirect) {
    console.log('🚨 ProtectedRoute: Redirecionando para /auth');
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Verifica se há um token de autenticação sendo processado na URL
  // Usa tanto window.location.hash quanto location do React Router
  const windowHash = typeof window !== 'undefined' ? window.location.hash : '';
  const routerHash = location.hash || '';
  const combinedHash = windowHash + routerHash;
  const isAuthRedirect = combinedHash.includes('access_token') || combinedHash.includes('recovery_token');

  // Log para debug (remover depois)
  console.log('🔍 Debug Reset Password:', {
    pathname: location.pathname,
    windowHash,
    routerHash,
    combinedHash,
    isAuthRedirect,
    user: !!user,
    loading
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Index />} />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
      <Route path="/esqueci-senha" element={user ? <Navigate to="/dashboard" replace /> : <EsqueciSenha />} />
      {/* Rota /reset-password SEMPRE acessível - sem redirecionamento */}
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <div className="flex h-screen bg-background">
              <Sidebar />
              <main className="flex-1 overflow-auto p-6 lg:ml-4 pb-20 lg:pb-6">
                <Dashboard />
              </main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cadastro"
        element={
          <ProtectedRoute>
            <div className="flex h-screen bg-background">
              <Sidebar />
              <main className="flex-1 overflow-auto p-6 lg:ml-4 pb-20 lg:pb-6">
                <CadastroOpcao />
              </main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/opcoes"
        element={
          <ProtectedRoute>
            <div className="flex h-screen bg-background">
              <Sidebar />
              <main className="flex-1 overflow-auto p-6 lg:ml-4 pb-20 lg:pb-6">
                <ListaOpcoes />
              </main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lucros"
        element={
          <ProtectedRoute>
            <div className="flex h-screen bg-background">
              <Sidebar />
              <main className="flex-1 overflow-auto p-6 lg:ml-4 pb-20 lg:pb-6">
                <Lucros />
              </main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/metas"
        element={
          <ProtectedRoute>
            <div className="flex h-screen bg-background">
              <Sidebar />
              <main className="flex-1 overflow-auto p-6 lg:ml-4 pb-20 lg:pb-6">
                <Metas />
              </main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/garantias"
        element={
          <ProtectedRoute>
            <div className="flex h-screen bg-background">
              <Sidebar />
              <main className="flex-1 overflow-auto p-6 lg:ml-4 pb-20 lg:pb-6">
                <Garantias />
              </main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dados-pessoais"
        element={
          <ProtectedRoute>
            <div className="flex h-screen bg-background">
              <Sidebar />
              <main className="flex-1 overflow-auto p-6 lg:ml-4 pb-20 lg:pb-6">
                <DadosPessoais />
              </main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AuthCallbackHandler>
            <TooltipProvider>
              <AppRoutes />
              <Toaster />
              <Sonner />
              <Analytics />
            </TooltipProvider>
          </AuthCallbackHandler>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
