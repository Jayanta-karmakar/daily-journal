import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, LogOut, Wallet, Palette, Save, Trash2 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { formatCurrency } from '@/data/calculations';
import { toast } from 'sonner';
import { useTheme } from '@/components/theme-provider';
import { ImportSection } from '@/components/import/ImportSection';
import { ConfirmModal } from '@/components/ConfirmModal';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { config, setConfig, logout, deleteAllEntries } = useAppContext();
  const { theme, setTheme } = useTheme();
  
  const [salary, setSalary] = useState(config.salary.toString());
  const [limit, setLimit] = useState(config.dailySpendLimit.toString());
  const [budget, setBudget] = useState(config.monthlyBudget.toString());
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  const handleSave = async () => {
    await setConfig({
      ...config,
      salary: parseInt(salary) || 0,
      dailySpendLimit: parseInt(limit) || 0,
      monthlyBudget: parseInt(budget) || 0,
    });
    toast.success('Settings saved successfully!');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 pb-24 md:pb-12">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-colors bg-card shadow-sm">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">Manage your app preferences and data</p>
          </div>
        </div>
        <button onClick={handleLogout} className="px-4 py-2.5 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm font-semibold hover:bg-destructive hover:text-destructive-foreground transition-all flex items-center gap-2">
          <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      <div className="space-y-8">
        {/* BUDGET CONFIGURATION */}
        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-border bg-muted/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="p-2.5 bg-primary/10 text-primary rounded-xl hidden sm:block">
                  <Wallet size={20} />
               </div>
               <div>
                 <h2 className="text-base sm:text-lg font-bold text-foreground">Budget Configuration</h2>
                 <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Manage your monthly financial plan</p>
               </div>
            </div>
          </div>
          <div className="p-6 md:p-8">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <label className="block">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">Monthly Salary</span>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm group-focus-within:text-primary transition-colors">₹</span>
                    <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)}
                      className="w-full pl-9 pr-4 py-4 rounded-2xl border border-border bg-background text-base font-black focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" />
                  </div>
                  <div className="flex justify-between items-center mt-3 px-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Net take-home</span>
                    <span className="text-xs font-black text-primary bg-primary/5 px-2 py-1 rounded-lg">{formatCurrency(parseInt(salary) || 0)}</span>
                  </div>
                </label>

                <label className="block">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">Daily Spend Limit</span>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm group-focus-within:text-primary transition-colors">₹</span>
                    <input type="number" value={limit} onChange={(e) => setLimit(e.target.value)}
                      className="w-full pl-9 pr-4 py-4 rounded-2xl border border-border bg-background text-base font-black focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" />
                  </div>
                  <div className="flex justify-between items-center mt-3 px-1">
                     <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Threshold flag</span>
                     <span className="text-xs font-black text-primary bg-primary/5 px-2 py-1 rounded-lg">{formatCurrency(parseInt(limit) || 0)}</span>
                  </div>
                </label>

                <label className="block">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">Monthly Budget</span>
                   <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm group-focus-within:text-primary transition-colors">₹</span>
                    <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)}
                      className="w-full pl-9 pr-4 py-4 rounded-2xl border border-border bg-background text-base font-black focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" />
                  </div>
                  <div className="flex justify-between items-center mt-3 px-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Combined (N+W)</span>
                    <span className="text-xs font-black text-primary bg-primary/5 px-2 py-1 rounded-lg">{formatCurrency(parseInt(budget) || 0)}</span>
                  </div>
                </label>
             </div>
             
             <div className="mt-8 flex justify-end">
               <button onClick={handleSave} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2">
                 <Save size={18} />
                 Save Budget Settings
               </button>
             </div>
          </div>
        </section>

        {/* APPEARANCE */}
        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-border bg-muted/10 flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl hidden sm:block">
              <Palette size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">Appearance</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Customize the app's visual style</p>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4 max-w-lg">
               <div>
                 <span className="text-sm font-bold text-foreground block">App Theme</span>
                 <span className="text-xs text-muted-foreground">Switch between light and dark modes.</span>
               </div>
               <button
                 onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                 className="px-5 py-3 w-full sm:w-auto rounded-xl border border-border bg-background hover:bg-muted transition-all flex items-center justify-center gap-2 font-semibold shadow-sm text-sm"
               >
                 {theme === 'dark' ? (
                   <>
                     <Sun size={18} />
                     Light Mode
                   </>
                 ) : (
                   <>
                     <Moon size={18} />
                     Dark Mode
                   </>
                 )}
               </button>
             </div>
          </div>
        </section>

        {/* DATA & INTEGRATIONS - Import Section */}
        <ImportSection />

        {/* DANGER ZONE */}
        <section className="bg-destructive/5 rounded-2xl border border-destructive/20 shadow-sm overflow-hidden mt-12">
          <div className="p-5 sm:p-6 border-b border-destructive/10 bg-destructive/5 flex items-center gap-4">
            <div className="p-2.5 bg-destructive/10 text-destructive rounded-xl hidden sm:block">
              <Trash2 size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-destructive">Danger Zone</h2>
              <p className="text-xs sm:text-sm text-destructive/70 mt-0.5">Irreversible actions for your data</p>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
             <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between w-full gap-4">
               <div>
                 <span className="text-sm font-bold text-foreground block">Clear All Diary Data</span>
                 <span className="text-xs text-muted-foreground">This will permanently delete all your journal entries and expense records.</span>
               </div>
               <button
                 onClick={() => setShowClearAllModal(true)}
                 className="px-6 py-3 w-full sm:w-auto rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all flex items-center justify-center gap-2 font-black uppercase tracking-widest shadow-lg text-xs"
               >
                 <Trash2 size={16} />
                 Clear All Data
               </button>
             </div>
          </div>
        </section>

        <ConfirmModal 
          isOpen={showClearAllModal}
          onClose={() => setShowClearAllModal(false)}
          onConfirm={deleteAllEntries}
          title="Clear all records?"
          message="This action is permanent and will completely erase your entire history, including journal entries and expenses. You cannot undo this."
          confirmText="Clear Everything"
          variant="danger"
        />

      </div>
    </div>
  );
};

export default SettingsPage;
