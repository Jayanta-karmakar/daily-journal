import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PenSquare } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { formatCurrency } from '@/data/calculations';

const typeColors: Record<string, string> = {
  need: 'bg-primary/5',
  want: 'bg-warning/10',
  investment: 'bg-success/10',
  savings: 'bg-investment/10',
};

const typeBadge: Record<string, string> = {
  need: 'bg-primary text-primary-foreground',
  want: 'bg-warning text-warning-foreground',
  investment: 'bg-success text-success-foreground',
  savings: 'bg-investment text-investment-foreground',
};

const ViewEntry = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { getEntryByDate } = useAppContext();
  const entry = getEntryByDate(date || '');

  if (!entry) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 text-center">
        <p className="text-muted-foreground">Entry not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-primary font-medium">Go to Dashboard</button>
      </div>
    );
  }

  const d = new Date(entry.date);
  const formatted = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const long = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const gymBadge = () => {
    if (entry.gymAttended === 'yes')
      return <span className="px-4 py-2 rounded-full text-sm font-semibold bg-success text-success-foreground">💪 GYM ☑️ — Attended</span>;
    if (entry.gymAttended === 'no')
      return <span className="px-4 py-2 rounded-full text-sm font-semibold bg-destructive text-destructive-foreground">NO GYM ❌</span>;
    return <span className="px-4 py-2 rounded-full text-sm font-semibold bg-muted text-muted-foreground">SUNDAY — Closed</span>;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-6">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate('/')} className="px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
          <ArrowLeft size={16} className="inline mr-1" /> Back
        </button>
        <button onClick={() => navigate(`/entry/${entry.date}/edit`)} className="px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
          <PenSquare size={16} className="inline mr-1" /> Edit
        </button>
      </div>

      <h1 className="text-3xl font-bold text-foreground mb-1">{formatted}</h1>
      <p className="text-muted-foreground mb-4">{long}</p>
      <div className="mb-6">{gymBadge()}</div>

      {/* Journal */}
      <section className="bg-card rounded-xl border border-border p-4 shadow-sm mb-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">📖 Journal</h2>
        <p className="text-foreground">{entry.journalText}</p>
      </section>

      {/* Notes */}
      {entry.notes && (
        <section className="bg-card rounded-xl border border-border p-4 shadow-sm mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">📝 Notes</h2>
          <p className="text-muted-foreground italic">{entry.notes}</p>
        </section>
      )}

      {/* Expenses */}
      <section className="bg-card rounded-xl border border-border p-4 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">🎯 Expenses</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                <th className="text-left py-2 px-3 font-semibold">Label</th>
                <th className="text-left py-2 px-3 font-semibold">Type</th>
                <th className="text-right py-2 px-3 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {entry.expenses.map((exp) => (
                <tr key={exp.id} className={`${typeColors[exp.type]} border-t border-border`}>
                  <td className="py-3 px-3 font-medium text-foreground">{exp.label}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${typeBadge[exp.type]}`}>
                      {exp.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-foreground">{formatCurrency(exp.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-border">
              <tr>
                <td colSpan={2} className="py-3 px-3 font-bold text-foreground">Actual Spend (Need + Want)</td>
                <td className="py-3 px-3 text-right font-bold text-foreground">{formatCurrency(entry.totalSpend)}</td>
              </tr>
              {entry.totalInvested > 0 && (
                <tr>
                  <td colSpan={2} className="py-2 px-3 font-bold text-investment">Invested</td>
                  <td className="py-2 px-3 text-right font-bold text-investment">{formatCurrency(entry.totalInvested)}</td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ViewEntry;
