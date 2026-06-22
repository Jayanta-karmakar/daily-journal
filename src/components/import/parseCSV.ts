import { ParsedEntry } from '@/components/import/types';
import { validateEntries } from '@/components/import/validateEntries';
import { buildEntriesFromRows, RawRow } from '@/components/import/rowMapping';

/**
 * Tokenizes raw CSV text into rows of string cells. Handles quoted fields
 * (including embedded commas and newlines), doubled-quote escaping, a
 * leading UTF-8 BOM (common from Excel/Sheets exports), and both \n and
 * \r\n line endings.
 */
export function parseCSVToRows(text: string): RawRow[] {
  const cleaned = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  const result: RawRow[] = [];
  let currentGroup: string[] = [];
  let currentFieldValue = '';
  let inQuotes = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const nextChar = cleaned[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentFieldValue += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentGroup.push(currentFieldValue);
      currentFieldValue = '';
    } else if (char === '\n' && !inQuotes) {
      if (currentFieldValue.endsWith('\r')) {
        currentFieldValue = currentFieldValue.slice(0, -1);
      }
      currentGroup.push(currentFieldValue);
      result.push(currentGroup);
      currentGroup = [];
      currentFieldValue = '';
    } else if (char === '\r' && nextChar === '\n' && !inQuotes) {
      // handled by the \n branch above
    } else {
      currentFieldValue += char;
    }
  }

  if (currentFieldValue || currentGroup.length > 0) {
    if (currentFieldValue.endsWith('\r') && !inQuotes) {
      currentFieldValue = currentFieldValue.slice(0, -1);
    }
    currentGroup.push(currentFieldValue);
    if (currentGroup.some(c => c !== '')) {
      result.push(currentGroup);
    }
  }

  return result;
}

/** Parses raw CSV text directly into validated journal entries. */
export function parseCSV(rawCSV: string, year: string): ParsedEntry[] {
  const rows = parseCSVToRows(rawCSV);
  const { entries } = buildEntriesFromRows(rows, year);
  return validateEntries(entries);
}
