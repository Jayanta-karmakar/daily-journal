import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Activity, ShieldAlert, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
      toast.success('Password updated successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-[440px] z-10">
        <div className="flex items-center justify-end mb-6 sm:mb-8">
          <ThemeToggle />
        </div>
        
        <div className="bg-card/95 backdrop-blur-xl border border-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          {success ? (
            <div className="text-center py-6 space-y-6">
              <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-success/10 border-4 border-success/20 animate-bounce">
                <CheckCircle2 size={40} strokeWidth={2.5} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground tracking-tight">Security Updated</h2>
                <p className="text-sm text-muted-foreground font-medium">
                  Your password has been reset successfully. <br/>
                  Redirecting to login...
                </p>
              </div>
              <div className="p-4 bg-muted/30 rounded-2xl border border-border">
                <p className="text-xs text-muted-foreground">You can now use your new password to securely access your diary.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center px-4">
                <div className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                  <ShieldAlert size={28} strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">New Password</h2>
                <p className="text-sm text-muted-foreground mt-1 font-medium">Set a strong password to protect your MyDiary.</p>
              </div>

              <form onSubmit={handleReset} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 ml-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3.5 rounded-xl border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium pr-11"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 ml-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3.5 rounded-xl border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium pr-11"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-4 mt-4 rounded-xl shadow-lg text-sm font-black text-primary-foreground bg-primary hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 uppercase tracking-widest"
                >
                  {loading ? 'Updating...' : 'Secure My Account'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
