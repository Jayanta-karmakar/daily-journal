import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/data/calculations';
import { Receipt } from 'lucide-react';

interface TopExpensesCardProps {
  items: { label: string; total: number; count: number }[];
  currency: string;
}

const TopExpensesCard = ({ items, currency }: TopExpensesCardProps) => {
  const maxTotal = items.length > 0 ? Math.max(...items.map((i) => i.total)) : 0;

  return (
    <Card className="border-border/50 shadow-md rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/20">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" />
          Top Expense Labels
        </CardTitle>
        <CardDescription className="text-xs">Your most frequent / largest spending labels (need + want)</CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.label}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs font-semibold text-foreground truncate pr-2">{item.label}</span>
                  <span className="text-xs font-bold text-foreground whitespace-nowrap">
                    {formatCurrency(item.total, currency)}
                    <span className="text-muted-foreground font-medium"> · {item.count}x</span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/70"
                    style={{ width: `${maxTotal > 0 ? (item.total / maxTotal) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[120px] flex items-center justify-center text-muted-foreground text-xs italic">
            No expenses recorded for this selection
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopExpensesCard;
