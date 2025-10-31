import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/forms', label: 'Formulários' },
  { to: '/plans', label: 'Planos' }
];

const Sidebar = () => (
  <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-6 md:block">
    <nav className="space-y-2 text-sm font-medium text-slate-600">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `block rounded-lg px-4 py-2 transition ${
              isActive
                ? 'bg-slate-900 text-white'
                : 'hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
