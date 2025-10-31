import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navigationItems = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/forms", label: "Formulários", icon: "📄" },
  { to: "/plans", label: "Planos", icon: "💎" },
];

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <aside className="flex h-full w-64 flex-col bg-slate-900 text-slate-100">
      <div className="px-6 py-8 text-2xl font-bold">NexForm</div>

      <nav className="flex-1 space-y-1 px-4">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition ${
                isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <span className="text-lg" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 px-4 py-6">
        <p className="mb-3 truncate text-xs uppercase tracking-wide text-slate-500">
          {user?.email}
        </p>
        <button
          type="button"
          onClick={() => {
            onLogout?.();
            handleNavigate("/login");
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <span aria-hidden="true">🚪</span>
          Sair
        </button>
      </div>
    </aside>
  );
}
