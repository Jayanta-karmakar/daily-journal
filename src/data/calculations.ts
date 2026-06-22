import type { DayEntry, MonthConfig } from './mockData';

export const formatCurrency = (amount: number, currencyCode: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getMonthTotalSpend = (entries: DayEntry[]): number =>
  entries.reduce((s, e) => s + e.totalSpend, 0);

export const getMonthTotalInvested = (entries: DayEntry[]): number =>
  entries.reduce((s, e) => s + e.totalInvested, 0);

export const getRemaining = (monthlyBudget: number, totalSpend: number): number =>
  monthlyBudget - totalSpend;

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

// Aggregates expense line-items by label (case/whitespace-insensitive),
// restricted to 'need'/'want' types so the totals line up with
// totalSpend (investment/savings transfers aren't "expenses" in that
// sense — including them would make e.g. a loan repayment look like
// the user's biggest "expense").
export const getTopExpenseLabels = (entries: DayEntry[], topN = 6) => {
  const totals = new Map<string, { label: string; total: number; count: number }>();
  for (const entry of entries) {
    for (const exp of entry.expenses) {
      if (exp.type !== 'need' && exp.type !== 'want') continue;
      const key = exp.label.trim().toLowerCase();
      if (!key) continue;
      const existing = totals.get(key);
      if (existing) {
        existing.total += exp.amount;
        existing.count += 1;
      } else {
        totals.set(key, { label: exp.label.trim(), total: exp.amount, count: 1 });
      }
    }
  }
  return Array.from(totals.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, topN);
};

export const WEEKDAY_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const getWeekdaySpending = (entries: DayEntry[]) => {
  const totals = new Map<string, { total: number; count: number }>(
    WEEKDAY_ORDER.map((day) => [day, { total: 0, count: 0 }])
  );
  for (const entry of entries) {
    const day = WEEKDAY_ORDER.includes(entry.day) ? entry.day : getDayOfWeek(entry.date);
    const bucket = totals.get(day);
    if (bucket) {
      bucket.total += entry.totalSpend;
      bucket.count += 1;
    }
  }
  return WEEKDAY_ORDER.map((day) => {
    const bucket = totals.get(day)!;
    return {
      day,
      shortDay: day.slice(0, 3),
      total: bucket.total,
      count: bucket.count,
      avg: bucket.count > 0 ? bucket.total / bucket.count : 0,
    };
  });
};

export interface PeriodComparison {
  currentSpend: number;
  previousSpend: number;
  spendChangePct: number | null; // null = no prior-period data to compare against
  currentInvested: number;
  previousInvested: number;
  investedChangePct: number | null;
}

// Compares two entry sets (e.g. this month vs. last month). A null
// change percentage means the previous period had zero in that bucket,
// so a percentage change isn't meaningful — callers should show
// "New"/"—" rather than a misleading +Infinity%.
export const getPeriodComparison = (current: DayEntry[], previous: DayEntry[]): PeriodComparison => {
  const currentSpend = getMonthTotalSpend(current);
  const previousSpend = getMonthTotalSpend(previous);
  const currentInvested = getMonthTotalInvested(current);
  const previousInvested = getMonthTotalInvested(previous);

  const pctChange = (curr: number, prev: number): number | null => {
    if (prev === 0) return null;
    return ((curr - prev) / prev) * 100;
  };

  return {
    currentSpend,
    previousSpend,
    spendChangePct: pctChange(currentSpend, previousSpend),
    currentInvested,
    previousInvested,
    investedChangePct: pctChange(currentInvested, previousInvested),
  };
};
