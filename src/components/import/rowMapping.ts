import { ParsedEntry } from './types';
import { parseDateFlexible } from './dateParsing';
import { parseExpenseDescription } from './expenseParsing';

export type RawCell = string | number | boolean | Date | null | undefined;
export type RawRow = RawCell[];

interface ColumnMap {
  date: number;
  day: number;
  journal: number;
  totalSpend: number;
  description: number;
  gym: number;
  note: number;
}

type ColumnField = keyof ColumnMap;

const HEADER_ALIASES: Record<ColumnField, string[]> = {
  date: ['date', 'day date', 'entry date'],
  day: ['day', 'weekday', 'day of week'],
  journal: ['journal', 'journal entry', 'entry', 'diary', 'journal text'],
  totalSpend: ['total spend', 'total', 'spend', 'amount spent', 'total amount', 'spent', 'total spent'],
  description: ['description', 'expenses', 'expense', 'desc', 'expense breakdown', 'breakdown', 'expense description'],
  gym: ['gym', 'workout', 'exercise', 'gym attended'],
  note: ['note', 'notes', 'remark', 'remarks', 'extra', 'comment', 'comments'],
};

// MyDiary's original fixed column order, used as a fallback when a file
// has no recognizable header row.
const LEGACY_POSITIONAL_MAP: ColumnMap = {
  date: 0, day: 1, journal: 2, totalSpend: 3, description: 4, gym: 5, note: 6,
};

function normalizeHeaderCell(cell: RawCell): string {
  return String(cell ?? '').trim().toLowerCase();
}

function detectColumnMap(headerRow: RawRow): ColumnMap | null {
  const normalized = headerRow.map(normalizeHeaderCell);
  const found: Partial<ColumnMap> = {};

  (Object.keys(HEADER_ALIASES) as ColumnField[]).forEach(field => {
    const idx = normalized.findIndex(h => HEADER_ALIASES[field].includes(h));
    if (idx !== -1) found[field] = idx;
  });

  // Require a recognizable "date" column plus at least two more recognized
  // fields before trusting header-based detection; otherwise fall back to
  // the legacy fixed column order.
  const recognizedCount = Object.values(found).filter(v => v !== undefined).length;
  if (found.date === undefined || recognizedCount < 3) {
    return null;
  }

  return {
    date: found.date,
    day: found.day ?? -1,
    journal: found.journal ?? -1,
    totalSpend: found.totalSpend ?? -1,
    description: found.description ?? -1,
    gym: found.gym ?? -1,
    note: found.note ?? -1,
  };
}

function cell(row: RawRow, index: number): RawCell {
  if (index === -1 || index >= row.length) return undefined;
  return row[index];
}

function cellText(row: RawRow, index: number): string {
  const v = cell(row, index);
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return v.toLocaleDateString();
  return String(v).trim();
}

function isRowBlank(row: RawRow): boolean {
  return row.every(c => c === null || c === undefined || String(c).trim() === '');
}

function parseGym(raw: RawCell, day: string): 'yes' | 'no' | 'closed' {
  const str = String(raw ?? '').trim().toLowerCase();
  if (['y', 'yes', 'true', '1', 'present', 'done'].includes(str)) return 'yes';
  if (['closed', 'rest', 'off', 'holiday'].includes(str)) return 'closed';
  if (['n', 'no', 'false', '0'].includes(str)) return 'no';
  if (!str && day.toLowerCase() === 'sunday') return 'closed';
  return 'no';
}

