import { Expense } from '@/data/mockData';

export interface ExpenseParseResult {
  expenses: Expense[];
  warnings: string[];
}

function cleanAmount(raw: string): number | null {
  const cleaned = raw.replace(/^rs\.?\s*/i, '').replace(/[₹$,\s]/g, '');
  if (!cleaned) return null;
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

/**
 * Parses a free-form expense description chunk into amount + label.
 * Handles several real-world shapes:
 *   "50beardTrip"        - leading amount, no separator
 *   "₹50 coffee"         - leading amount with currency symbol
 *   "Rs. 120 lunch"       - leading amount with "Rs" prefix
 *   "lunch - 120"         - trailing amount with separator
 *   "lunch: 120"          - trailing amount with separator
 *   "500"                 - bare amount, no label
 */
function parseChunk(chunk: string): { amount: number | null; label: string } {
  const pureNumber = chunk.match(/^(?:rs\.?\s*|[₹$]\s*)?([\d,]+(?:\.\d+)?)$/i);
  if (pureNumber) {
    return { amount: cleanAmount(pureNumber[1]), label: 'Expense' };
  }

  const leading = chunk.match(/^(?:rs\.?\s*|[₹$]\s*)?([\d,]+(?:\.\d+)?)\s*(.+)$/i);
  if (leading && leading[2]?.trim()) {
    return { amount: cleanAmount(leading[1]), label: leading[2].trim() };
  }

  const trailing = chunk.match(/^(.+?)[\s:=-]+(?:rs\.?\s*|[₹$]\s*)?([\d,]+(?:\.\d+)?)$/i);
  if (trailing) {
    return { amount: cleanAmount(trailing[2]), label: trailing[1].trim() };
  }

  return { amount: null, label: chunk };
}

/**
 * Parses a whole expense-description cell (e.g. "50beardTrip+30luchi") into
 * individual labelled expenses. Unlike a strict parser, this never silently
 * drops a chunk it can't fully understand — unparseable chunks are kept as
 * a ₹0 expense with a warning so nothing disappears without the user
 * noticing in the import preview.
 */
export function parseExpenseDescription(raw: unknown): ExpenseParseResult {
  const text = String(raw ?? '').replace(/\r/g, '');
  const warnings: string[] = [];
  if (!text.trim()) {
    return { expenses: [], warnings };
  }

  const chunks = text.split(/[+\n;]/).map(c => c.trim()).filter(Boolean);
  const expenses: Expense[] = [];

  for (const chunk of chunks) {
    const { amount, label } = parseChunk(chunk);

    if (amount === null) {
      expenses.push({ id: crypto.randomUUID(), amount: 0, label: chunk, type: 'need' });
      warnings.push(`could not read an amount from "${chunk}" — added at ₹0, please fix`);
    } else {
      expenses.push({ id: crypto.randomUUID(), amount, label: label || 'Expense', type: 'need' });
    }
  }

  return { expenses, warnings };
}
