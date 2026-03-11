export interface Expense {
  id: string;
  label: string;
  amount: number;
  type: 'need' | 'want' | 'investment' | 'savings';
}

export interface DayEntry {
  id: string;
  date: string;
  day: string;
  journalText: string;
  gymAttended: 'yes' | 'no' | 'closed';
  expenses: Expense[];
  notes: string;
  totalSpend: number;
  totalInvested: number;
}

export interface MonthConfig {
  month: string;
  salary: number;
  dailySpendLimit: number;
  monthlyBudget: number;
}

let uid = 0;
const e = (label: string, amount: number, type: Expense['type']): Expense => ({
  id: `exp-${++uid}`,
  label,
  amount,
  type,
});

const calcSpend = (expenses: Expense[]) =>
  expenses.filter((x) => x.type === 'need' || x.type === 'want').reduce((s, x) => s + x.amount, 0);
const calcInvested = (expenses: Expense[]) =>
  expenses.filter((x) => x.type === 'investment' || x.type === 'savings').reduce((s, x) => s + x.amount, 0);

const makeEntry = (
  date: string,
  day: string,
  journalText: string,
  gymAttended: DayEntry['gymAttended'],
  expenses: Expense[],
  notes = ''
): DayEntry => ({
  id: date,
  date,
  day,
  journalText,
  gymAttended,
  expenses,
  notes,
  totalSpend: calcSpend(expenses),
  totalInvested: calcInvested(expenses),
});

export const initialEntries: DayEntry[] = [
  makeEntry('2026-03-01', 'Sunday', 'Late morning, stayed at PG. Relaxed and had a slow day. Did not go anywhere special.', 'closed', [
    e('Breakfast', 37, 'need'), e('Chips', 30, 'want'), e('Dinner', 30, 'need'),
  ]),
  makeEntry('2026-03-02', 'Monday', 'Late morning, office day, called mom, PG, went to gym. Productive day overall.', 'yes', [
    e('Dahi', 20, 'need'), e('Bus', 10, 'need'), e('Chira', 10, 'need'), e('Banana', 80, 'need'),
    e('Lunch', 100, 'need'), e('Bus', 10, 'need'), e('Paneer', 90, 'need'), e('Eggs', 28, 'need'),
    e('Daalbhaja', 10, 'need'), e('Loan', 2105, 'savings'),
  ]),
  makeEntry('2026-03-03', 'Tuesday', 'Late morning, stayed at PG and sleep. Holi celebration, paid dues.', 'no', [
    e('Sugar', 30, 'need'), e('Can', 160, 'want'), e('Chai', 12, 'need'), e('Dinner', 40, 'need'),
    e('Dahi', 20, 'need'), e('PujaDueForRent', 4660, 'need'), e('VendorDueBroker', 3000, 'need'),
  ], 'Holi'),
  makeEntry('2026-03-04', 'Wednesday', 'Late morning, office day, called mom, PG, went to gym. Long bus commute today.', 'yes', [
    e('Dahi', 20, 'need'), e('Bus', 10, 'need'), e('Bus', 332, 'need'), e('Lunch', 200, 'need'),
    e('Gift', 10, 'want'), e('Bus', 10, 'need'), e('Eggs', 26, 'need'),
  ], '16300 remaining'),
  makeEntry('2026-03-05', 'Thursday', 'Early morning gym, office day, called mom, PG. Paid gym membership for the month.', 'yes', [
    e('Gym Membership', 800, 'need'), e('Dahi', 20, 'need'), e('Banana', 20, 'need'),
    e('Coke', 40, 'want'), e('Icecream', 50, 'want'), e('Dinner', 40, 'need'), e('Bus', 10, 'need'),
    e('Samosa', 33, 'want'), e('Trim', 50, 'need'), e('Beard', 50, 'need'),
  ]),
  makeEntry('2026-03-06', 'Friday', 'Early morning gym, office day, went to Ujjal wedding. Great celebration!', 'yes', [
    e('Dahi', 20, 'need'), e('Bus', 10, 'need'), e('Lunch', 55, 'need'), e('Bus', 10, 'need'),
    e('Banana', 18, 'need'), e('Uber', 112, 'need'), e('Uber', 125, 'need'),
  ]),
  makeEntry('2026-03-07', 'Saturday', 'Early morning gym, stayed at PG. Good rest day, cooked at home.', 'yes', [
    e('Dahi', 20, 'need'), e('Banana', 12, 'need'), e('Eggs', 26, 'need'), e('FlipKart', 300, 'want'),
  ]),
  makeEntry('2026-03-08', 'Sunday', 'Late morning, went to ISKCON Mandir in the evening. Peaceful and spiritual.', 'closed', [
    e('Sugar', 40, 'need'), e('Banana', 20, 'need'), e('Apple', 32, 'need'), e('Paneer', 90, 'need'),
    e('Grocery', 70, 'need'), e('Auto', 15, 'need'), e('Prasad', 50, 'want'), e('Sweets', 55, 'want'),
    e('Auto', 15, 'need'),
  ]),
  makeEntry('2026-03-09', 'Monday', 'Early morning gym, office day, called mom, PG. Had to refill gas cylinder.', 'yes', [
    e('Bus', 10, 'need'), e('Lunch', 50, 'need'), e('Paneer', 90, 'need'), e('Gas', 951, 'need'),
  ]),
  makeEntry('2026-03-10', 'Tuesday', 'Early morning gym, office day, called mom, PG. Another regular productive day.', 'yes', [
    e('Bus', 10, 'need'), e('Lunch', 50, 'need'), e('Paneer', 90, 'need'), e('Gas', 951, 'need'),
  ]),
];

export const initialMonthConfig: MonthConfig = {
  month: '2026-03',
  salary: 45000,
  dailySpendLimit: 600,
  monthlyBudget: 15000,
};
