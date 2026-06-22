import { useNavigate } from 'react-router-dom';
import type { DayEntry } from '@/data/mockData';
import { formatCurrency } from '@/data/calculations';

interface CalendarHeatmapProps {
  month: string; // YYYY-MM
  entries: DayEntry[]; // entries belonging to this month
  dailySpendLimit: number;
  currency: string;
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const CalendarHeatmap = ({ month, entries, dailySpendLimit, currency }: CalendarHeatmapProps) => {
  const navigate = useNavigate();
  const [yearStr, monthStr] = month.split('-');
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStr, 10) - 1;

  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const firstWeekday = new Date(year, monthIdx, 1).getDay(); // 0 = Sunday

  const entryByDate = new Map(entries.map((e) => [e.date, e]));
  const todayStr = new Date().toISOString().slice(0, 10);
  const limit = dailySpendLimit > 0 ? dailySpendLimit : 1;

  const spendColor = (spend: number) => {
    const ratio = Math.min(1, spend / limit);
    if (spend === 0) return 'hsl(var(--success) / 0.12)';
    const alpha = 0.18 + ratio * 0.65;
    return `hsl(var(--destructive) / ${alpha})`;
  };

  const cells: Array<{ day: number; date: string } | null> = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, date: `${month}-${String(d).padStart(2, '0')}` });
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Spend &amp; Gym Calendar</p>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {WEEKDAY_LABELS.map((w, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-muted-foreground">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`pad-${i}`} />;
          const entry = entryByDate.get(cell.date);
          const isToday = cell.date === todayStr;
          const hasEntry = !!entry;

          const description = entry
            ? `${cell.date} — ${formatCurrency(entry.totalSpend, currency)} spent${entry.gymAttended === 'yes' ? ' — gym attended' : ''}`
            : `${cell.date} — no entry`;

          return (
            <button
              key={cell.date}
              type="button"
              disabled={!hasEntry}
              onClick={() => hasEntry && navigate(`/entry/${cell.date}`)}
              title={description}
              aria-label={description}
              className={`relative aspect-square rounded-md flex flex-col items-center justify-center text-[11px] font-medium transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                hasEntry ? 'cursor-pointer hover:scale-105' : 'cursor-default text-muted-foreground/50'
              } ${isToday ? 'ring-2 ring-primary' : ''}`}
              style={{
                backgroundColor: hasEntry ? spendColor(entry.totalSpend) : 'hsl(var(--muted) / 0.4)',
              }}
            >
              <span className={hasEntry ? 'text-foreground' : ''}>{cell.day}</span>
              {entry?.gymAttended === 'yes' && (
                <span className="absolute bottom-0.5 text-[8px] leading-none">💪</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'hsl(var(--success) / 0.12)' }} />
          Zero spend
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'hsl(var(--destructive) / 0.35)' }} />
          Moderate
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'hsl(var(--destructive) / 0.8)' }} />
          High / over limit
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">💪</span>
          Gym
        </div>
      </div>
    </div>
  );
};

export default CalendarHeatmap;
