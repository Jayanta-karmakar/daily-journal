import { Link } from 'react-router-dom';
import { Github, Twitter, Mail } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card pt-24 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand Column */}
          <div className="space-y-8">
            <div className="flex items-center gap-2 group">
              <Logo size={32} className="transition-transform duration-200 group-hover:scale-110" />
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent uppercase">MyDiary</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
              The complete daily journal and budget ledger designed for individuals who value privacy and progress above all else.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-sm">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-sm">
                <Github size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-sm">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="font-black text-foreground uppercase tracking-widest text-xs mb-8">Product</h4>
            <ul className="space-y-4">
              <li><a href="/#features" className="text-sm text-muted-foreground hover:text-primary transition-colors font-bold tracking-tight">Core Features</a></li>
              <li><Link to="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors font-bold tracking-tight">Pricing</Link></li>
              <li><Link to="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors font-bold tracking-tight">Register</Link></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="font-black text-foreground uppercase tracking-widest text-xs mb-8">Resources</h4>
            <ul className="space-y-4">
              <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors font-bold tracking-tight">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-black text-foreground uppercase tracking-widest text-xs mb-8">Legal</h4>
            <ul className="space-y-4">
              <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors font-bold tracking-tight">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors font-bold tracking-tight">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} MyDiary Open Source. Built for Progress.
          </p>
          <div className="flex gap-8">
            <div className="flex items-center gap-2 text-[10px] font-black text-success uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
              All Systems Operational
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
