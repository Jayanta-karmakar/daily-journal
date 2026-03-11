import { DayEntry } from '@/data/mockData';

export interface ParsedEntry extends DayEntry {
  status: 'ready' | 'warning' | 'error';
  warnings: string[];
  errors: string[];
  selected: boolean;
}
