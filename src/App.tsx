import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/navigation/Sidebar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CadastroOpcao from "./pages/CadastroOpcao";
import ListaOpcoes from "./pages/ListaOpcoes";
import Lucros from "./pages/Lucros";
import Metas from "./pages/Metas";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Componente protegido que verifica autenticação
function ProtectedApp() {
  const { isAuthenticated, login, register, loginWithGoogle } = useAuth();

  if (!isAuthenticated) {
    return <Login onLogin={login} onRegister={register} onGoogleLogin={loginWithGoogle} />;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 lg:ml-4 pb-20 lg:pb-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cadastro" element={<CadastroOpcao />} />
          <Route path="/opcoes" element={<ListaOpcoes />} />
          <Route path="/lucros" element={<Lucros />} />
          <Route path="/metas" element={<Metas />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <TooltipProvider>
            <ProtectedApp />
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
