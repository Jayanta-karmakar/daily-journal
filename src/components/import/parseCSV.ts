import { Expense } from '@/data/mockData';
import { ParsedEntry } from '@/components/import/types';
import { validateEntries } from '@/components/import/validateEntries';

function parseCSVQuotes(text: string): string[][] {
  const result: string[][] = [];
  let currentGroup: string[] = [];
  let currentFieldValue = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentFieldValue += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentGroup.push(currentFieldValue);
      currentFieldValue = "";
    } else if (char === '\n' && !inQuotes) {
      if (currentFieldValue.endsWith('\r')) {
        currentFieldValue = currentFieldValue.slice(0, -1);
      }
      currentGroup.push(currentFieldValue);
      result.push(currentGroup);
      currentGroup = [];
      currentFieldValue = "";
    } else if (char === '\r' && nextChar === '\n' && !inQuotes) {
      // skip
    } else {
      currentFieldValue += char;
    }
  }

  if (currentFieldValue || currentGroup.length > 0) {
    if (currentFieldValue.endsWith('\r') && !inQuotes) {
      currentFieldValue = currentFieldValue.slice(0, -1);
    }
    currentGroup.push(currentFieldValue);
    if (currentGroup.some(c => c !== "")) {
      result.push(currentGroup);
    }
  }
  return result;
}

const monthMap: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04',
  may: '05', jun: '06', jul: '07', aug: '08',
  sep: '09', oct: '10', nov: '11', dec: '12'
};

export function parseCSV(rawCSV: string): ParsedEntry[] {
  const rows = parseCSVQuotes(rawCSV);
  const parsedEntries: ParsedEntry[] = [];

  for (let i = 1; i < rows.length; i++) { // Skip header
    const row = rows[i];
    if (row.length < 5) continue;

    let [dateCol, dayCol, journalCol, totalSpendCol, descCol, gymCol, noteCol] = [
      row[0]?.trim() || '',
      row[1]?.trim() || '',
      row[2]?.trim() || '',
      row[3]?.trim() || '',
      row[4]?.trim() || '',
      row[5]?.trim() || '',
      row[6]?.trim() || ''
    ];

    if (!journalCol && !descCol && !totalSpendCol) continue; // Rule 1
    if (!dateCol.match(/^\d{1,2}\s+\w+$/)) continue; // Rule 2

    const cleanDesc = descCol.replace(/[\n\r]/g, '');
    const chunkStrings = cleanDesc.split('+').filter(c => c.trim().length > 0);

    let errFlags: string[] = [];
    const expenses: Expense[] = [];

    const [dRaw, mText] = dateCol.split(/\s+/);
    const mNum = monthMap[mText.toLowerCase()];
    if (!mNum) {
      errFlags.push(`Date could not be parsed: ${dateCol}`);
    }
    const parsedDate = `2026-${mNum || '01'}-${dRaw.padStart(2, '0')}`;

    for (const chunk of chunkStrings) {
      const trimmed = chunk.trim();
      const match = trimmed.match(/^(\d+)(.+)$/i);
      if (match) {
        expenses.push({
          id: crypto.randomUUID(),
          amount: parseInt(match[1]),
          label: match[2].trim(),
          type: 'need'
        });
      } else {
        errFlags.push(`Description chunk does not match pattern: "${chunk}"`);
      }
    }

    let warningFlags: string[] = [];
    if (expenses.length !== chunkStrings.length && errFlags.length === 0) {
      warningFlags.push(`Parsed expense count does not match expected from description`);
    }

    let gymState: 'yes' | 'no' | 'closed' = 'no';
    if (dayCol.toLowerCase() === 'sunday') {
      gymState = 'closed';
    } else if (gymCol.toUpperCase() === 'Y') {
      gymState = 'yes';
    } else if (gymCol.toUpperCase() === 'N') {
      gymState = 'no';
    }

    const newEntry: ParsedEntry = {
      id: crypto.randomUUID(),
      date: parsedDate,
      day: dayCol,
      journalText: journalCol,
      gymAttended: gymState,
      notes: noteCol || '',
      expenses: expenses,
      totalSpend: parseFloat(totalSpendCol) || 0,
      totalInvested: 0,
      status: 'ready',
      warnings: warningFlags,
      errors: errFlags,
      selected: true
    };

    parsedEntries.push(newEntry);
  }

  return validateEntries(parsedEntries);
}
