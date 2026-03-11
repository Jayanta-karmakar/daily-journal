import React from 'react';
import type { Expense } from '@/data/mockData';

interface ExpensePreviewRowProps {
  expense: Expense;
  onChange: (field: keyof Expense, value: string | number) => void;
  onDelete: () => void;
}

export const ExpensePreviewRow: React.FC<ExpensePreviewRowProps> = ({ expense, onChange, onDelete }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center mb-3 p-3 bg-muted/20 rounded-xl border border-border/50 transition-colors hover:border-primary/30">
      <div className="flex-1 w-full">
        <input
          type="text"
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          placeholder="Expense Label"
          value={expense.label}
          onChange={(e) => onChange('label', e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative w-full sm:w-32">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-xs">₹</span>
          <input
            type="number"
            min="0"
            className="w-full pl-6 pr-2 py-2.5 rounded-lg border border-border bg-background text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            placeholder="0"
            value={expense.amount.toString()}
            onChange={(e) => onChange('amount', parseInt(e.target.value) || 0)}
          />
        </div>
        
        <select
          className="flex-1 sm:flex-none sm:w-32 px-2 py-2.5 rounded-lg border border-border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all uppercase tracking-tight"
          value={expense.type}
          onChange={(e) => onChange('type', e.target.value)}
        >
          <option value="need">Need</option>
          <option value="want">Want</option>
          <option value="investment">Invest</option>
          <option value="savings">Save</option>
        </select>
        
        <button
          type="button"
          onClick={onDelete}
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all border border-transparent hover:border-destructive/20"
        >
          <span className="text-xl">×</span>
        </button>
      </div>
    </div>
  );
};
