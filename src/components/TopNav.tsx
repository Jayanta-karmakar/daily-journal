import { NavLink, useLocation } from 'react-router-dom';
import { Home, PenSquare, BarChart3, Settings } from 'lucide-react';

const TopNav = () => {
  const linkClass = (isActive: boolean) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
    }`;

  return (
    <nav className="hidden md:flex items-center justify-center gap-1 bg-card border-b border-border px-6 py-3 sticky top-0 z-50">
      <NavLink to="/" className="flex items-center gap-1.5 mr-6">
        <span className="text-xl">📒</span>
        <span className="text-lg font-bold text-primary">MyDiary</span>
      </NavLink>
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
    </nav>
  );
};

export default TopNav;
