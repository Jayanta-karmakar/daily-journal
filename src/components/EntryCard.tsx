import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { DayEntry } from '@/data/mockData';
import { formatCurrency } from '@/data/calculations';
import { useAppContext } from '@/context/AppContext';
import { Trash2 } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface EntryCardProps {
  entry: DayEntry;
}

const EntryCard = ({ entry }: EntryCardProps) => {
  const navigate = useNavigate();
  const { config, deleteEntry } = useAppContext();
  const isOverLimit = entry.totalSpend > config.dailySpendLimit;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const gymBadge = () => {
    if (entry.gymAttended === 'yes')
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-success text-success-foreground">GYM ✅</span>;
    if (entry.gymAttended === 'no')
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-destructive text-destructive-foreground">NO GYM</span>;
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">SUNDAY</span>;
  };

  const day = parseInt(entry.date.split('-')[2]);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[parseInt(entry.date.split('-')[1]) - 1];

  return (
    <div
      onClick={() => navigate(`/entry/${entry.date}`)}
      className={`bg-card rounded-xl border shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow ${
        isOverLimit ? 'border-l-4 border-l-destructive bg-destructive/5 border-t-border border-r-border border-b-border' : 'border-border'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-lg font-bold text-foreground">{day.toString().padStart(2, '0')} {month}</p>
          <p className="text-sm text-muted-foreground">{entry.day}</p>
        </div>
        <div className="flex items-center gap-2">
          {gymBadge()}
          {isOverLimit && <span className="text-xs text-destructive font-medium">⚠️ Over limit</span>}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteModal(true);
            }}
            className="p-1 px-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Delete entry"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground truncate mb-2">{entry.journalText}</p>
      <div className="flex justify-between items-center">
        <p className={`text-sm font-semibold ${isOverLimit ? 'text-destructive' : 'text-foreground'}`}>
          Spent: {formatCurrency(entry.totalSpend)}
        </p>
        {entry.totalInvested > 0 && (
          <p className="text-sm text-success font-medium">📈 {formatCurrency(entry.totalInvested)} invested</p>
        )}
      </div>
      {entry.notes && (
        <p className="text-xs text-muted-foreground mt-1">📝 {entry.notes}</p>
      )}

      <ConfirmModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => deleteEntry(entry.date)}
        title="Delete entry?"
        message={`Are you sure you want to remove the record for ${entry.date}?`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default EntryCard;
