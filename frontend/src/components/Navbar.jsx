import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <span className="text-xl font-semibold text-slate-900">NexForm</span>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span className="hidden sm:inline">Olá, {user?.name ?? 'Comerciante'}</span>
          <button
            onClick={handleLogout}
            className="rounded-full bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
