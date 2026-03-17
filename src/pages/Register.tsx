import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import Logo from '@/components/Logo';
import { OAuthButtons } from '@/components/OAuthButtons';
import SEO from '@/components/SEO';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Native HTML5 form validation handles the 10-digit requirement via minLength/maxLength/pattern

    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone
        }
      }
    });

    if (error) {
      toast.error(error.message);
    } else if (data?.user?.identities?.length === 0) {
      toast.error('An account with this email already exists.');
    } else {
      toast.success('Account created! Please check your email to verify your account before logging in.', { duration: 6000 });
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <SEO 
        title="Create Account" 
        description="Join MyDiary today. Start your journey with the most secure personal journal and budget tracker."
        canonical="https://journal.codebyjayanta.in/register"
      />
      {/* Decorative Blob */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-[480px] z-10">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Back to home
          </Link>
          <ThemeToggle />
        </div>
        
        <div className="bg-card/95 backdrop-blur-xl border border-border rounded-[2rem] p-5 shadow-2xl relative">
          <div className="mb-4 text-center">
            <div className="flex items-center justify-center mx-auto mb-2">
              <Logo size={40} className="drop-shadow-lg" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Create Account</h2>
            <p className="text-sm text-muted-foreground mt-0.5 font-medium">Join MyDiary today.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-3">
            <div className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                    value={fullName}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Only allow letters and spaces
                      if (/^[a-zA-Z\s]*$/.test(val)) {
                        setFullName(val);
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    minLength={10}
                    maxLength={10}
                    pattern="\d{10}"
                    title="Please enter exactly 10 digits"
                    placeholder="Enter 10-digit number"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Only allow numeric input, and max 10 characters realtime
                      if (/^\d*$/.test(val) && val.length <= 10) {
                        setPhone(val);
                      }
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  title="Please enter a valid email address"
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">Choose Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 pr-11"
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
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 mt-1.5 rounded-xl shadow-md text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center mt-5 mb-4">
            <div className="flex-grow border-t border-border" />
            <span className="mx-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 shrink-0">or</span>
            <div className="flex-grow border-t border-border" />
          </div>

          {/* OAuth Providers */}
          <div className="mb-4">
            <OAuthButtons mode="register" />
          </div>

          <div className="mt-5 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-4 px-4">
          By registering, you agree to our strict zero-knowledge privacy policy.
        </p>
      </div>
    </div>
  );
}
