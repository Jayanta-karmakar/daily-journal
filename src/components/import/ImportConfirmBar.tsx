import React, { useState } from 'react';

export type DuplicateAction = 'skip' | 'overwrite';

interface ImportConfirmBarProps {
  selectedCount: number;
  onCancel: () => void;
  onImportInit: () => { duplicates: string[] }; 
  onConfirm: (action: DuplicateAction) => void;
  isImporting: boolean;
}

export const ImportConfirmBar: React.FC<ImportConfirmBarProps> = ({
  selectedCount,
  onCancel,
  onImportInit,
  onConfirm,
  isImporting
}) => {
  const [step, setStep] = useState<'initial' | 'duplicates'>('initial');
  const [duplicates, setDuplicates] = useState<string[]>([]);
  const [action, setAction] = useState<DuplicateAction>('skip');

  const handleImportClick = () => {
    const res = onImportInit();
    if (res.duplicates.length > 0) {
      setDuplicates(res.duplicates);
      setStep('duplicates');
    } else {
      onConfirm('skip');
    }
  };

  if (step === 'initial') {
    return (
      <div className="sticky bottom-0 bg-card border-t border-border p-4 flex items-center justify-between shadow-lg z-10 mt-6 rounded-b-xl">
        <span className="font-semibold text-sm">
          {selectedCount} entries selected
        </span>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isImporting}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImportClick}
            disabled={selectedCount === 0 || isImporting}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isImporting ? 'Importing...' : `Import ${selectedCount} Entries`}
          </button>
        </div>
      </div>
    );
  }

  // duplicates step
  return (
    <div className="sticky bottom-0 bg-card border-t border-border p-4 flex flex-col md:flex-row md:items-center justify-between shadow-lg z-10 mt-6 rounded-b-xl gap-4">
      <div className="flex-1">
        <div className="text-yellow-600 dark:text-yellow-500 font-semibold text-sm mb-2 flex items-center gap-2">
          ⚠️ {duplicates.length} dates already exist: {duplicates.slice(0, 3).join(', ')}
          {duplicates.length > 3 ? '...' : ''}
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="duplicateAction" 
              className="accent-primary"
              checked={action === 'skip'} 
              onChange={() => setAction('skip')} 
            />
            Skip duplicates
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="duplicateAction" 
              className="accent-primary"
              checked={action === 'overwrite'} 
              onChange={() => setAction('overwrite')} 
            />
            Overwrite duplicates
          </label>
        </div>
      </div>
      
      <div className="flex gap-3 shrink-0">
        <button
          onClick={() => setStep('initial')}
          disabled={isImporting}
          className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={() => onConfirm(action)}
          disabled={isImporting}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isImporting ? 'Importing...' : 'Confirm Import'}
        </button>
      </div>
    </div>
  );
};
