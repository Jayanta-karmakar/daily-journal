import { ParsedEntry } from './types';

export function validateEntries(entries: ParsedEntry[]): ParsedEntry[] {
  return entries.map(entry => {
    let warnings: string[] = [];
    if (entry.warnings?.includes('Parsed expense count does not match expected from description')) {
      warnings.push('Parsed expense count does not match expected from description');
    }
    let errors: string[] = [...(entry.errors || [])];

    if (entry.journalText.length > 0 && entry.journalText.length < 5) {
      warnings.push(`Journal text is under 5 characters`);
    }

    let spend = 0;
    let invested = 0;

    entry.expenses.forEach(exp => {
      if (exp.amount === 0) {
        warnings.push(`Expense "${exp.label}" amount is 0`);
      }
      if (exp.amount > 5000) {
        warnings.push(`Expense "${exp.label}" amount is unusually high`);
      } else if (
        (exp.amount === 4890 && exp.label.toLowerCase() === 'rent') ||
        (exp.amount === 4650 && exp.label.toLowerCase() === 'pujadueforrent') ||
        (exp.amount === 3000 && exp.label.toLowerCase() === 'suvendudueforbroker') ||
        (exp.amount === 2745 && exp.label.toLowerCase() === 'creditcardbill')
      ) {
        warnings.push(`Expense "${exp.label}" flagged as high amount (${exp.amount})`);
      }
      if (exp.type === 'need' || exp.type === 'want') {
        spend += exp.amount;
      } else {
        invested += exp.amount;
      }
    });

    // Check count matching 
    if (errors.length === 0 && entry.expenses.length === 0 && entry.notes.length === 0) {
      // It's possible for description to be empty
    }

    let status: 'ready' | 'warning' | 'error' = 'ready';
    if (errors.length > 0) {
      status = 'error';
    } else if (warnings.length > 0) {
      status = 'warning';
    }

    return {
      ...entry,
      totalSpend: spend,
      totalInvested: invested,
      status,
      warnings,
      errors,
      selected: status === 'error' ? false : entry.selected,
    };
  });
}
