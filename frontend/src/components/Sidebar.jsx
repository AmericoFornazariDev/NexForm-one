import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bot,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Settings,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navigationLinks = [
  { to: "/dashboard", match: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/forms", match: "/forms", label: "Formulários", icon: FileText },
  { to: "/reports/overview", match: "/reports", label: "Relatórios", icon: BarChart3 },
  { to: "/ai-settings", match: "/ai-settings", label: "Configurar IA", icon: Bot },
  { to: "/plans", match: "/plans", label: "Planos", icon: CreditCard },
  { to: "/settings", match: "/settings", label: "Definições", icon: Settings, disabled: true },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="hidden h-screen w-72 shrink-0 flex-col justify-between bg-white p-6 shadow-lg shadow-violet-100 transition-all duration-300 ease-in-out lg:flex">
      <div>
        <Link to="/dashboard" className="block">
          <span className="text-3xl font-semibold text-violet-700">NexForm</span>
        </Link>
        <nav className="mt-8 space-y-2">
          {navigationLinks.map(({ to, match, label, icon: Icon, disabled }) => {
            const isActive = !disabled && location.pathname.startsWith(match);
            const baseClasses =
              "group flex items-center rounded-2xl px-4 py-3 font-medium transition-all duration-300 ease-in-out";

            if (disabled) {
              return (
                <div
                  key={label}
                  className={`${baseClasses} cursor-not-allowed bg-slate-100/60 text-slate-400`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {label} <span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 text-xs">Brevemente</span>
                </div>
              );
            }

            return (
              <Link
                key={to}
                to={to}
                className={`${baseClasses} ${
                  isActive
                    ? "bg-violet-50 text-violet-700 shadow-inner shadow-violet-100"
                    : "text-slate-600 hover:-translate-y-0.5 hover:bg-slate-100"
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? "text-violet-600" : "text-violet-500"}`} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3">
        <Link
          to="/forms"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 px-5 py-3 font-medium text-white shadow-lg shadow-violet-200 transition-all duration-300 hover:shadow-xl hover:shadow-violet-300"
        >
          <PlusCircle className="h-5 w-5" />
          Novo Formulário
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </div>
    </aside>
  );
}
