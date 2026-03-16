import React, { useEffect, useState, useMemo } from 'react';
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

const CommandHighlight = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <>{text}</>;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-300 dark:bg-yellow-600 rounded-[2px] px-[1px] text-inherit">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};


export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { entries, config } = useAppContext();
  const navigate = useNavigate();

  const filteredEntries = useMemo(() => {
    // Deduplicate by date to prevent duplicate items
    const uniqueEntries = Array.from(
      new Map(entries.map((entry) => [entry.date, entry])).values()
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (!search.trim()) return uniqueEntries;
    const lowerSearch = search.toLowerCase();
    
    return uniqueEntries.filter((entry) => {
      const formattedDate = format(new Date(entry.date), 'dd MMM yyyy');
      const expenseLabels = entry.expenses.map(e => e.label).join(' ');
      const searchableValue = `${formattedDate} ${entry.day} ${entry.gymAttended === 'yes' ? 'GYM' : ''} ${entry.journalText} ${entry.notes || ''} ${expenseLabels}`;
      
      return searchableValue.toLowerCase().includes(lowerSearch);
    });
  }, [entries, search]);

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

  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  const onSelect = (date: string) => {
    setOpen(false);
    navigate(`/entry/${date}`);
  };

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center md:justify-start gap-2 p-2 md:px-3 md:py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted border border-border rounded-md transition-colors w-9 h-9 md:w-40 lg:w-64"
      >
        <SearchIcon size={16} className="shrink-0" />
        <span className="hidden md:inline-flex flex-1 text-left">Search...</span>
        <kbd className="hidden md:inline-flex pointer-events-none h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span>{isMac ? '⌘' : 'Ctrl'}</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <div className="flex flex-col overflow-hidden max-h-[85vh]">
          <CommandInput 
            placeholder="Search your journal, notes, and expenses..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="flex-1 overflow-y-auto">
            <CommandEmpty>No results found for "{search}".</CommandEmpty>
            <CommandGroup heading={search ? "Search Results" : "Recent Entries"}>
              {filteredEntries.map((entry: DayEntry) => {
                const formattedDate = format(new Date(entry.date), 'dd MMM yyyy');
                const expenseLabels = entry.expenses.map(e => e.label).join(' ');
                const searchableValue = `${formattedDate} ${entry.day} ${entry.gymAttended === 'yes' ? 'GYM' : ''} ${entry.journalText} ${entry.notes || ''} ${expenseLabels}`;

                return (
                  <CommandItem
                    key={entry.date}
                    value={searchableValue}
                    onSelect={() => onSelect(entry.date)}
                    className="flex flex-col items-start gap-1.5 py-3 px-4 cursor-pointer"
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-primary" />
                        <span className="font-semibold text-foreground">
                          <CommandHighlight text={formattedDate} query={search} />
                        </span>
                        <span className="text-xs text-muted-foreground uppercase">
                          <CommandHighlight text={entry.day} query={search} />
                        </span>
                        {entry.gymAttended === 'yes' && (
                          <span className="text-[10px] font-bold text-success-foreground bg-success px-1.5 rounded leading-none py-0.5">
                            <CommandHighlight text="GYM" query={search} />
                          </span>
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
                      <span className="italic">"<CommandHighlight text={entry.journalText} query={search} />"</span>
                    </div>

                    {entry.expenses.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {entry.expenses.map((exp, idx) => (
                          <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] bg-muted text-muted-foreground border border-border">
                            <CommandHighlight text={exp.label} query={search} />: <span className="font-bold ml-1 text-foreground">{formatCurrency(exp.amount, config.currency)}</span>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {entry.notes && (
                      <div className="text-[10px] text-muted-foreground mt-0.5 italic">
                        Note: <CommandHighlight text={entry.notes} query={search} />
                      </div>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </div>
      </CommandDialog>
    </>
  );
}
