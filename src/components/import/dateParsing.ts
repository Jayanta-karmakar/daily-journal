import { parse, isValid } from 'date-fns';

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Formats tried in order. Year-bearing formats are tried first so a year
// present in the data is never silently overridden by the "Target Year"
// fallback. Day-first formats are tried before month-first ones since
// MyDiary's primary usage is day-first (DD/MM/YYYY) dates.
const DATE_FORMATS_WITH_YEAR = [
  'yyyy-MM-dd',
  'dd/MM/yyyy',
  'dd-MM-yyyy',
  'MM/dd/yyyy',
  'd MMM yyyy',
  'd MMMM yyyy',
  'MMM d, yyyy',
  'MMMM d, yyyy',
  'MMM d yyyy',
];

// Legacy MyDiary format used in the original CSV templates: no year, e.g. "1 Jan".
const DATE_FORMATS_WITHOUT_YEAR = [
  'd MMM',
  'd MMMM',
  'MMM d',
  'MMMM d',
];

export interface DateParseResult {
  isoDate: string | null;
  computedDay: string;
  usedFallbackYear: boolean;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function toIsoLocal(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toIsoUTC(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/**
 * Flexibly parses a date cell coming from either a CSV (always a string)
 * or an Excel sheet (a real `Date` object for date-formatted cells, or a
 * raw serial number for unformatted ones). Falls back to `fallbackYear`
 * for legacy year-less formats like "1 Jan".
 */
export function parseDateFlexible(raw: unknown, fallbackYear: string): DateParseResult {
  // Excel date-formatted cells come through as real Date objects already.
  if (raw instanceof Date && !isNaN(raw.getTime())) {
    return { isoDate: toIsoLocal(raw), computedDay: DAY_NAMES[raw.getDay()], usedFallbackYear: false };
  }

  // An Excel cell stored as a plain (unformatted) number that's actually a
  // date — Excel's serial date system, epoch 1899-12-30. Only treat it as
  // a date if it falls in a plausible range (~2009 - ~2090).
  if (typeof raw === 'number' && raw > 40000 && raw < 70000) {
    const excelEpoch = Date.UTC(1899, 11, 30);
    const candidate = new Date(excelEpoch + raw * 86400000);
    if (!isNaN(candidate.getTime())) {
      return { isoDate: toIsoUTC(candidate), computedDay: DAY_NAMES[candidate.getUTCDay()], usedFallbackYear: false };
    }
  }

  const str = String(raw ?? '').trim();
  if (!str) {
    return { isoDate: null, computedDay: '', usedFallbackYear: false };
  }

  for (const fmt of DATE_FORMATS_WITH_YEAR) {
    const candidate = parse(str, fmt, new Date());
    if (isValid(candidate) && candidate.getFullYear() > 1970 && candidate.getFullYear() < 2200) {
      return { isoDate: toIsoLocal(candidate), computedDay: DAY_NAMES[candidate.getDay()], usedFallbackYear: false };
    }
  }

  const yearNum = parseInt(fallbackYear, 10) || new Date().getFullYear();
  for (const fmt of DATE_FORMATS_WITHOUT_YEAR) {
    const candidate = parse(str, fmt, new Date(yearNum, 0, 1));
    if (isValid(candidate)) {
      candidate.setFullYear(yearNum);
      return { isoDate: toIsoLocal(candidate), computedDay: DAY_NAMES[candidate.getDay()], usedFallbackYear: true };
    }
  }

  // Last resort: let the JS engine try, but only trust it if the string
  // actually contains a 4-digit year (otherwise it tends to guess wrong,
  // e.g. interpreting "5/3" as a far-future or far-past date).
  if (/\d{4}/.test(str)) {
    const native = new Date(str);
    if (!isNaN(native.getTime())) {
      return { isoDate: toIsoLocal(native), computedDay: DAY_NAMES[native.getDay()], usedFallbackYear: false };
    }
  }

  return { isoDate: null, computedDay: '', usedFallbackYear: false };
}
