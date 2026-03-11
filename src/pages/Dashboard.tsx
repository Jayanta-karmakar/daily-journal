import { useNavigate } from 'react-router-dom';
import { Plus, Settings as SettingsIcon } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import {
  getMonthTotalSpend, getMonthTotalInvested, getRemaining, getWorkingDays,
  getGymDays, getGymStreak, getZeroSpendDays,
} from '@/data/calculations';
import StatsCard from '@/components/StatsCard';
import BudgetBar from '@/components/BudgetBar';
import EntryCard from '@/components/EntryCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { entries, config } = useAppContext();

  const totalSpend = getMonthTotalSpend(entries);
  const totalInvested = getMonthTotalInvested(entries);
  const remaining = getRemaining(config.salary, totalSpend);
  const workingDays = getWorkingDays(entries);
  const gymDays = getGymDays(entries);
  const { current: currentStreak, best: bestStreak } = getGymStreak(entries);
  const zeroSpendDays = getZeroSpendDays(entries);

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-[900px] mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📒</span>
          <h1 className="text-xl font-bold text-primary">MyDiary</h1>
        </div>
        <p className="text-lg font-semibold text-foreground">March 2026</p>
        <button onClick={() => navigate('/settings')} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <SettingsIcon size={20} className="text-muted-foreground" />
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        <StatsCard label="Salary" value={config.salary} />
        <StatsCard label="Spent" value={totalSpend} variant="danger" />
        <StatsCard label="Invested" value={totalInvested} variant="investment" />
        <StatsCard label="Remaining" value={remaining} variant="success" />
      </div>

      {/* Budget Bar */}
      <div className="mb-4">
        <BudgetBar spent={totalSpend} budget={config.monthlyBudget} />
      </div>

      {/* Gym Stats */}
      <div className="bg-card rounded-xl border border-border p-4 shadow-sm mb-4">
        <div className="flex gap-6 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Gym this month</p>
            <p className="text-lg font-bold text-foreground">💪 {gymDays} / {workingDays} days</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Current streak</p>
            <p className="text-lg font-bold text-foreground">🔥 {currentStreak} days</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Best streak</p>
            <p className="text-lg font-bold text-foreground">🏆 {bestStreak} days</p>
          </div>
        </div>
      </div>

      {/* Zero spend */}
      {zeroSpendDays > 0 && (
        <div className="bg-success/10 rounded-xl border border-success/30 p-3 mb-4 text-center">
          <p className="text-sm font-medium text-success">✅ {zeroSpendDays} zero-spend day{zeroSpendDays > 1 ? 's' : ''} this month</p>
        </div>
      )}

      {/* Entries */}
      <h2 className="text-lg font-bold text-foreground mb-3">📝 Entries — March 2026</h2>
      <div className="flex flex-col gap-3">
        {sorted.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/new')}
        className="fixed bottom-20 md:bottom-8 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow z-40"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

export default Dashboard;
