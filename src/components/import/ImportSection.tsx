import React, { useState, useMemo } from 'react';
import { FileUp } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { ParseSummaryBar } from './ParseSummaryBar';
import { BulkTypeFixer } from './BulkTypeFixer';
import { EntryPreviewRow } from './EntryPreviewRow';
import { ImportConfirmBar, DuplicateAction } from './ImportConfirmBar';
import { ParsedEntry } from './types';
import { validateEntries } from './validateEntries';
import { useAppContext } from '@/context/AppContext';
import { DayEntry } from '@/data/mockData';
import { toast } from 'sonner';

type FilterTab = 'all' | 'ready' | 'warning' | 'error';

export const ImportSection = () => {
  const { entries, addEntry, updateEntry } = useAppContext();
  
  const [fileDetails, setFileDetails] = useState<{ name: string; size: number } | null>(null);
  const [parsedEntries, setParsedEntries] = useState<ParsedEntry[]>([]);
  const [skippedCount, setSkippedCount] = useState(0);
  
  const [filter, setFilter] = useState<FilterTab>('all');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  const handleFileParsed = (entries: ParsedEntry[], filename: string, size: number, skipped: number) => {
    setParsedEntries(entries);
    setFileDetails({ name: filename, size });
    setSkippedCount(skipped);
    setImportSuccessMessage(null);
  };

  const resetState = () => {
    setFileDetails(null);
    setParsedEntries([]);
    setSkippedCount(0);
    setFilter('all');
  };

  const handleApplyBulkType = (keyword: string, type: 'need' | 'want' | 'investment' | 'savings') => {
    const updated = parsedEntries.map(entry => {
      let changed = false;
      const newExpenses = entry.expenses.map(exp => {
        if (exp.label.toLowerCase().includes(keyword.toLowerCase())) {
          changed = true;
          return { ...exp, type };
        }
        return exp;
      });
      return changed ? { ...entry, expenses: newExpenses } : entry;
    });
    setParsedEntries(validateEntries(updated));
    toast.success(`Applied "${type}" to matches for "${keyword}"`);
  };

  const handleUpdateEntry = (updatedEntry: ParsedEntry) => {
    setParsedEntries(validateEntries(parsedEntries.map(e => (e.id === updatedEntry.id ? updatedEntry : e))));
  };

  const handleSelectAll = (select: boolean) => {
    setParsedEntries(parsedEntries.map(e => ({ ...e, selected: select })));
  };

  const filteredEntries = useMemo(() => {
    if (filter === 'all') return parsedEntries;
    return parsedEntries.filter(e => e.status === filter);
  }, [parsedEntries, filter]);

  const stats = useMemo(() => {
    let ready = 0, warning = 0, error = 0, selected = 0;
    parsedEntries.forEach(e => {
      if (e.status === 'ready') ready++;
      else if (e.status === 'warning') warning++;
      else if (e.status === 'error') error++;
      if (e.selected) selected++;
    });
    return { ready, warning, error, selected };
  }, [parsedEntries]);

  const handleConfirmImport = async (action: DuplicateAction) => {
    setIsImporting(true);
    let added = 0;
    let skipped = 0;

    const toImport = parsedEntries.filter(e => e.selected);

    for (const entry of toImport) {
      const existing = entries.find(x => x.date === entry.date);
      const dayEntry: DayEntry = {
        id: existing?.id || entry.date,
        date: entry.date,
        day: entry.day,
        journalText: entry.journalText,
        gymAttended: entry.gymAttended,
        expenses: entry.expenses,
        notes: entry.notes,
        totalSpend: entry.totalSpend,
        totalInvested: entry.totalInvested
      };

      if (existing) {
        if (action === 'overwrite') {
          await updateEntry(dayEntry);
          added++;
        } else {
          skipped++;
        }
      } else {
        await addEntry(dayEntry);
        added++;
      }
    }

    setIsImporting(false);
    setImportSuccessMessage(`✅ Import complete. ${added} entries added. ${skipped} skipped (duplicates).`);
    resetState();
    
    // Smoothly scroll back to top of section or show toast
    toast.success('Import completed successfully!');
  };

  return (
    <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mt-8 md:mt-12">
      <div className="p-5 sm:p-6 border-b border-border bg-muted/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="p-2.5 bg-primary/10 text-primary rounded-xl hidden sm:block">
              <FileUp size={20} />
           </div>
           <div>
             <h2 className="text-base sm:text-lg font-bold text-foreground">Import from CSV</h2>
             <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Bring your legacy records exactly into MyDiary format</p>
           </div>
        </div>
      </div>
      <div className="p-6 md:p-8">

        {importSuccessMessage && (
          <div className="bg-success/20 text-success-foreground px-4 py-3 rounded-xl mb-6 font-medium text-sm border border-success/30 flex justify-between items-center">
            {importSuccessMessage}
            <button onClick={() => setImportSuccessMessage(null)} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>
        )}

        {/* STEP 1: UPLOAD */}
        {!fileDetails && (
          <FileUpload onParsed={handleFileParsed} />
        )}

        {fileDetails && (
          <div className="mb-8">
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-card">
                <div className="flex justify-center items-center gap-2 text-success mb-1">
                  <span className="text-xl">✅</span>
                  <span className="font-semibold text-sm">{fileDetails.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {(fileDetails.size / 1024).toFixed(1)} KB
                  <button onClick={resetState} className="ml-3 text-primary hover:underline font-medium">Reset File</button>
                </div>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW */}
        {parsedEntries.length > 0 && (
          <div className="space-y-6">
            <ParseSummaryBar 
              parsedCount={parsedEntries.length}
              warningCount={stats.warning}
              errorCount={stats.error}
              skippedCount={skippedCount}
            />
            
            <BulkTypeFixer onApply={handleApplyBulkType} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div className="flex bg-muted/50 p-1 rounded-lg border border-border">
                {(['all', 'ready', 'warning', 'error'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${
                      filter === f ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {f === 'all' ? 'All' : 
                     f === 'ready' ? '✅ Ready' :
                     f === 'warning' ? '⚠️ Warning' : '❌ Error'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 text-sm">
                <button className="text-primary hover:underline font-medium" onClick={() => handleSelectAll(true)}>Select All</button>
                <span className="text-muted-foreground">|</span>
                <button className="text-primary hover:underline font-medium" onClick={() => handleSelectAll(false)}>Deselect All</button>
              </div>
            </div>

            <div className="space-y-0">
               {filteredEntries.map(entry => (
                 <EntryPreviewRow 
                   key={entry.id} 
                   entry={entry} 
                   onChange={handleUpdateEntry} 
                 />
               ))}
               {filteredEntries.length === 0 && (
                 <div className="text-center py-10 text-muted-foreground text-sm bg-card border border-border rounded-xl">
                   No entries matching this filter.
                 </div>
               )}
            </div>

            <ImportConfirmBar 
              selectedCount={stats.selected}
              isImporting={isImporting}
              onCancel={resetState}
              onImportInit={() => {
                const selectedDates = parsedEntries.filter(e => e.selected).map(e => e.date);
                const existingMatches = entries.filter(e => selectedDates.includes(e.date));
                return { duplicates: existingMatches.map(e => `${e.date.slice(5).replace('-', ' ')}`) }; 
              }}
              onConfirm={handleConfirmImport}
            />
          </div>
        )}
      </div>
    </section>
  );
};
