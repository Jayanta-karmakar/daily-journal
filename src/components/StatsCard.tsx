import { formatCurrency } from '@/data/calculations';

interface StatsCardProps {
  label: string;
  value: number;
  variant?: 'default' | 'danger' | 'success' | 'investment';
}

const variantClasses: Record<string, string> = {
  default: 'text-primary',
  danger: 'text-destructive',
  success: 'text-success',
  investment: 'text-investment',
};

const StatsCard = ({ label, value, variant = 'default' }: StatsCardProps) => (
  <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wider text-foreground/60">{label}</p>
    <p className={`text-xl font-bold mt-1 ${variantClasses[variant]}`}>{formatCurrency(value)}</p>
  </div>
);

export default StatsCard;
