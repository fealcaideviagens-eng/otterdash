import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "@/components/navigation/Sidebar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Dashboard from "./pages/Dashboard";
import CadastroOpcao from "./pages/CadastroOpcao";
import ListaOpcoes from "./pages/ListaOpcoes";
import Lucros from "./pages/Lucros";
import Metas from "./pages/Metas";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route
        path="/"
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <AppRoutes />
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
