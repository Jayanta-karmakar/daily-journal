import React, { useState, useMemo } from 'react';
import JSZip from 'jszip';
import { FileUp, Download } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { ParseSummaryBar } from './ParseSummaryBar';
import { BulkTypeFixer } from './BulkTypeFixer';
import { EntryPreviewRow } from './EntryPreviewRow';
import { ImportConfirmBar, DuplicateAction } from './ImportConfirmBar';
import { ParsedEntry } from './types';
import { validateEntries } from './validateEntries';
import { buildEntriesFromRows, RawRow } from './rowMapping';
import { useAppContext } from '@/context/AppContext';
import { DayEntry } from '@/data/mockData';
import { toast } from 'sonner';
import { ConfirmModal } from '../ConfirmModal';
import { Loader2 } from 'lucide-react';

type FilterTab = 'all' | 'ready' | 'warning' | 'error';

const IMPORT_CONCURRENCY = 4;

async function runWithConcurrency<T>(items: T[], limit: number, worker: (item: T) => Promise<void>): Promise<void> {
  let cursor = 0;
  async function next(): Promise<void> {
    const i = cursor++;
    if (i >= items.length) return;
    await worker(items[i]);
    return next();
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => next()));
}

export const ImportSection = () => {
  const { entries, addEntry, updateEntry, refreshEntries } = useAppContext();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number } | null>(null);
  const [rawRows, setRawRows] = useState<RawRow[] | null>(null);
  const [parsedEntries, setParsedEntries] = useState<ParsedEntry[]>([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [needsYearSelector, setNeedsYearSelector] = useState(false);

  const [filter, setFilter] = useState<FilterTab>('all');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0 });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [importSummary, setImportSummary] = useState({ added: 0, skipped: 0 });

  const handleFileParsed = (rows: RawRow[], filename: string, size: number) => {
    setRawRows(rows);
    setFileMeta({ name: filename, size });
    setImportSummary({ added: 0, skipped: 0 });
    setShowSuccessModal(false);
  };

  // Build entries from the cached rows whenever they change, or the target
  // year changes (only relevant for legacy year-less date formats).
  React.useEffect(() => {
    if (!rawRows) return;
    const { entries: built, skippedRows, needsYearSelector: needsYear } = buildEntriesFromRows(rawRows, selectedYear);
    setParsedEntries(validateEntries(built));
    setSkippedCount(skippedRows);
    setNeedsYearSelector(needsYear);
  }, [rawRows, selectedYear]);

  const resetState = () => {
    setFileMeta(null);
    setRawRows(null);
    setParsedEntries([]);
    setSkippedCount(0);
    setFilter('all');
    // We keep selectedYear as it is likely the user wants the same year for next file
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
    const visibleIds = new Set(filteredEntries.map(e => e.id));
    setParsedEntries(parsedEntries.map(e =>
      visibleIds.has(e.id) ? { ...e, selected: select } : e
    ));
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
    const toImport = parsedEntries.filter(e => e.selected);
    setIsImporting(true);
    setImportProgress({ done: 0, total: toImport.length });

    let added = 0;
    let skipped = 0;

    await runWithConcurrency(toImport, IMPORT_CONCURRENCY, async (entry) => {
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
        totalInvested: entry.totalInvested,
      };

      try {
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
      } catch (err) {
        console.error(`Failed to import entry for ${entry.date}:`, err);
        skipped++;
      } finally {
        setImportProgress(prev => ({ ...prev, done: prev.done + 1 }));
      }
    });

    await refreshEntries();
    setIsImporting(false);
    setImportSummary({ added, skipped });
    setShowSuccessModal(true);
    resetState();
  };

  const handleDownloadSample = async () => {
    const sampleFiles = [
      'sample_diary.csv',
      'december_2025.csv',
      'january_2026.csv',
      'february_2026.csv'
    ];

    try {
      toast.loading('Preparing sample files bundle...', { id: 'zip-download' });
      const zip = new JSZip();
      const folder = zip.folder("daily_journal_samples");

      // Fetch all files and add to zip
      await Promise.all(sampleFiles.map(async (fileName) => {
        const response = await fetch(`/${fileName}`);
        if (!response.ok) throw new Error(`Failed to fetch ${fileName}`);
        const blob = await response.blob();
        folder?.file(fileName, blob);
      }));

      // Generate zip and download
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = "daily_journal_samples.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Samples downloaded as ZIP!', { id: 'zip-download' });
    } catch (error) {
      console.error('Error creating zip:', error);
      toast.error('Failed to bundle samples. Please try again.', { id: 'zip-download' });
    }
  };

  return (
    <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mt-8 md:mt-12 relative">
      {/* SOFT LOADER OVERLAY */}
      {isImporting && (
        <div className="fixed inset-0 z-[1000] bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="bg-card border border-border p-10 rounded-[40px] shadow-2xl flex flex-col items-center gap-6 max-w-xs w-full">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse"></div>
              <Loader2 className="w-12 h-12 text-primary animate-spin relative" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-foreground mb-2">Importing Data</h3>
              {importProgress.total > 0 && (
                <>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${Math.round((importProgress.done / importProgress.total) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs font-bold text-foreground/60 uppercase tracking-widest">
                    {importProgress.done} / {importProgress.total} entries
                  </p>
                </>
              )}
              <p className="text-xs font-bold text-foreground/60 uppercase tracking-widest animate-pulse mt-1">Please wait, don't close...</p>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      <ConfirmModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
        title="Import Successful"
        message={`We've successfully processed your file. ${importSummary.added} entries were added to your diary, and ${importSummary.skipped} duplicates were safely skipped.`}
        confirmText="Awesome, take me back"
        variant="info"
      />

      <div className="p-5 sm:p-6 border-b border-border bg-muted/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <div className="p-2.5 bg-primary/10 text-primary rounded-xl hidden sm:block">
              <FileUp size={20} />
           </div>
           <div>
             <h2 className="text-base sm:text-lg font-bold text-foreground">Import from CSV or Excel</h2>
             <p className="text-xs sm:text-sm text-foreground/70 mt-0.5">Bring your legacy records exactly into MyDiary format</p>
           </div>
        </div>
        <button
          onClick={handleDownloadSample}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border text-foreground/70 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all text-xs font-bold shadow-sm self-end sm:self-center"
        >
          <Download size={14} />
          Download Sample CSV
        </button>
      </div>
      <div className="p-6 md:p-8">

        {/* STEP 1: UPLOAD */}
        {!fileMeta && (
          <FileUpload onParsed={handleFileParsed} />
        )}

        {/* YEAR SELECTION - only shown when the file's date format has no year (legacy "1 Jan" style) */}
        {fileMeta && needsYearSelector && (
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-center gap-4 p-4 rounded-2xl border transition-all bg-muted/30 border-border animate-in slide-in-from-top duration-500">
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-bold text-foreground">Target Year</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Your dates don't include a year — pick one to assign
              </p>
            </div>
            <div className="flex bg-background p-1 rounded-xl shadow-sm border border-border">
              {[2024, 2025, 2026, 2027].map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year.toString())}
                  className={`px-4 py-2 rounded-lg text-sm font-black transition-all ${
                    selectedYear === year.toString()
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}

        {fileMeta && (
          <div className="mb-8">
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-card">
                <div className="flex justify-center items-center gap-2 text-success mb-1">
                  <span className="text-xl">✅</span>
                  <span className="font-semibold text-sm">{fileMeta.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {(fileMeta.size / 1024).toFixed(1)} KB
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

              <div className="flex items-center gap-3 bg-muted/30 px-3 py-2 rounded-xl border border-border/50">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-primary cursor-pointer"
                  checked={filteredEntries.length > 0 && filteredEntries.every(e => e.selected)}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <span className="text-xs font-bold text-foreground/70 uppercase tracking-widest select-none">Select All Visible</span>
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
