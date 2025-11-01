import { useContext, useMemo } from "react";
import { Bell, Search, User } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar({ title = "Dashboard" }) {
  const { user } = useContext(AuthContext);

  const userName = user?.name || user?.email || "Utilizador";
  const initials = useMemo(() => {
    if (!userName) return "";
    return userName
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  }, [userName]);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-8 py-4 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
        <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500 transition focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-200 md:flex md:w-72">
          <Search className="mr-3 h-4 w-4 text-slate-400" />
          <input
            type="search"
            placeholder="Pesquisar..."
            className="w-full bg-transparent text-slate-600 placeholder-slate-400 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          type="button"
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:text-violet-600"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 text-[10px] font-semibold text-white">
            3
          </span>
        </button>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm shadow-violet-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-semibold text-white">
            {initials || <User className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">{userName}</p>
            <p className="text-xs text-slate-400">Bem-vindo(a)!</p>
          </div>
        </div>
      </div>
    </header>
  );
}
