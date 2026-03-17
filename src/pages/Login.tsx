import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import Logo from '@/components/Logo';
import { OAuthButtons } from '@/components/OAuthButtons';
import SEO from '@/components/SEO';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Welcome back!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <SEO 
        title="Sign In" 
        description="Access your private diary and budget tracker. Securely sign in to MyDiary."
        canonical="https://journal.codebyjayanta.in/login"
      />
      {/* Decorative Blob */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[440px] z-10">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Back to home
          </Link>
          <ThemeToggle />
        </div>

        <div className="bg-card/95 backdrop-blur-xl border border-border rounded-[2rem] p-8 shadow-2xl relative">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mx-auto mb-4">
              <Logo size={56} className="drop-shadow-lg" />
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Welcome Back</h2>
            <p className="text-sm text-muted-foreground mt-1 font-medium">Log in to MyDiary.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 pr-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="flex justify-end mt-1">
                  <Link to="/forgot-password" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                    Forgot Password?
                  </Link>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 mt-2 rounded-xl shadow-md text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Secure Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center mb-5 mt-8">
            <div className="flex-grow border-t border-border" />
            <span className="mx-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 shrink-0">or</span>
            <div className="flex-grow border-t border-border" />
          </div>

          {/* OAuth Providers */}
          <div className="mb-6">
            <OAuthButtons mode="login" />
          </div>

          <div className="mt-8 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/register" className="font-semibold text-primary hover:underline">Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
