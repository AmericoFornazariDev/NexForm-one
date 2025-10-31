export default function Navbar({ userName, onLogout, isLoadingProfile }) {
  return (
    <header className="flex h-16 items-center justify-between bg-white px-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-slate-500">Olá,</p>
        <p className="text-lg font-semibold text-slate-900">
          {isLoadingProfile ? "Carregando..." : userName || "Utilizador"}
        </p>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        Sair
      </button>
    </header>
  );
}
