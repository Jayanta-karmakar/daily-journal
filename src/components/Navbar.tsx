import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { APP_ROUTES } from '@/config/constants';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    // { name: 'Features', href: '/#features' },
    // { name: 'Pricing', href: '/pricing' },
    // { name: 'Contact', href: '/contact' },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b",
        scrolled
          ? "bg-background/80 backdrop-blur-md border-border/50 h-16"
          : "bg-transparent border-transparent h-20"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-full flex items-center justify-between">
        {/* Brand */}
        <Link to={APP_ROUTES.HOME} className="flex items-center gap-2 group shrink-0">
          <Logo size={scrolled ? 30 : 34} className="transition-transform duration-200 group-hover:scale-110" />
          <span className={cn(
            "font-bold tracking-tight bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent transition-all duration-300",
            scrolled ? "text-lg" : "text-xl"
          )}>
            MyDiary
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                "text-sm font-semibold transition-colors hover:text-primary",
                location.pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />

          <div className="hidden sm:flex items-center gap-4">
            <Link
              to={APP_ROUTES.LOGIN}
              className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              Log in
            </Link>
            <Link
              to={APP_ROUTES.REGISTER}
              className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2 group"
            >
              Get Started
              <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[-1] md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <nav className="absolute top-full left-0 w-full bg-background border-b border-border p-6 flex flex-col gap-6 md:hidden animate-in slide-in-from-top duration-300">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "text-lg font-bold transition-colors",
                  location.pathname === link.href ? "text-primary" : "text-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-border" />
            <div className="flex flex-col gap-4">
              <Link
                to={APP_ROUTES.LOGIN}
                className="text-lg font-bold text-foreground"
                onClick={() => setIsOpen(false)}
              >
                Log in
              </Link>
              <Link
                to={APP_ROUTES.REGISTER}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground text-center font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                onClick={() => setIsOpen(false)}
              >
                Get Started <ChevronRight size={20} />
              </Link>
            </div>

            {/* <div className="mt-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-primary" />
                <span className="text-sm font-bold">100% Free Forever</span>
              </div>
              <ChevronRight size={16} className="text-primary" />
            </div> */}
          </nav>
        </>
      )}
    </header>
  );
}
