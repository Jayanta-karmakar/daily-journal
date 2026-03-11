import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, LogOut } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { formatCurrency } from '@/data/calculations';
import { toast } from 'sonner';
import { useTheme } from '@/components/theme-provider';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { config, setConfig, logout } = useAppContext();
  const { theme, setTheme } = useTheme();
  
  const [salary, setSalary] = useState(config.salary.toString());
  const [limit, setLimit] = useState(config.dailySpendLimit.toString());
  const [budget, setBudget] = useState(config.monthlyBudget.toString());

  const handleSave = async () => {
    await setConfig({
      ...config,
      salary: parseInt(salary) || 0,
      dailySpendLimit: parseInt(limit) || 0,
      monthlyBudget: parseInt(budget) || 0,
    });
    toast.success('Settings saved!');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
            <ArrowLeft size={16} className="inline mr-1" /> Back
          </button>
          <h1 className="text-xl font-bold text-foreground">⚙️ Settings</h1>
        </div>
        <button onClick={handleLogout} className="px-3 py-2 rounded-lg border border-destructive/50 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors flex items-center gap-2">
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          <section className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">💰 Budget Configuration</h2>
            
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-primary">Monthly Salary (₹)</span>
                <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)}
                  className="w-full mt-1 px-3 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <span className="text-xs text-muted-foreground mt-1 inline-block">Your monthly take-home salary.</span>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-primary">Daily Spend Limit (₹)</span>
                <input type="number" value={limit} onChange={(e) => setLimit(e.target.value)}
                  className="w-full mt-1 px-3 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <span className="text-xs text-muted-foreground mt-1 inline-block">Entries exceeding this will be flagged as over-limit.</span>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-primary">Monthly Budget (₹)</span>
                <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)}
                  className="w-full mt-1 px-3 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <span className="text-xs text-muted-foreground mt-1 inline-block">Total monthly spending budget (Need + Want only).</span>
              </label>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <section className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-3">ℹ️ Current Values</h2>
            <div className="space-y-4 text-sm mt-4">
              <div className="flex justify-between items-center pb-2 border-b border-border/50"><span className="text-muted-foreground">Salary</span><span className="font-semibold text-lg">{formatCurrency(parseInt(salary) || 0)}</span></div>
              <div className="flex justify-between items-center pb-2 border-b border-border/50"><span className="text-muted-foreground">Daily Limit</span><span className="font-semibold text-lg">{formatCurrency(parseInt(limit) || 0)}</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Monthly Budget</span><span className="font-semibold text-lg">{formatCurrency(parseInt(budget) || 0)}</span></div>
            </div>
          </section>

          <section className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">🎨 Appearance</h2>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-primary block">Theme</span>
                <span className="text-xs text-muted-foreground">Switch between light and dark themes.</span>
              </div>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-3 rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-2"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={18} />
                    <span className="text-sm font-medium">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon size={18} />
                    <span className="text-sm font-medium">Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      </div>

      <button onClick={handleSave}
        className="w-full mt-6 py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors shadow-md">
        💾 Save Settings
      </button>
      <p className="text-center text-xs text-muted-foreground mt-2">Changes are synced to your account.</p>
    </div>
  );
};

export default SettingsPage;
