import { ParsedEntry } from './types';

const ABSOLUTE_HIGH_AMOUNT_THRESHOLD = 5000;
const RELATIVE_HIGH_AMOUNT_MULTIPLIER = 4;

/**
 * Validates a batch of parsed entries and recomputes their totals.
 *
 * "Unusually high" expense detection is data-driven — relative to the
 * median expense seen in this batch — rather than hardcoded to any one
 * person's specific bills/amounts, so it works sensibly for any user's
 * data (and doesn't leak personal financial details into the source code).
 *
 * `errors` and `parseNotes` are structural findings captured once at parse
 * time and are passed through unchanged. `warnings` are data-quality
 * checks recomputed fresh on every call (since this also runs after
 * inline edits in the preview UI), so they never accumulate duplicates.
 */
export function validateEntries(entries: ParsedEntry[]): ParsedEntry[] {
  const positiveAmounts = entries
    .flatMap(e => e.expenses.map(exp => exp.amount))
    .filter(a => a > 0)
    .sort((a, b) => a - b);

  const median = positiveAmounts.length > 0
    ? positiveAmounts[Math.floor(positiveAmounts.length / 2)]
    : 0;
  const highThreshold = Math.max(ABSOLUTE_HIGH_AMOUNT_THRESHOLD, median * RELATIVE_HIGH_AMOUNT_MULTIPLIER);

  return entries.map(entry => {
    const warnings: string[] = [];
    const errors: string[] = entry.errors || [];
    const parseNotes: string[] = entry.parseNotes || [];

    if (entry.journalText.trim().length > 0 && entry.journalText.trim().length < 5) {
      warnings.push('Journal text is under 5 characters');
    }

    let spend = 0;
    let invested = 0;

    entry.expenses.forEach(exp => {
      if (exp.amount === 0) {
        warnings.push(`Expense "${exp.label}" amount is ₹0 — check the description column`);
      } else if (exp.amount > highThreshold) {
        warnings.push(`Expense "${exp.label}" (₹${exp.amount}) looks unusually high for this batch — double check it`);
      }

      if (exp.type === 'need' || exp.type === 'want') {
        spend += exp.amount;
      } else {
        invested += exp.amount;
      }
    });

    let status: 'ready' | 'warning' | 'error' = 'ready';
    if (errors.length > 0) {
      status = 'error';
    } else if (warnings.length > 0 || parseNotes.length > 0) {
      status = 'warning';
    }

    return {
      ...entry,
      totalSpend: spend,
      totalInvested: invested,
      status,
      warnings,
      errors,
      parseNotes,
      selected: status === 'error' ? false : entry.selected,
    };
  });
}