function parseAmountLike(raw: RawCell): number {
  if (typeof raw === 'number') return raw;
  const cleaned = String(raw ?? '').replace(/^rs\.?\s*/i, '').replace(/[₹$,\s]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? NaN : n;
}

export interface BuildEntriesResult {
  entries: ParsedEntry[];
  skippedRows: number;
  usedFallbackMapping: boolean;
  needsYearSelector: boolean;
}

/**
 * Converts a generic 2D array of cells (from either a CSV or an Excel
 * sheet) into ParsedEntry objects. Column order is detected from the
 * header row when possible — so reordered or renamed columns still work —
 * and falls back to MyDiary's original fixed column order otherwise.
 *
 * Rows with no date at all (blank lines, or footer/summary rows like
 * "Total" / "Average Cost Per Day") are skipped quietly. Rows that have a
 * date but it can't be understood are kept and surfaced as an error in
 * the import preview, rather than silently disappearing.
 */
export function buildEntriesFromRows(rows: RawRow[], year: string): BuildEntriesResult {
  if (rows.length === 0) {
    return { entries: [], skippedRows: 0, usedFallbackMapping: false, needsYearSelector: false };
  }

  const headerRow = rows[0];
  const detectedMap = detectColumnMap(headerRow);
  const columnMap = detectedMap ?? LEGACY_POSITIONAL_MAP;
  const dataRows = rows.slice(1);

  const entries: ParsedEntry[] = [];
  let skippedRows = 0;
  let needsYearSelector = false;

  dataRows.forEach((row, idx) => {
    const rowNumber = idx + 2; // +1 for header, +1 for 1-based row numbering

    if (isRowBlank(row)) {
      skippedRows++;
      return;
    }

    const dateRaw = cell(row, columnMap.date);
    const dateIsEmpty = dateRaw === null || dateRaw === undefined || String(dateRaw).trim() === '';

    // Rows with no date at all aren't journal entries — they're footer or
    // summary rows (e.g. "Total", "Average Cost Per Day") or stray blank
    // lines. Skip quietly instead of flagging as broken entries.
    if (dateIsEmpty) {
      skippedRows++;
      return;
    }

    const dayRaw = cellText(row, columnMap.day);
    const journalRaw = cellText(row, columnMap.journal);
    const totalSpendRaw = cell(row, columnMap.totalSpend);
    const descRaw = cell(row, columnMap.description);
    const gymRaw = cell(row, columnMap.gym);
    const noteRaw = cellText(row, columnMap.note);

    const { isoDate, computedDay, usedFallbackYear } = parseDateFlexible(dateRaw, year);
    if (usedFallbackYear) needsYearSelector = true;

    const errors: string[] = [];
    const parseNotes: string[] = [];

    if (!isoDate) {
      errors.push(`Row ${rowNumber}: could not understand the date "${String(dateRaw)}"`);
    }

    const day = dayRaw || computedDay || '';
    if (dayRaw && computedDay && dayRaw.toLowerCase() !== computedDay.toLowerCase()) {
      parseNotes.push(`Row ${rowNumber}: listed day "${dayRaw}" doesn't match the date (expected ${computedDay})`);
    }

    const { expenses, warnings: expenseWarnings } = parseExpenseDescription(descRaw);
    expenseWarnings.forEach(w => parseNotes.push(`Row ${rowNumber}: ${w}`));

    const expenseSum = expenses.reduce((s, e) => s + e.amount, 0);
    const sheetTotal = parseAmountLike(totalSpendRaw);
    if (!isNaN(sheetTotal) && expenses.length > 0 && Math.abs(sheetTotal - expenseSum) > 0.5) {
      parseNotes.push(`Row ${rowNumber}: sheet total (₹${sheetTotal}) doesn't match the sum of parsed expenses (₹${expenseSum}) — double check the description column`);
    }

    const entry: ParsedEntry = {
      id: crypto.randomUUID(),
      date: isoDate || `${year}-01-01`,
      day,
      journalText: journalRaw,
      gymAttended: parseGym(gymRaw, day),
      notes: noteRaw,
      expenses,
      totalSpend: expenseSum,
      totalInvested: 0,
      status: 'ready',
      warnings: [],
      parseNotes,
      errors,
      selected: true,
    };

    entries.push(entry);
  });

  return { entries, skippedRows, usedFallbackMapping: !detectedMap, needsYearSelector };
}
