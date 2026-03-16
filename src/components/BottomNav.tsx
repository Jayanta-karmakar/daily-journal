import { NavLink } from 'react-router-dom';
import { Home, PenSquare, BarChart3, Settings, ShieldCheck } from 'lucide-react';
import { APP_ROUTES, AUTH_ROLES } from '@/config/constants';
import { useAppContext } from '@/context/AppContext';

const BottomNav = () => {
  const { profile } = useAppContext();
  const linkClass = (isActive: boolean) =>
    `flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
      isActive ? 'text-primary' : 'text-muted-foreground'
    }`;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-md border-t border-border px-2 py-3 z-50 flex justify-around">
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
      {profile?.role === AUTH_ROLES.ADMIN && (
        <NavLink to={APP_ROUTES.ADMIN} className={({ isActive }) => linkClass(isActive)}>
          <ShieldCheck size={20} />
          <span>Admin</span>
        </NavLink>
      )}
    </nav>
  );
};

export default BottomNav;
