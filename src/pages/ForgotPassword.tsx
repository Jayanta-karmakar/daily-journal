import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Activity, ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
      toast.success('Reset link sent to your email!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-[440px] z-10">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Link to="/login" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Back to Login
          </Link>
          <ThemeToggle />
        </div>
        
        <div className="bg-card/95 backdrop-blur-xl border border-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          {success ? (
            <div className="text-center py-4 space-y-6">
              <div className="w-16 h-16 bg-success/10 text-success rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-success/10 border border-success/20">
                <ShieldCheck size={32} strokeWidth={2.5} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground tracking-tight">Check your email</h2>
                <p className="text-sm text-muted-foreground font-medium">
                  We've sent a password reset link to <br/>
                  <span className="text-foreground font-bold">{email}</span>
                </p>
              </div>
              <div className="pt-4">
                <p className="text-xs text-muted-foreground">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>
              <button 
                onClick={() => setSuccess(false)}
                className="text-sm font-bold text-primary hover:underline"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center px-4">
                <div className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                  <Mail size={28} strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">Forgot Password?</h2>
                <p className="text-sm text-muted-foreground mt-1 font-medium">No worries, we'll send you reset instructions.</p>
              </div>

              <form onSubmit={handleResetRequest} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3.5 rounded-xl border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/30 font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-4 rounded-xl shadow-lg text-sm font-black text-primary-foreground bg-primary hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 uppercase tracking-widest"
                >
                  {loading ? 'Sending link...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
