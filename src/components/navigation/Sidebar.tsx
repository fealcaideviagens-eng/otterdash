import { NavLink } from "react-router-dom";
import { Plus, List, Home, TrendingUp, Target, Shield, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import otterLogoNegativo from "@/assets/logo-otter-negativo.png";

const navigation = [
  { name: "Visão geral", href: "/dashboard", icon: Home },
  { name: "Cadastro", href: "/cadastro", icon: Plus },
  { name: "Portfólio", href: "/opcoes", icon: List },
  { name: "Lucros", href: "/lucros", icon: TrendingUp },
  { name: "Metas", href: "/metas", icon: Target },
  { name: "Garantias", href: "/garantias", icon: Shield },
];

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
          
          <div className="mt-auto pt-4 border-t border-blue-300">
            <div className="px-3 py-2 text-sm text-white/70 truncate mb-2">
              {user?.email}
            </div>
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-blue-200" style={{ backgroundColor: '#61005D' }}>
        <nav className="flex justify-around py-2">
          {navigation.map((item) => (
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
        </nav>
      </div>
    </>
  );
};