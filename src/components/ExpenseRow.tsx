import type { Expense } from '@/data/mockData';

interface ExpenseRowProps {
  expense: { amount: string; label: string; type: Expense['type'] };
  onChange: (field: string, value: string) => void;
  onDelete: () => void;
  error?: string;
}

const ExpenseRow = ({ expense, onChange, onDelete, error }: ExpenseRowProps) => (
  <div>
    <div className="flex gap-2 items-center">
      <div className="w-[25%] relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
        <input
          type="number"
          min="0"
          className="w-full pl-7 pr-2 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="0"
          value={expense.amount}
          onChange={(e) => onChange('amount', e.target.value)}
        />
      </div>
      <input
        className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        placeholder="Label / Reason"
        value={expense.label}
        onChange={(e) => onChange('label', e.target.value)}
      />
      <select
        className="w-[20%] px-2 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        value={expense.type}
        onChange={(e) => onChange('type', e.target.value)}
      >
        <option value="need">Need</option>
        <option value="want">Want</option>
        <option value="investment">Investment</option>
        <option value="savings">Savings</option>
      </select>
      <button
        type="button"
        onClick={onDelete}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors text-lg"
      >
        ×
      </button>
    </div>
    {error && <p className="text-destructive text-xs mt-1 ml-1">{error}</p>}
  </div>
);

export default ExpenseRow;
