import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navigationLinks = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/forms", label: "Formulários", icon: "📄" },
  { to: "/plans", label: "Planos", icon: "💳" },
  { to: "/ai-settings", label: "Configurar IA", icon: "🤖" },
  { to: "/reports/overview", label: "Relatórios", icon: "📊" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col">
      <div className="text-2xl font-bold p-4 border-b border-slate-800">NexForm</div>
      <nav className="flex-1 p-4 space-y-2">
        {navigationLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="flex items-center gap-2 p-2 rounded hover:bg-slate-800 transition"
          >
            <span aria-hidden="true">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full bg-slate-800 hover:bg-slate-700 p-2 rounded transition"
        >
          🚪 Sair
        </button>
      </div>
    </aside>
  );
}
