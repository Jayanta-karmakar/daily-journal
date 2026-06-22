import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface PeriodComparisonBadgeProps {
  changePct: number | null;
  /** When true, an increase is rendered as "bad" (red) — e.g. spending. When false, an increase is "good" (green) — e.g. investing. */
  increaseIsBad: boolean;
  periodLabel: string;
}

const PeriodComparisonBadge = ({ changePct, increaseIsBad, periodLabel }: PeriodComparisonBadgeProps) => {
  if (changePct === null) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
        <Minus size={11} /> no {periodLabel} data
      </span>
    );
  }

  const rounded = Math.round(Math.abs(changePct));
  const isIncrease = changePct > 0;
  const isFlat = rounded === 0;
  const isGood = isFlat ? true : isIncrease ? !increaseIsBad : increaseIsBad;

  const colorClass = isFlat ? 'text-muted-foreground' : isGood ? 'text-success' : 'text-destructive';

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${colorClass}`}>
      {isFlat ? <Minus size={11} /> : isIncrease ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
      {rounded}% vs {periodLabel}
    </span>
  );
};

export default PeriodComparisonBadge;
