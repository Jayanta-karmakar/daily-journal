import React, { useState } from 'react';

interface BulkTypeFixerProps {
  onApply: (keyword: string, type: 'need' | 'want' | 'investment' | 'savings') => void;
}

const SUGGESTIONS: { label: string; type: 'need' | 'want' | 'investment' | 'savings' }[] = [
  { label: 'loan', type: 'savings' },
  { label: 'rent', type: 'need' },
  { label: 'creditCardBill', type: 'want' },
  { label: 'coke', type: 'want' },
  { label: 'icecream', type: 'want' },
  { label: 'chips', type: 'want' },
  { label: 'flipkart', type: 'want' },
  { label: 'uber', type: 'want' },
  { label: 'gymMembership', type: 'need' },
  { label: 'gas', type: 'need' },
  { label: 'suvenduDueForBroker', type: 'savings' },
];

export const BulkTypeFixer: React.FC<BulkTypeFixerProps> = ({ onApply }) => {
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState<'need' | 'want' | 'investment' | 'savings'>('need');

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🛠️</span>
        <h3 className="text-sm font-bold text-foreground">Quick fix: assign a type to all matching labels</h3>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative w-full sm:flex-1">
          <input
            type="text"
            placeholder="Search keyword (e.g. 'uber')..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all shadow-inner"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="flex-1 sm:w-40 px-4 py-3 bg-background border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all uppercase tracking-tight"
          >
            <option value="need">Need</option>
            <option value="want">Want</option>
            <option value="investment">Invest</option>
            <option value="savings">Save</option>
          </select>
          <button
            onClick={() => { if (keyword) onApply(keyword, type); }}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-md active:scale-95 shrink-0"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Smart Suggestions</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => onApply(s.label, s.type)}
              className="px-4 py-2 bg-muted/50 hover:bg-primary hover:text-primary-foreground border border-border rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2 group shadow-sm"
            >
              <span>{s.label}</span>
              <span className="opacity-40 group-hover:opacity-100">→</span>
              <span className="capitalize opacity-60 group-hover:opacity-100">{s.type === 'investment' ? 'Invest' : s.type === 'savings' ? 'Save' : s.type}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
