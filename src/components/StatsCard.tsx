import { LucideIcon } from 'lucide-react';
import { formatCurrency } from '@/data/calculations';
import { useAppContext } from '@/context/AppContext';

interface StatsCardProps {
  label: string;
  value: number;
  variant?: 'default' | 'danger' | 'success' | 'investment' | 'warning';
  icon?: LucideIcon;
  subtext?: string;
}

const variantClasses: Record<string, string> = {
  default: 'text-primary',
  danger: 'text-destructive',
  success: 'text-success',
  investment: 'text-investment',
  warning: 'text-warning',
};

const StatsCard = ({ label, value, variant = 'default', icon: Icon, subtext }: StatsCardProps) => {
  const { config } = useAppContext();
  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground/60">{label}</p>
        {Icon && <Icon size={15} className={variantClasses[variant]} />}
      </div>
      <p className={`text-xl font-bold mt-1 ${variantClasses[variant]}`}>
        {formatCurrency(value, config.currency)}
      </p>
      {subtext && <p className="text-[11px] text-muted-foreground mt-1.5">{subtext}</p>}
    </div>
  );
};

export default StatsCard;
