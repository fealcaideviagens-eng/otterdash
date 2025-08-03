import { NavLink } from "react-router-dom";
import { Plus, List, Home, TrendingUp, LogOut, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Visão geral", href: "/", icon: Home },
  { name: "Cadastro", href: "/cadastro", icon: Plus },
  { name: "Portfólio", href: "/opcoes", icon: List },
  { name: "Lucros", href: "/lucros", icon: TrendingUp },
  { name: "Metas", href: "/metas", icon: Target },
];

export const Sidebar = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 h-screen flex-col border-r border-purple-200" style={{ backgroundColor: '#61005D' }}>
        <div className="flex h-16 items-center justify-center border-b border-purple-300 px-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white">ALCA+</h1>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1 p-4">
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
        </nav>
        
        {/* Logout Button */}
        <div className="p-4 border-t border-purple-300">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-white hover:bg-white/5 hover:text-white active:text-white focus:text-white btn-pill"
          >
            <LogOut className="mr-3 h-5 w-5 text-white" />
            Sair
          </Button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-purple-200" style={{ backgroundColor: '#61005D' }}>
        <nav className="flex justify-around py-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center px-3 py-2 text-xs font-medium transition-colors text-white min-w-0",
                  isActive
                    ? "text-purple-300"
                    : "hover:text-purple-300"
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