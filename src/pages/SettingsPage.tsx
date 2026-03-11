import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { formatCurrency } from '@/data/calculations';
import { toast } from 'sonner';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { config, setConfig } = useAppContext();
  const [salary, setSalary] = useState(config.salary.toString());
  const [limit, setLimit] = useState(config.dailySpendLimit.toString());
  const [budget, setBudget] = useState(config.monthlyBudget.toString());

  const handleSave = () => {
    setConfig({
      ...config,
      salary: parseInt(salary) || 0,
      dailySpendLimit: parseInt(limit) || 0,
      monthlyBudget: parseInt(budget) || 0,
    });
    toast.success('Settings saved!');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
          <ArrowLeft size={16} className="inline mr-1" /> Back
        </button>
        <h1 className="text-xl font-bold text-foreground">⚙️ Settings</h1>
      </div>

      <section className="bg-card rounded-xl border border-border p-5 shadow-sm mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">💰 Budget Configuration</h2>
        
        <label className="block mb-4">
          <span className="text-sm font-semibold text-primary">Monthly Salary (₹)</span>
          <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)}
            className="w-full mt-1 px-3 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <span className="text-xs text-muted-foreground">Your monthly take-home salary.</span>
        </label>

        <label className="block mb-4">
          <span className="text-sm font-semibold text-primary">Daily Spend Limit (₹)</span>
          <input type="number" value={limit} onChange={(e) => setLimit(e.target.value)}
            className="w-full mt-1 px-3 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <span className="text-xs text-muted-foreground">Entries exceeding this will be flagged as over-limit.</span>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-primary">Monthly Budget (₹)</span>
          <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)}
            className="w-full mt-1 px-3 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <span className="text-xs text-muted-foreground">Total monthly spending budget (Need + Want only).</span>
        </label>
      </section>

      <section className="bg-card rounded-xl border border-border p-5 shadow-sm mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-3">ℹ️ Current Values</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Salary</span><span className="font-semibold">{formatCurrency(parseInt(salary) || 0)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Daily Limit</span><span className="font-semibold">{formatCurrency(parseInt(limit) || 0)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Monthly Budget</span><span className="font-semibold">{formatCurrency(parseInt(budget) || 0)}</span></div>
        </div>
      </section>

      <button onClick={handleSave}
        className="w-full py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors shadow-md">
        💾 Save Settings
      </button>
      <p className="text-center text-xs text-muted-foreground mt-2">Changes are saved for the current session only.</p>
    </div>
  );
};

export default SettingsPage;
