interface BudgetBarProps {
  spent: number;
  budget: number;
}

const BudgetBar = ({ spent, budget }: BudgetBarProps) => {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const color = pct >= 90 ? 'bg-destructive' : pct >= 75 ? 'bg-warning' : 'bg-success';

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground font-medium">Monthly Budget</span>
        <span className="text-sm font-semibold text-foreground">
          ₹{spent.toLocaleString('en-IN')} / ₹{budget.toLocaleString('en-IN')}
        </span>
      </div>
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default BudgetBar;
