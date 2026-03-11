import { NavLink } from 'react-router-dom';
import { Home, PenSquare, BarChart3, Settings, User } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAppContext } from '@/context/AppContext';

const TopNav = () => {
  const { session } = useAppContext();
  
  const linkClass = (isActive: boolean) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
    }`;

  const displayName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'User';

  return (
    <nav className="flex items-center justify-between gap-1 bg-card border-b border-border px-4 md:px-6 py-3 sticky top-0 z-50">
      <NavLink to="/" className="flex items-center gap-1.5 md:mr-6">
        <span className="text-xl">📒</span>
        <span className="text-lg font-bold text-primary">MyDiary</span>
      </NavLink>
      <div className="hidden md:flex flex-1 justify-center gap-1">
        <NavLink to="/" className={({ isActive }) => linkClass(isActive)}>
          <Home size={16} /> Dashboard
        </NavLink>
        <NavLink to="/new" className={({ isActive }) => linkClass(isActive)}>
          <PenSquare size={16} /> New Entry
        </NavLink>
        <NavLink to="/month-summary" className={({ isActive }) => linkClass(isActive)}>
          <BarChart3 size={16} /> Summary
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => linkClass(isActive)}>
          <Settings size={16} /> Settings
        </NavLink>
      </div>
      <div className="ml-auto flex items-center gap-3">
        {session && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full border border-border">
            <User size={14} className="text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">{displayName}</span>
          </div>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default TopNav;
