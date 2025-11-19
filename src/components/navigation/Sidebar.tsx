import { NavLink } from "react-router-dom";
import { Plus, List, Home, TrendingUp, Target, Shield, LogOut, Menu, User, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import otterLogoNegativo from "@/assets/logo-otter-negativo.png";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

const mainNavigation = [
  { name: "Visão geral", href: "/dashboard", icon: Home },
  { name: "Cadastro", href: "/cadastro", icon: Plus },
  { name: "Portfólio", href: "/opcoes", icon: Wallet },
];

const hamburgerNavigation = [
  { name: "Lucros", href: "/lucros", icon: TrendingUp },
  { name: "Metas", href: "/metas", icon: Target },
  { name: "Garantias", href: "/garantias", icon: Shield },
];

const navigation = [...mainNavigation, ...hamburgerNavigation];

export const Sidebar = () => {
  const { signOut, user } = useAuth();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 h-screen flex-col border-r border-blue-200" style={{ backgroundColor: '#263C64' }}>
        <div className="flex h-16 items-center justify-center border-b border-blue-300 px-6">
          <div className="flex items-center space-x-2">
            <img
              src={otterLogoNegativo}
              alt="Otter Logo Negativo"
              className="h-8 w-auto"
              loading="eager"
            />
          </div>
        </div>

        <nav className="flex-1 flex flex-col space-y-1 p-4">
          <div className="flex-1 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-3 py-2 text-sm font-medium transition-colors text-white btn-pill",
                    isActive
                      ? "bg-white/15 text-white"
                      : "hover:bg-white/5"
                  )
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-blue-300 space-y-1">
            <NavLink
              to="/dados-pessoais"
              className={({ isActive }) =>
                cn(
                  buttonVariants({ variant: "ghost" }),
                  "w-full justify-start text-white hover:bg-white/10 hover:text-white",
                  isActive ? "bg-white/15 text-white" : ""
                )
              }
            >
              <User className="mr-3 h-5 w-5" />
              Dados pessoais
            </NavLink>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
              onClick={() => signOut()}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </Button>
          </div>
        </nav>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-blue-200" style={{ backgroundColor: '#263C64' }}>
        <nav className="flex justify-around py-2">

          {/* ITENS PRINCIPAIS (Visão Geral, Cadastro, Portfólio) */}
          {mainNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center px-3 py-2 text-xs font-medium transition-colors text-white min-w-0",
                  isActive
                    ? "text-blue-300"
                    : "hover:text-blue-300"
                )
              }
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}

          {/* ITEM 4: MENU HAMBURGER (SHEET) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                // CHAVE DA CORREÇÃO: Aplicar p-0 para resetar o padding do Button
                // e aplicar o padding desejado nos spans internos se necessário.
                // Mas vamos tentar manter o padding no botão primeiro e adicionar 'h-auto' e 'p-0'
                className="flex flex-col items-center px-3 py-2 text-xs font-medium text-white hover:bg-transparent hover:text-blue-300 min-w-0 h-auto p-0"
              >
                {/* NOTA: O NavLink já tem 'px-3 py-2'. O Button precisa ser forçado a ignorar a altura padrão.
                Se a correção acima não funcionar, o padding deve ser aplicado *dentro* do Button.
                Vamos tentar o p-0 primeiro:
                */}
                <div className="flex flex-col items-center px-3 py-2">
                  <Menu className="h-5 w-5 mb-1" />
                  <span className="truncate">Menu</span>
                </div>
              </Button>
            </SheetTrigger>

            <SheetContent side="bottom" className="w-full max-h-[80vh] rounded-t-lg bg-white p-4">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-xl font-bold text-slate-900">Menu Principal</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-1">

                {/* ITENS ESCONDIDOS (Lucros, Metas, Garantias) */}
                {hamburgerNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center px-3 py-3 text-sm font-medium transition-colors text-slate-700 rounded-lg",
                        isActive
                          ? "bg-slate-100 text-slate-900 font-semibold"
                          : "hover:bg-slate-50"
                      )
                    }
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </NavLink>
                ))}

                {/* BOTÃO SAIR */}
                <div className="pt-4 border-t border-slate-200 mt-4 space-y-1">
                  <NavLink
                    to="/dados-pessoais"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center px-3 py-3 text-sm font-medium transition-colors text-slate-700 rounded-lg",
                        isActive
                          ? "bg-slate-100 text-slate-900 font-semibold"
                          : "hover:bg-slate-50"
                      )
                    }
                  >
                    <User className="mr-3 h-5 w-5" />
                    Dados pessoais
                  </NavLink>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sair
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </>
  );
};