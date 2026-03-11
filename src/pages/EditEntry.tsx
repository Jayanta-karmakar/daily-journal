import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const EditEntry = () => {
  const { date: paramDate } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { config, getEntryByDate, updateEntry } = useAppContext();
  const entry = getEntryByDate(paramDate || '');

  const [date, setDate] = useState('');
  const [journal, setJournal] = useState('');
  const [gym, setGym] = useState<'yes' | 'no' | 'closed'>('no');
  const [expenses, setExpenses] = useState<ExpenseForm[]>([]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (entry) {
      setDate(entry.date);
      setJournal(entry.journalText);
      setGym(entry.gymAttended);
      setExpenses(entry.expenses.map((e) => ({ amount: e.amount.toString(), label: e.label, type: e.type })));
      setNotes(entry.notes);
    }
  }, [entry]);

  if (!entry) {
    return (
      <div className="max-w-[900px] mx-auto px-4 py-6 text-center">
        <p className="text-muted-foreground">Entry not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-primary font-medium">Go to Dashboard</button>
      </div>
    );
  }

  const dayName = getDayOfWeek(date);
  const isSunday = dayName === 'Sunday';

  const updateExpenseRow = (i: number, field: string, value: string) => {
    setExpenses((prev) => prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  };

  const actualSpend = expenses
    .filter((r) => r.type === 'need' || r.type === 'want')
    .reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const invested = expenses
    .filter((r) => r.type === 'investment' || r.type === 'savings')
    .reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!journal || journal.length < 10) errs.journal = 'Journal must be at least 10 characters';
    expenses.forEach((row, i) => {
      const amt = parseFloat(row.amount);
      if (amt > 0 && !row.label.trim()) errs[`exp-${i}`] = 'Label required when amount is entered';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const validExpenses: Expense[] = expenses
      .filter((r) => r.label.trim() || parseFloat(r.amount) > 0)
      .map((r, i) => ({
        id: `edit-${Date.now()}-${i}`,
        label: r.label,
        amount: parseFloat(r.amount) || 0,
        type: r.type,
      }));

    const updated: DayEntry = {
      ...entry,
      journalText: journal,
      gymAttended: isSunday ? 'closed' : gym,
      expenses: validExpenses,
      notes,
      totalSpend: validExpenses.filter((e) => e.type === 'need' || e.type === 'want').reduce((s, e) => s + e.amount, 0),
      totalInvested: validExpenses.filter((e) => e.type === 'investment' || e.type === 'savings').reduce((s, e) => s + e.amount, 0),
    };
    updateEntry(updated);
    toast.success('Entry updated!');
    navigate(`/entry/${date}`);
  };

  return (
    <div className="max-w-[900px] mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
          <ArrowLeft size={16} className="inline mr-1" /> Back
        </button>
        <h1 className="text-xl font-bold text-foreground">Edit Entry</h1>
      </div>

      <section className="bg-card rounded-xl border border-border p-4 shadow-sm mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">📅 Date</h2>
        <div className="flex gap-3 items-center">
          <input type="date" value={date} disabled className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-muted text-sm opacity-60" />
          <span className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium bg-muted">{dayName}</span>
        </div>
      </section>

      <section className="bg-card rounded-xl border border-border p-4 shadow-sm mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">✏️ Journal</h2>
        <textarea value={journal} onChange={(e) => setJournal(e.target.value)} rows={4}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y" />
        {errors.journal && <p className="text-destructive text-xs mt-1">{errors.journal}</p>}
      </section>

      <section className="bg-card rounded-xl border border-border p-4 shadow-sm mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">💪 Gym Attendance</h2>
        <GymToggle value={isSunday ? 'closed' : gym} onChange={setGym} isSunday={isSunday} />
      </section>

      <section className="bg-card rounded-xl border border-border p-4 shadow-sm mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">🎯 Expenses</h2>
        <div className="flex flex-col gap-2 mb-3">
          {expenses.map((row, i) => (
            <ExpenseRow key={i} expense={row} onChange={(f, v) => updateExpenseRow(i, f, v)}
              onDelete={() => setExpenses((p) => p.filter((_, idx) => idx !== i))} error={errors[`exp-${i}`]} />
          ))}
        </div>
        <button type="button" onClick={() => setExpenses((p) => [...p, { amount: '', label: '', type: 'need' }])}
          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">+ Add Row</button>
        <div className="mt-4 bg-muted rounded-lg p-3">
          <div className="flex justify-between text-sm font-semibold"><span>Actual Spend</span><span>{formatCurrency(actualSpend)}</span></div>
          <div className="flex justify-between text-sm font-medium text-investment mt-1"><span>Invested</span><span>{formatCurrency(invested)}</span></div>
        </div>
        {actualSpend > config.dailySpendLimit && (
          <div className="mt-3 bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-center">
            <p className="text-sm text-destructive font-medium">⚠️ Exceeded daily limit of {formatCurrency(config.dailySpendLimit)}</p>
          </div>
        )}
      </section>

      <section className="bg-card rounded-xl border border-border p-4 shadow-sm mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">📝 Notes</h2>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any extra note..."
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </section>

      <button onClick={handleSave}
        className="w-full py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors shadow-md">
        💾 Update Entry
      </button>
    </div>
  );
};

export default EditEntry;
