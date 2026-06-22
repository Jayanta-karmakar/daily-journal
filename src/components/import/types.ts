import { DayEntry } from '@/data/mockData';

export interface ParsedEntry extends DayEntry {
  status: 'ready' | 'warning' | 'error';
  /** Data-quality warnings, recomputed every time the entry is validated (e.g. amount/journal checks). */
  warnings: string[];
  /** Structural notes captured at parse time (date/day mismatches, unparseable expense chunks). Persist across edits. */
  parseNotes: string[];
  /** Structural errors captured at parse time (e.g. unparseable date). Persist across edits. */
  errors: string[];
  selected: boolean;
}
