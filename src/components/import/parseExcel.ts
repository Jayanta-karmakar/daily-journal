import { readSheet } from 'read-excel-file/browser';
import { ParsedEntry } from '@/components/import/types';
import { validateEntries } from '@/components/import/validateEntries';
import { buildEntriesFromRows, RawRow } from '@/components/import/rowMapping';

/** Reads the first sheet of an .xlsx/.xls file into a generic 2D row array. */
export async function parseExcelToRows(file: File): Promise<RawRow[]> {
  const rows = await readSheet(file);
  return rows as RawRow[];
}

/** Parses an uploaded Excel file directly into validated journal entries. */
export async function parseExcelFile(file: File, year: string): Promise<ParsedEntry[]> {
  const rows = await parseExcelToRows(file);
  const { entries } = buildEntriesFromRows(rows, year);
  return validateEntries(entries);
}
