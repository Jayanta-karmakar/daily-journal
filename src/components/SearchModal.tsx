import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { FileText, Search as SearchIcon, Calendar, ArrowRight, Dumbbell, AlertTriangle, StickyNote, Sparkles } from 'lucide-react';
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
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

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

interface SearchableEntry {
  entry: DayEntry;
  formattedDate: string;
  expenseLabels: string;
  gymLabel: string;
}

type FilterChipId = 'gym' | 'overLimit' | 'hasNotes' | 'zeroSpend';

const FILTER_CHIPS: { id: FilterChipId; label: string; icon: typeof Dumbbell }[] = [
  { id: 'gym', label: 'Gym', icon: Dumbbell },
  { id: 'overLimit', label: 'Over limit', icon: AlertTriangle },
  { id: 'hasNotes', label: 'Has notes', icon: StickyNote },
  { id: 'zeroSpend', label: 'Zero spend', icon: Sparkles },
];

const RESULTS_PAGE_SIZE = 20;

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<FilterChipId>>(new Set());
  const [displayCount, setDisplayCount] = useState(RESULTS_PAGE_SIZE);
  const { entries, config } = useAppContext();
  const navigate = useNavigate();

  // Debounce the query used for actual filtering/ranking so large
  // journals don't re-run a fuzzy search on every single keystroke —
  // the input itself stays instantly responsive since it's bound to
  // `search`, not `debouncedSearch`.
  const debouncedSearch = useDebouncedValue(search, 200);

  const searchableEntries = useMemo<SearchableEntry[]>(() => {
    // Deduplicate by date to prevent duplicate items
    const uniqueEntries = Array.from(
      new Map(entries.map((entry) => [entry.date, entry])).values()
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return uniqueEntries.map((entry) => ({
      entry,
      formattedDate: format(new Date(entry.date), 'dd MMM yyyy'),
      expenseLabels: entry.expenses.map((e) => e.label).join(' '),
      gymLabel: entry.gymAttended === 'yes' ? 'GYM' : '',
    }));
  }, [entries]);

  // Typo-tolerant fuzzy search, weighted so journal text and expense
  // labels matter most for relevance ranking, with the date/day as a
  // lighter-weight signal. Rebuilt only when the entry set changes, not
  // on every keystroke.
  const fuse = useMemo(
    () =>
      new Fuse(searchableEntries, {
        keys: [
          { name: 'entry.journalText', weight: 0.35 },
          { name: 'expenseLabels', weight: 0.25 },
          { name: 'entry.notes', weight: 0.2 },
          { name: 'formattedDate', weight: 0.12 },
          { name: 'entry.day', weight: 0.04 },
          { name: 'gymLabel', weight: 0.04 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [searchableEntries]
  );

  const rankedResults = useMemo<SearchableEntry[]>(() => {
    if (!debouncedSearch.trim()) return searchableEntries;
    return fuse.search(debouncedSearch).map((r) => r.item);
  }, [fuse, debouncedSearch, searchableEntries]);

  const matchesFilters = (entry: DayEntry) => {
    if (activeFilters.has('gym') && entry.gymAttended !== 'yes') return false;
    if (activeFilters.has('overLimit') && entry.totalSpend <= config.dailySpendLimit) return false;
    if (activeFilters.has('hasNotes') && !entry.notes?.trim()) return false;
    if (activeFilters.has('zeroSpend') && entry.totalSpend !== 0) return false;
    return true;
  };

  const filteredResults = useMemo(
    () => rankedResults.filter((r) => matchesFilters(r.entry)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rankedResults, activeFilters, config.dailySpendLimit]
  );

  // Cap initial render to keep the dialog snappy for journals with a
  // large number of entries; reveal more in pages rather than rendering
  // everything that matched at once.
  const visibleResults = filteredResults.slice(0, displayCount);
  const hasMoreResults = filteredResults.length > displayCount;

  useEffect(() => {
    setDisplayCount(RESULTS_PAGE_SIZE);
  }, [debouncedSearch, activeFilters]);

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
      setActiveFilters(new Set());
      setDisplayCount(RESULTS_PAGE_SIZE);
    }
  }, [open]);

  const toggleFilter = (id: FilterChipId) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onSelect = (date: string) => {
    setOpen(false);
    navigate(`/entry/${date}`);
  };

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open search"
        className="flex items-center justify-center md:justify-start gap-2 p-2 md:px-3 md:py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted border border-border rounded-md transition-colors w-9 h-9 md:w-40 lg:w-64 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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

          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border overflow-x-auto">
            {FILTER_CHIPS.map(({ id, label, icon: Icon }) => {
              const isActive = activeFilters.has(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleFilter(id)}
                  aria-pressed={isActive}
                  className={`flex items-center gap-1 whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                  }`}
                >
                  <Icon size={11} />
                  {label}
                </button>
              );
            })}
          </div>

          <CommandList className="flex-1 overflow-y-auto">
            <CommandEmpty>No results found{search ? ` for "${search}"` : ''}.</CommandEmpty>
            <CommandGroup heading={search ? `Search Results (${filteredResults.length})` : 'Recent Entries'}>
              {visibleResults.map(({ entry, formattedDate, expenseLabels }: SearchableEntry) => {
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

              {hasMoreResults && (
                <div className="flex justify-center py-2">
                  <button
                    type="button"
                    onClick={() => setDisplayCount((c) => c + RESULTS_PAGE_SIZE)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold text-muted-foreground bg-muted hover:bg-muted/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Show {Math.min(RESULTS_PAGE_SIZE, filteredResults.length - displayCount)} more of {filteredResults.length} results
                  </button>
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </div>
      </CommandDialog>
    </>
  );
}
