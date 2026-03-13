import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, LogOut, Wallet, Palette, Save, Trash2, Calendar, Filter } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { formatCurrency } from '@/data/calculations';
import { toast } from 'sonner';
import { useTheme } from '@/components/theme-provider';
import { ImportSection } from '@/components/import/ImportSection';
import { ConfirmModal } from '@/components/ConfirmModal';
import { format, parseISO } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { entries, config, setConfig, logout, deleteAllEntries, deleteMonthEntries, deleteYearEntries } = useAppContext();
  const { theme, setTheme } = useTheme();
  
  const [salary, setSalary] = useState(config.salary.toString());
  const [limit, setLimit] = useState(config.dailySpendLimit.toString());
  const [budget, setBudget] = useState(config.monthlyBudget.toString());
  
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [showDeleteMonthModal, setShowDeleteMonthModal] = useState(false);
  const [showDeleteYearModal, setShowDeleteYearModal] = useState(false);
  
  const [targetMonth, setTargetMonth] = useState<string>('');
  const [targetYear, setTargetYear] = useState<string>('');

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    entries.forEach(e => years.add(e.date.split('-')[0]));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [entries]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    entries.forEach(e => months.add(e.date.slice(0, 7)));
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [entries]);

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
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 pb-24 md:pb-12 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-colors bg-card shadow-sm">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-foreground/60 hidden sm:block">Manage your app preferences and data</p>
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
                 <p className="text-xs sm:text-sm text-foreground/60 mt-0.5">Manage your monthly financial plan</p>
               </div>
            </div>
          </div>
          <div className="p-6 md:p-8">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <label className="block">
                  <span className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em] mb-3 block">Monthly Salary</span>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm group-focus-within:text-primary transition-colors">₹</span>
                    <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)}
                      className="w-full pl-9 pr-4 py-4 rounded-2xl border border-border bg-background text-base font-black focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" />
                  </div>
                  <div className="flex justify-between items-center mt-3 px-1">
                    <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-tighter">Net take-home</span>
                    <span className="text-xs font-black text-primary bg-primary/5 px-2 py-1 rounded-lg">{formatCurrency(parseInt(salary) || 0)}</span>
                  </div>
                </label>

                <label className="block">
                  <span className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em] mb-3 block">Daily Spend Limit</span>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm group-focus-within:text-primary transition-colors">₹</span>
                    <input type="number" value={limit} onChange={(e) => setLimit(e.target.value)}
                      className="w-full pl-9 pr-4 py-4 rounded-2xl border border-border bg-background text-base font-black focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" />
                  </div>
                  <div className="flex justify-between items-center mt-3 px-1">
                     <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-tighter">Threshold flag</span>
                     <span className="text-xs font-black text-primary bg-primary/5 px-2 py-1 rounded-lg">{formatCurrency(parseInt(limit) || 0)}</span>
                  </div>
                </label>

                <label className="block">
                  <span className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em] mb-3 block">Monthly Budget</span>
                   <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm group-focus-within:text-primary transition-colors">₹</span>
                    <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)}
                      className="w-full pl-9 pr-4 py-4 rounded-2xl border border-border bg-background text-base font-black focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" />
                  </div>
                  <div className="flex justify-between items-center mt-3 px-1">
                    <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-tighter">Combined (N+W)</span>
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
              <p className="text-xs sm:text-sm text-foreground/60 mt-0.5">Customize the app's visual style</p>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4 max-w-lg">
               <div>
                 <span className="text-sm font-bold text-foreground block">App Theme</span>
                 <span className="text-xs text-foreground/60">Switch between light and dark modes.</span>
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
        <section className="bg-destructive/5 rounded-[32px] border border-destructive/20 shadow-sm overflow-hidden mt-12 pb-8">
          <div className="p-5 sm:p-6 border-b border-destructive/10 bg-destructive/5 flex items-center gap-4">
            <div className="p-2.5 bg-destructive/10 text-destructive rounded-xl hidden sm:block">
              <Trash2 size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-destructive">Danger Zone</h2>
              <p className="text-xs sm:text-sm text-destructive/70 mt-0.5">Irreversible actions for your data management</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-6 p-6 md:p-8">
             {/* Delete Monthly */}
             <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 bg-background rounded-2xl border border-border/50">
               <div className="max-w-md">
                 <div className="flex items-center gap-2 mb-1">
                    <Calendar size={16} className="text-destructive" />
                    <span className="text-sm font-bold text-foreground block">Delete Monthly Records</span>
                 </div>
                 <span className="text-xs text-foreground/60">Select a specific month to wipe out all recorded entries and expenses. Useful for restarting a month.</span>
               </div>
               
               <div className="flex items-center gap-3">
                 <Select value={targetMonth} onValueChange={setTargetMonth}>
                    <SelectTrigger className="w-[160px] h-11 rounded-xl bg-muted border-none shadow-none text-xs font-bold">
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMonths.map(m => (
                        <SelectItem key={m} value={m} className="text-xs font-medium">
                          {format(parseISO(`${m}-01`), 'MMMM yyyy')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                 </Select>
                 <button
                   disabled={!targetMonth}
                   onClick={() => setShowDeleteMonthModal(true)}
                   className="px-6 h-11 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Delete Month
                 </button>
               </div>
             </div>

             {/* Delete Yearly */}
             <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 bg-background rounded-2xl border border-border/50">
               <div className="max-w-md">
                 <div className="flex items-center gap-2 mb-1">
                    <Filter size={16} className="text-destructive" />
                    <span className="text-sm font-bold text-foreground block">Clear Annual Data</span>
                 </div>
                 <span className="text-xs text-foreground/60">Permanently remove all records for an entire calendar year. Use with extreme caution.</span>
               </div>
               
               <div className="flex items-center gap-3">
                 <Select value={targetYear} onValueChange={setTargetYear}>
                    <SelectTrigger className="w-[120px] h-11 rounded-xl bg-muted border-none shadow-none text-xs font-bold">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map(y => (
                        <SelectItem key={y} value={y} className="text-xs font-bold">{y}</SelectItem>
                      ))}
                    </SelectContent>
                 </Select>
                 <button
                   disabled={!targetYear}
                   onClick={() => setShowDeleteYearModal(true)}
                   className="px-6 h-11 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Clear Year
                 </button>
               </div>
             </div>

             {/* Clear All */}
             <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 pt-4">
               <div>
                 <span className="text-sm font-bold text-foreground block">Reset All Diary Data</span>
                 <span className="text-xs text-foreground/60">This will permanently delete all your journal entries and expense records across all time.</span>
               </div>
               <button
                 onClick={() => setShowClearAllModal(true)}
                 className="px-6 py-3 w-full sm:w-auto rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all flex items-center justify-center gap-2 font-black uppercase tracking-widest shadow-lg text-xs"
               >
                 <Trash2 size={16} />
                 Clear Everything
               </button>
             </div>
          </div>
        </section>

        <ConfirmModal 
          isOpen={showClearAllModal}
          onClose={() => setShowClearAllModal(false)}
          onConfirm={deleteAllEntries}
          title="Clear all records?"
          message="This action is permanent and will completely erase your entire history. You cannot undo this."
          confirmText="Clear Everything"
          variant="danger"
        />

        <ConfirmModal 
          isOpen={showDeleteMonthModal}
          onClose={() => setShowDeleteMonthModal(false)}
          onConfirm={() => {
            deleteMonthEntries(targetMonth);
            setShowDeleteMonthModal(false);
          }}
          title={`Delete records for ${targetMonth}?`}
          message={`Are you sure you want to delete all entries and expenses for ${targetMonth}? Other months will remain untouched.`}
          confirmText="Yes, Delete Month"
          variant="danger"
        />

        <ConfirmModal 
          isOpen={showDeleteYearModal}
          onClose={() => setShowDeleteYearModal(false)}
          onConfirm={() => {
            deleteYearEntries(targetYear);
            setShowDeleteYearModal(false);
          }}
          title={`Clear entire year ${targetYear}?`}
          message={`This will delete every single record from Jan 1st to Dec 31st of ${targetYear}. This cannot be undone.`}
          confirmText="Wipe Year Data"
          variant="danger"
        />

      </div>
    </div>
  );
};

export default SettingsPage;

