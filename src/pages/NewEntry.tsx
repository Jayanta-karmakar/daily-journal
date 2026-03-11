import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { getDayOfWeek, formatCurrency } from '@/data/calculations';
import type { Expense, DayEntry } from '@/data/mockData';
import GymToggle from '@/components/GymToggle';
import ExpenseRow from '@/components/ExpenseRow';
import { toast } from 'sonner';

interface ExpenseForm {
  amount: string;
  label: string;
  type: Expense['type'];
}

const emptyRow = (): ExpenseForm => ({ amount: '', label: '', type: 'need' });

const NewEntry = () => {
  const navigate = useNavigate();
  const { config, addEntry } = useAppContext();

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [journal, setJournal] = useState('');
  const [gym, setGym] = useState<'yes' | 'no' | 'closed'>('no');
  const [expenses, setExpenses] = useState<ExpenseForm[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dayName = getDayOfWeek(date);
  const isSunday = dayName === 'Sunday';

  const handleDateChange = (val: string) => {
    setDate(val);
    const d = getDayOfWeek(val);
    if (d === 'Sunday') setGym('closed');
    else if (gym === 'closed') setGym('no');
  };

  const updateExpense = (i: number, field: string, value: string) => {
    setExpenses((prev) => prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  };

  const deleteExpense = (i: number) => {
    setExpenses((prev) => prev.filter((_, idx) => idx !== i));
  };

  const actualSpend = expenses
    .filter((r) => r.type === 'need' || r.type === 'want')
    .reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const invested = expenses
    .filter((r) => r.type === 'investment' || r.type === 'savings')
    .reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!date) errs.date = 'Date is required';
    if (!journal || journal.length < 10) errs.journal = 'Journal must be at least 10 characters';
    expenses.forEach((row, i) => {
      const amt = parseFloat(row.amount);
      if (amt > 0 && !row.label.trim()) errs[`exp-${i}`] = 'Label required when amount is entered';
      if (row.amount && amt < 0) errs[`exp-${i}`] = 'Amount must be positive';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const validExpenses: Expense[] = expenses
      .filter((r) => r.label.trim() || parseFloat(r.amount) > 0)
      .map((r, i) => ({
        id: `new-${Date.now()}-${i}`,
        label: r.label,
        amount: parseFloat(r.amount) || 0,
        type: r.type,
      }));

    const entry: DayEntry = {
      id: date,
      date,
      day: dayName,
      journalText: journal,
      gymAttended: isSunday ? 'closed' : gym,
      expenses: validExpenses,
      notes,
      totalSpend: validExpenses.filter((e) => e.type === 'need' || e.type === 'want').reduce((s, e) => s + e.amount, 0),
      totalInvested: validExpenses.filter((e) => e.type === 'investment' || e.type === 'savings').reduce((s, e) => s + e.amount, 0),
    };
    addEntry(entry);
    toast.success('Entry saved!');
    navigate('/');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
          <ArrowLeft size={16} className="inline mr-1" /> Back
        </button>
        <h1 className="text-xl font-bold text-foreground">New Entry</h1>
      </div>

      {/* Date */}
      <section className="bg-card rounded-xl border border-border p-4 shadow-sm mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">📅 Date</h2>
        <p className="text-sm text-destructive mb-1">Date *</p>
        <div className="flex gap-3 items-center">
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <span className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium bg-muted">{dayName}</span>
        </div>
        {errors.date && <p className="text-destructive text-xs mt-1">{errors.date}</p>}
      </section>

      {/* Journal */}
      <section className="bg-card rounded-xl border border-border p-4 shadow-sm mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">✏️ Journal</h2>
        <p className="text-sm text-destructive mb-1">What did you do today? *</p>
        <textarea
          value={journal}
          onChange={(e) => setJournal(e.target.value)}
          rows={4}
          placeholder="Write about your day..."
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
        />
        {errors.journal && <p className="text-destructive text-xs mt-1">{errors.journal}</p>}
      </section>

      {/* Gym */}
      <section className="bg-card rounded-xl border border-border p-4 shadow-sm mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">💪 Gym Attendance</h2>
        <GymToggle value={isSunday ? 'closed' : gym} onChange={setGym} isSunday={isSunday} />
      </section>

      {/* Expenses */}
      <section className="bg-card rounded-xl border border-border p-4 shadow-sm mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">🎯 Today's Expenses</h2>
        <div className="flex flex-col gap-2 mb-3">
          {expenses.map((row, i) => (
            <ExpenseRow
              key={i}
              expense={row}
              onChange={(field, val) => updateExpense(i, field, val)}
              onDelete={() => deleteExpense(i)}
              error={errors[`exp-${i}`]}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setExpenses((p) => [...p, emptyRow()])}
          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          + Add Row
        </button>

        <div className="mt-4 bg-muted rounded-lg p-3">
          <div className="flex justify-between text-sm font-semibold">
            <span>Actual Spend (Need + Want)</span>
            <span>{formatCurrency(actualSpend)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-investment mt-1">
            <span>Invested (Investment + Savings)</span>
            <span>{formatCurrency(invested)}</span>
          </div>
        </div>

        {actualSpend > config.dailySpendLimit && (
          <div className="mt-3 bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-center">
            <p className="text-sm text-destructive font-medium">⚠️ You've exceeded your daily limit of {formatCurrency(config.dailySpendLimit)}</p>
          </div>
        )}
      </section>

      {/* Notes */}
      <section className="bg-card rounded-xl border border-border p-4 shadow-sm mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">📝 Notes</h2>
        <p className="text-sm text-muted-foreground mb-1">Optional note for the day</p>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any extra note..."
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </section>

      <button
        onClick={handleSave}
        className="w-full py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors shadow-md"
      >
        💾 Save Entry
      </button>
    </div>
  );
};

export default NewEntry;
