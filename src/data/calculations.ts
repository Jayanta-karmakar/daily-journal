import type { DayEntry, MonthConfig } from './mockData';

export const formatCurrency = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN')}`;

export const getMonthTotalSpend = (entries: DayEntry[]): number =>
  entries.reduce((s, e) => s + e.totalSpend, 0);

export const getMonthTotalInvested = (entries: DayEntry[]): number =>
  entries.reduce((s, e) => s + e.totalInvested, 0);

export const getRemaining = (salary: number, totalSpend: number): number =>
  salary - totalSpend;

export const getWorkingDays = (entries: DayEntry[]): number =>
  entries.filter((e) => e.day !== 'Sunday').length;

export const getGymDays = (entries: DayEntry[]): number =>
  entries.filter((e) => e.gymAttended === 'yes').length;

export const getGymStreak = (entries: DayEntry[]): { current: number; best: number } => {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  let current = 0;
  let foundNonClosed = false;
  for (const entry of sorted) {
    if (entry.gymAttended === 'closed') continue;
    if (entry.gymAttended === 'yes') {
      current++;
      foundNonClosed = true;
    } else {
      foundNonClosed = true;
      break;
    }
  }

  // best streak
  const chronological = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  let best = 0;
  let streak = 0;
  for (const entry of chronological) {
    if (entry.gymAttended === 'closed') continue;
    if (entry.gymAttended === 'yes') {
      streak++;
      best = Math.max(best, streak);
    } else {
      streak = 0;
    }
  }

  return { current, best };
};

export const getZeroSpendDays = (entries: DayEntry[]): number =>
  entries.filter((e) => e.totalSpend === 0).length;

export const getDaysOverLimit = (entries: DayEntry[], limit: number): number =>
  entries.filter((e) => e.totalSpend > limit).length;

export const getBiggestExpense = (entries: DayEntry[]): { label: string; amount: number; type: string } | null => {
  let biggest: { label: string; amount: number; type: string } | null = null;
  for (const entry of entries) {
    for (const exp of entry.expenses) {
      if (!biggest || exp.amount > biggest.amount) {
        biggest = { label: exp.label, amount: exp.amount, type: exp.type };
      }
    }
  }
  return biggest;
};

export const getCategoryTotals = (entries: DayEntry[]) => {
  const totals = { need: 0, want: 0, investment: 0, savings: 0 };
  for (const entry of entries) {
    for (const exp of entry.expenses) {
      totals[exp.type] += exp.amount;
    }
  }
  return totals;
};

export const getBudgetPercentage = (spent: number, budget: number): number =>
  budget > 0 ? (spent / budget) * 100 : 0;

export const getDayOfWeek = (dateStr: string): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date(dateStr).getDay()];
};

export const getDailyTrend = (entries: DayEntry[]) => {
  return [...entries].sort((a, b) => a.date.localeCompare(b.date)).map(e => ({
    date: e.date,
    spend: e.totalSpend,
    invested: e.totalInvested
  }));
};

export const getMonthlyTrend = (entries: DayEntry[]) => {
  const months: Record<string, { month: string, spend: number, invested: number }> = {};

  entries.forEach(e => {
    const monthKey = e.date.slice(0, 7); // YYYY-MM
    if (!months[monthKey]) {
      months[monthKey] = { month: monthKey, spend: 0, invested: 0 };
    }
    months[monthKey].spend += e.totalSpend;
    months[monthKey].invested += e.totalInvested;
  });

  return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
};
