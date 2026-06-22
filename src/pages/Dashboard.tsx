import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, ChevronDown, Wallet, TrendingUp, PiggyBank, Gauge } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import {
  getMonthTotalSpend, getMonthTotalInvested, getRemaining, getWorkingDays,
  getGymDays, getGymStreak, getZeroSpendDays, getDaysOverLimit, getBudgetPercentage,
} from '@/data/calculations';
import StatsCard from '@/components/StatsCard';
import BudgetBar from '@/components/BudgetBar';
import EntryCard from '@/components/EntryCard';

// How many month-groups render up front, and how many more get revealed
// each time the user scrolls near the bottom (or clicks "Load more").
// Keeps the initial render light even when a journal spans many years
// of daily entries.
const MONTHS_PER_PAGE = 2;

const Dashboard = () => {
  const navigate = useNavigate();
  const { entries, config } = useAppContext();
  const [visibleMonthCount, setVisibleMonthCount] = useState(MONTHS_PER_PAGE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const currentMonthEntries = entries.filter((e) => {
    const entryMonth = e.date.slice(0, 7);
    return entryMonth === config.month;
  });

  const totalSpend = getMonthTotalSpend(currentMonthEntries);
  const totalInvested = getMonthTotalInvested(currentMonthEntries);
  const remaining = getRemaining(config.monthlyBudget, totalSpend);
  const workingDays = getWorkingDays(currentMonthEntries);
  const gymDays = getGymDays(currentMonthEntries);
  const { current: currentStreak, best: bestStreak } = getGymStreak(currentMonthEntries);
  const zeroSpendDays = getZeroSpendDays(currentMonthEntries);
  const budgetUsedPct = Math.round(getBudgetPercentage(totalSpend, config.monthlyBudget));
  const overLimitDays = getDaysOverLimit(currentMonthEntries, config.dailySpendLimit);
  const isOverBudget = remaining < 0;

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  // Group entries by 'YYYY-MM'
  const groupedEntries = useMemo(() => {
    return sorted.reduce((acc, entry) => {
      const monthYearStr = entry.date.slice(0, 7); // e.g. "2026-03"
      if (!acc[monthYearStr]) acc[monthYearStr] = [];
      acc[monthYearStr].push(entry);
      return acc;
    }, {} as Record<string, typeof entries>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  const groupKeys = useMemo(
    () => Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a)),
    [groupedEntries]
  );

  const visibleGroupKeys = groupKeys.slice(0, visibleMonthCount);
  const hasMoreMonths = visibleMonthCount < groupKeys.length;

  // Auto-reveal more months as the sentinel scrolls into view, with a
  // manual "Load more" button underneath as a fallback for browsers/
  // assistive tech where IntersectionObserver behaves unpredictably.
  useEffect(() => {
    if (!hasMoreMonths) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (observerEntries) => {
        if (observerEntries[0]?.isIntersecting) {
          setVisibleMonthCount((c) => Math.min(c + MONTHS_PER_PAGE, groupKeys.length));
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMoreMonths, groupKeys.length]);

  const formatMonthYear = (yyyy_mm: string) => {
    if (!yyyy_mm) return '';
    const [year, month] = yyyy_mm.split('-');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
  };

  const currentMonthDisplay = config?.month ? formatMonthYear(config.month) : new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 py-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-lg font-semibold text-muted-foreground">{currentMonthDisplay}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatsCard
          label="Spent"
          value={totalSpend}
          variant="danger"
          icon={Wallet}
          subtext={`${budgetUsedPct}% of budget used`}
        />
        <StatsCard
          label="Invested"
          value={totalInvested}
          variant="investment"
          icon={TrendingUp}
          subtext="Wealth building phase"
        />
        <StatsCard
          label="Remaining"
          value={remaining}
          variant={isOverBudget ? 'danger' : 'success'}
          icon={PiggyBank}
          subtext={isOverBudget ? 'Over monthly budget' : 'On track this month'}
        />
        <StatsCard
          label="Daily Limit"
          value={config.dailySpendLimit}
          variant="warning"
          icon={Gauge}
          subtext={`${overLimitDays} day${overLimitDays !== 1 ? 's' : ''} over this month`}
        />
      </div>

      {/* Budget + Gym row on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Budget Bar */}
        <div>
          <BudgetBar spent={totalSpend} budget={config.monthlyBudget} />
        </div>

        {/* Gym Stats */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <div className="grid grid-cols-3 divide-x divide-border">
            <div className="pr-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Gym this month</p>
              <p className="text-lg font-bold text-foreground">💪 {gymDays} / {workingDays}</p>
            </div>
            <div className="px-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Current streak</p>
              <p className="text-lg font-bold text-foreground">🔥 {currentStreak} days</p>
            </div>
            <div className="pl-4">
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
        {visibleGroupKeys.map((monthYearStr) => (
          <div key={monthYearStr}>
            <h2 className="text-lg font-bold text-foreground mb-3 border-b border-border pb-2">
              📝 {formatMonthYear(monthYearStr)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
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

        {hasMoreMonths && (
          <div ref={sentinelRef} className="flex justify-center py-2">
            <button
              onClick={() => setVisibleMonthCount((c) => Math.min(c + MONTHS_PER_PAGE, groupKeys.length))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground bg-muted hover:bg-muted/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Load more months <ChevronDown size={14} />
            </button>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/new')}
        aria-label="Add new entry"
        className="fixed bottom-20 md:bottom-8 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow z-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

export default Dashboard;
