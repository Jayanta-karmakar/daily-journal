import { NavLink } from 'react-router-dom';
import { Home, PenSquare, BarChart3, Settings } from 'lucide-react';
import { APP_ROUTES } from '@/config/constants';

const BottomNav = () => {
  const linkClass = (isActive: boolean) =>
    `flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
      isActive ? 'text-primary' : 'text-muted-foreground'
    }`;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2 z-50 flex justify-around">
      <NavLink to={APP_ROUTES.HOME} className={({ isActive }) => linkClass(isActive)}>
        <Home size={20} />
        <span>Home</span>
      </NavLink>
      <NavLink to={APP_ROUTES.NEW_ENTRY} className={({ isActive }) => linkClass(isActive)}>
        <PenSquare size={20} />
        <span>New</span>
      </NavLink>
      <NavLink to={APP_ROUTES.SUMMARY} className={({ isActive }) => linkClass(isActive)}>
        <BarChart3 size={20} />
        <span>Summary</span>
      </NavLink>
      <NavLink to={APP_ROUTES.SETTINGS} className={({ isActive }) => linkClass(isActive)}>
        <Settings size={20} />
        <span>Settings</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
