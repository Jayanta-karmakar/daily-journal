import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import {
  getMonthTotalSpend, getMonthTotalInvested, getRemaining, getWorkingDays,
  getGymDays, getDaysOverLimit, getZeroSpendDays, getBiggestExpense,
  getCategoryTotals, formatCurrency,
} from '@/data/calculations';

const MonthlySummary = () => {
  const navigate = useNavigate();
  const { entries, config } = useAppContext();

  const totalSpend = getMonthTotalSpend(entries);
  const totalInvested = getMonthTotalInvested(entries);
  const remaining = getRemaining(config.salary, totalSpend);
  const workingDays = getWorkingDays(entries);
  const gymDays = getGymDays(entries);
  const gymPct = workingDays > 0 ? Math.round((gymDays / workingDays) * 100) : 0;
  const overLimitDays = getDaysOverLimit(entries, config.dailySpendLimit);
  const zeroSpendDays = getZeroSpendDays(entries);
  const biggest = getBiggestExpense(entries);
  const categories = getCategoryTotals(entries);
  const totalAll = categories.need + categories.want + categories.investment + categories.savings;

  return (
    <div className="max-w-[900px] mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
          <ArrowLeft size={16} className="inline mr-1" /> Back
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">📊 Monthly Summary</h1>
          <p className="text-sm text-muted-foreground">March 2026</p>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total Earned', value: config.salary, color: 'text-primary' },
          { label: 'Total Spent', value: totalSpend, color: 'text-destructive' },
          { label: 'Total Invested', value: totalInvested, color: 'text-investment' },
          { label: 'Remaining', value: remaining, color: 'text-success' },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{formatCurrency(s.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Days over limit</p>
          <p className="text-xl font-bold mt-1 text-destructive">{overLimitDays} days</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Zero spend days</p>
          <p className="text-xl font-bold mt-1 text-foreground">{zeroSpendDays} days</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gym attendance</p>
          <p className="text-xl font-bold mt-1 text-primary">{gymDays} / {workingDays} ({gymPct}%)</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Biggest expense</p>
          <p className="text-xl font-bold mt-1 text-foreground">{biggest ? formatCurrency(biggest.amount) : '—'}</p>
        </div>
      </div>

      {biggest && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 mb-4">
          <p className="text-sm font-medium text-foreground">
            🏆 Biggest Expense: <strong className="text-destructive">{biggest.label}</strong> — {formatCurrency(biggest.amount)} ({biggest.type})
          </p>
        </div>
      )}

      {/* Category breakdown */}
      <section className="bg-card rounded-xl border border-border p-5 shadow-sm mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">🔖 Category Breakdown</h2>
        <div className="space-y-3">
          {[
            { label: 'Need', value: categories.need, color: 'bg-primary', textColor: 'text-primary' },
            { label: 'Want', value: categories.want, color: 'bg-warning', textColor: 'text-warning' },
            { label: 'Investment', value: categories.investment, color: 'bg-success', textColor: 'text-success' },
            { label: 'Savings', value: categories.savings, color: 'bg-investment', textColor: 'text-investment' },
          ].map((cat) => (
            <div key={cat.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${cat.color}`} />
                <span className="text-sm font-medium text-foreground">{cat.label}</span>
              </div>
              <span className={`text-sm font-bold ${cat.textColor}`}>{formatCurrency(cat.value)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-3 flex justify-between">
            <span className="text-sm font-bold text-foreground">Total</span>
            <span className="text-sm font-bold text-foreground">{formatCurrency(totalAll)}</span>
          </div>
        </div>
      </section>

      <div className="bg-card rounded-xl border border-border p-4 shadow-sm mb-4 flex justify-between">
        <span className="text-sm text-muted-foreground">Total entries logged</span>
        <span className="text-lg font-bold text-foreground">{entries.length} days</span>
      </div>

      <button onClick={() => navigate('/')}
        className="w-full py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-center">
        ← Back to Dashboard
      </button>
    </div>
  );
};

export default MonthlySummary;
