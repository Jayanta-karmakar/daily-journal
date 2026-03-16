import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search as SearchIcon, Calendar, ArrowRight } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useAppContext } from '@/context/AppContext';
import { DayEntry } from '@/data/mockData';
import { format } from 'date-fns';
import { formatCurrency } from '@/data/calculations';

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const { entries, config } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const onSelect = (date: string) => {
    setOpen(false);
    navigate(`/entry/${date}`);
  };

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted border border-border rounded-md transition-colors w-40 lg:w-64"
      >
        <SearchIcon size={14} />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span>{isMac ? '⌘' : 'Ctrl'}</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex flex-col overflow-hidden max-h-[85vh]">
          <CommandInput placeholder="Search your journal, notes, and expenses..." />
          <CommandList className="flex-1 overflow-y-auto">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Recent Entries">
              {entries.map((entry: DayEntry) => (
                <CommandItem
                  key={entry.date}
                  value={`${entry.date} ${entry.day} ${entry.journalText} ${entry.notes} ${entry.gymAttended === 'yes' ? 'gym' : ''} ${entry.expenses.map(e => `${e.label} ${e.amount}`).join(' ')}`}
                  onSelect={() => onSelect(entry.date)}
                  className="flex flex-col items-start gap-1.5 py-3 px-4 cursor-pointer"
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-primary" />
                      <span className="font-semibold text-foreground">
                        {format(new Date(entry.date), 'dd MMM yyyy')}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase">{entry.day}</span>
                      {entry.gymAttended === 'yes' && (
                        <span className="text-[10px] font-bold text-success-foreground bg-success px-1.5 rounded leading-none py-0.5">GYM</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${entry.totalSpend > config.dailySpendLimit ? 'text-destructive' : 'text-foreground'}`}>
                        {formatCurrency(entry.totalSpend, config.currency)}
                      </span>
                      <ArrowRight size={14} className="text-muted-foreground opacity-30 group-hover:opacity-100" />
                    </div>
                  </div>

                <div className="flex items-center gap-2 text-sm text-foreground/80 w-full truncate">
                  <FileText size={14} className="shrink-0 text-muted-foreground" />
                  <span className="italic">"{entry.journalText}"</span>
                </div>

                {entry.expenses.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.expenses.map((exp, idx) => (
                      <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] bg-muted text-muted-foreground border border-border">
                        {exp.label}: <span className="font-bold ml-1 text-foreground">{formatCurrency(exp.amount, config.currency)}</span>
                      </span>
                    ))}
                  </div>
                )}
                
                {entry.notes && (
                  <div className="text-[10px] text-muted-foreground mt-0.5 italic">
                    Note: {entry.notes}
                  </div>
                )}
              </CommandItem>
            ))}
            </CommandGroup>
          </CommandList>
        </div>
      </CommandDialog>
    </>
  );
}
