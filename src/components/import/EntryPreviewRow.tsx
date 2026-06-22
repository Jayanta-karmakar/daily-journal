import React, { useState } from 'react';
import { ParsedEntry } from './types';
import { ChevronDown, ChevronUp, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import GymToggle from '@/components/GymToggle';
import { ExpensePreviewRow } from './ExpensePreviewRow';
import type { Expense } from '@/data/mockData';

interface EntryPreviewRowProps {
  entry: ParsedEntry;
  onChange: (updatedEntry: ParsedEntry) => void;
}

export const EntryPreviewRow: React.FC<EntryPreviewRowProps> = ({ entry, onChange }) => {
  const [expanded, setExpanded] = useState(false);

  const StatusIcon = entry.status === 'error' ? XCircle : 
                     entry.status === 'warning' ? AlertTriangle : CheckCircle;
  
  const statusColor = entry.status === 'error' ? 'text-destructive' : 
                      entry.status === 'warning' ? 'text-yellow-600 dark:text-yellow-500' : 'text-primary';

  const isSunday = entry.day.toLowerCase() === 'sunday';

  return (
    <div className={`border rounded-xl mb-4 overflow-hidden transition-all shadow-sm ${entry.selected ? 'border-primary/40 bg-card shadow-md' : 'border-border bg-muted/10 opacity-75'}`}>
      {/* Collapsed Header */}
        <div className="flex items-center p-4 sm:px-6 cursor-pointer hover:bg-muted/30 transition-colors group">
          <div 
            className="flex items-center h-10 pr-4 border-r border-border/50" 
            onClick={(e) => {
              e.stopPropagation();
              onChange({ ...entry, selected: !entry.selected });
            }}
          >
            <input 
              type="checkbox" 
              className="w-5 h-5 accent-primary shrink-0 transition-transform active:scale-90 pointer-events-none"
              checked={entry.selected}
              readOnly 
            />
          </div>
          
          <div className="flex-1 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm md:text-base pl-4" onClick={() => setExpanded(!expanded)}>
            <div className="font-black text-foreground min-w-[90px] tracking-tight">
              {new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
            </div>
            <div className="text-muted-foreground w-12 hidden md:block font-medium uppercase tracking-tighter text-xs">{entry.day}</div>
            
            <div className="flex items-center gap-2 min-w-[60px] bg-muted/30 px-2 py-1 rounded-lg border border-border/50">
              {entry.gymAttended === 'yes' ? '🏋️‍♀️' : entry.gymAttended === 'no' ? '❌' : '🔒'}
              <span className="text-[10px] uppercase font-bold text-muted-foreground hidden lg:block tracking-widest">{entry.gymAttended}</span>
            </div>
            
            <div className="text-muted-foreground min-w-[100px] flex items-center gap-1.5">
              <span className="text-xs bg-muted p-1 px-2 rounded-md font-bold text-foreground">{entry.expenses.length}</span>
              <span className="text-xs uppercase tracking-widest font-bold opacity-60">expenses</span>
            </div>
            
            <div className="font-black text-foreground min-w-[100px] text-lg">
              ₹{Math.round(entry.totalSpend + entry.totalInvested)}
            </div>

            <div className="flex-1"></div>

            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border border-current/20 bg-current/5 font-bold ${statusColor}`}>
              <StatusIcon size={14} />
              <span className="inline capitalize text-[10px] tracking-widest uppercase">{entry.status}</span>
            </div>

            <div className="text-muted-foreground p-1 hover:bg-muted rounded-full transition-colors">
              {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
        </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-6 md:p-8 border-t border-border/50 bg-background/30 space-y-8">
          {/* Warnings & Errors */}
          {(entry.warnings.length > 0 || entry.errors.length > 0 || entry.parseNotes.length > 0) && (
            <div className="text-sm space-y-2 bg-yellow-500/5 dark:bg-yellow-500/10 rounded-2xl p-4 border border-yellow-500/20 max-h-60 overflow-y-auto custom-scrollbar">
              <h4 className="text-[10px] uppercase tracking-widest font-black text-yellow-600 mb-2">Validation Summary</h4>
              {entry.errors.map((e, i) => <div key={'e'+i} className="text-destructive font-semibold flex items-start gap-2 "><span className="mt-1 shrink-0">❌</span> {e}</div>)}
              {entry.parseNotes.map((n, i) => <div key={'n'+i} className="text-yellow-600 dark:text-yellow-500 font-semibold flex items-start gap-2 "><span className="mt-1 shrink-0">⚠️</span> {n}</div>)}
              {entry.warnings.map((w, i) => <div key={'w'+i} className="text-yellow-600 dark:text-yellow-500 font-semibold flex items-start gap-2 "><span className="mt-1 shrink-0">⚠️</span> {w}</div>)}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] gap-8 xl:gap-12">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">Journal Entry</span>
                <textarea
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[120px] shadow-inner"
                  value={entry.journalText}
                  placeholder="Describe your day..."
                  onChange={(e) => onChange({ ...entry, journalText: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                <div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">Notes & Tags</span>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-2xl border border-border bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-inner"
                    value={entry.notes}
                    placeholder="Extra info..."
                    onChange={(e) => onChange({ ...entry, notes: e.target.value })}
                  />
                </div>

                <div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">Gym Attendance</span>
                  <div className="max-w-[300px]">
                    <GymToggle 
                      isSunday={isSunday}
                      value={entry.gymAttended}
                      onChange={(val) => onChange({ ...entry, gymAttended: val })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block">Expense Breakdown</span>
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{entry.expenses.length} Records</span>
              </div>
              
              {entry.expenses.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border rounded-2xl bg-muted/5">
                  <p className="text-sm text-muted-foreground italic">No expenses recorded for this day.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {entry.expenses.map((exp, idx) => (
                    <ExpensePreviewRow 
                      key={exp.id} 
                      expense={exp} 
                      onChange={(field, val) => {
                        const newExps = [...entry.expenses];
                        newExps[idx] = { ...newExps[idx], [field]: val };
                        onChange({ ...entry, expenses: newExps });
                      }}
                      onDelete={() => {
                        onChange({ ...entry, expenses: entry.expenses.filter((_, i) => i !== idx) });
                      }}
                    />
                  ))}
                </div>
              )}
              
              <button
                type="button"
                className="w-full py-4 border-2 border-dashed border-border rounded-xl text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all mt-4"
                onClick={() => {
                  onChange({
                    ...entry,
                    expenses: [...entry.expenses, { id: crypto.randomUUID(), label: '', amount: 0, type: 'need' }]
                  });
                }}
              >
                ＋ Add New Expense Line
              </button>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-card p-4 rounded-2xl border border-border shadow-sm">
                   <p className="text-[9px] uppercase font-black text-muted-foreground tracking-tighter mb-1">Total Spent</p>
                   <p className="text-lg font-black text-foreground">₹{Math.round(entry.totalSpend)}</p>
                </div>
                <div className="bg-card p-4 rounded-2xl border border-border shadow-sm">
                   <p className="text-[9px] uppercase font-black text-primary/60 tracking-tighter mb-1">Total Invested</p>
                   <p className="text-lg font-black text-primary">₹{Math.round(entry.totalInvested)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
