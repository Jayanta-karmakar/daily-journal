import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
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

  const currentMonthEntries = entries.filter((e) => {
    const entryMonth = e.date.slice(0, 7);
    return entryMonth === config.month;
  });

  const totalSpend = getMonthTotalSpend(currentMonthEntries);
  const totalInvested = getMonthTotalInvested(currentMonthEntries);
  const remaining = getRemaining(config.salary, totalSpend);
  const workingDays = getWorkingDays(currentMonthEntries);
  const gymDays = getGymDays(currentMonthEntries);
  const { current: currentStreak, best: bestStreak } = getGymStreak(currentMonthEntries);
  const zeroSpendDays = getZeroSpendDays(currentMonthEntries);

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  // Group entries by 'YYYY-MM'
  const groupedEntries = sorted.reduce((acc, entry) => {
    const monthYearStr = entry.date.slice(0, 7); // e.g. "2026-03"
    if (!acc[monthYearStr]) acc[monthYearStr] = [];
    acc[monthYearStr].push(entry);
    return acc;
  }, {} as Record<string, typeof entries>);

  const groupKeys = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a));

  const formatMonthYear = (yyyy_mm: string) => {
    if (!yyyy_mm) return '';
    const [year, month] = yyyy_mm.split('-');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
  };

  const currentMonthDisplay = config?.month ? formatMonthYear(config.month) : new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-lg font-semibold text-muted-foreground">{currentMonthDisplay}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatsCard label="Salary" value={config.salary} />
        <StatsCard label="Spent" value={totalSpend} variant="danger" />
        <StatsCard label="Invested" value={totalInvested} variant="investment" />
        <StatsCard label="Remaining" value={remaining} variant="success" />
      </div>

      {/* Budget + Gym row on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Budget Bar */}
        <div>
          <BudgetBar spent={totalSpend} budget={config.monthlyBudget} />
        </div>

        {/* Gym Stats */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Gym this month</p>
              <p className="text-lg font-bold text-foreground">💪 {gymDays} / {workingDays}</p>
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
      </div>

      {/* Zero spend */}
      {zeroSpendDays > 0 && (
        <div className="bg-success/10 rounded-xl border border-success/30 p-3 mb-4 text-center">
          <p className="text-sm font-medium text-success">✅ {zeroSpendDays} zero-spend day{zeroSpendDays > 1 ? 's' : ''} this month</p>
        </div>
      )}

      {/* Entries */}
      <div className="space-y-8 mt-6">
        {groupKeys.map((monthYearStr) => (
          <div key={monthYearStr}>
            <h2 className="text-lg font-bold text-foreground mb-3 border-b border-border pb-2">
              📝 {formatMonthYear(monthYearStr)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {groupedEntries[monthYearStr].map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        ))}
        {groupKeys.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No entries found. Click the + button to add one!
          </div>
        )}
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
