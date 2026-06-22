import { describe, it, expect } from 'vitest';
import { parseCSV } from '@/components/import/parseCSV';

// A trimmed-down real export shape: legacy day-month-no-year dates, a
// description column using "+"-joined "amountLabel" chunks, a bare-number
// chunk with no label text ("140"), a multi-line description (wrapped
// across CSV rows inside quotes), and the trailing footer/summary rows
// ("Total", blank lines, "Average Cost Per Day") that real exports include.
const SAMPLE_CSV = `Date,Day,Journal,Total Spend,Description,GYM,Note
1 Jan,Thursday,"Late morning, travel to home bankura",371,"50beardTrip+30luchi+20auto+15bus+80train
+50bus+126med",N,
5 Jan,Monday,"Late morning, office day, called mom, PG",101,10bus+50lunch+41dinner,N,
6 Jan,Tuesday,"Late morning, office day, called mom, PG",357,"10bus+10chira+95lunch+140+20train
+82dinner(Suvend and me)",N,
4 Jan,Sunday,"Late morning, travelled back to kolkata",563,448momrecharge+40chips+40samosha+20water+15auto,N,
,,Total,Rs 19040,Total Count,0,
,,,,,,
,,Average Cost Per Day,614.19,,,
`;

describe('parseCSV', () => {
  const entries = parseCSV(SAMPLE_CSV, '2026');

  it('parses one entry per real data row and skips footer/blank rows', () => {
    expect(entries).toHaveLength(4);
  });

  it('assigns the selected year to legacy day-month-only dates', () => {
    const jan1 = entries.find(e => e.day === 'Thursday');
    expect(jan1?.date).toBe('2026-01-01');
  });

  it('parses a bare numeric chunk with no label ("140") instead of erroring the whole row', () => {
    const jan6 = entries.find(e => e.day === 'Tuesday');
    expect(jan6?.errors).toHaveLength(0);
    expect(jan6?.expenses.some(e => e.amount === 140 && e.label === 'Expense')).toBe(true);
  });

  it('parses multi-line quoted description chunks split across CSV rows', () => {
    const jan1 = entries.find(e => e.day === 'Thursday');
    expect(jan1?.expenses.map(e => e.label)).toEqual(
      expect.arrayContaining(['beardTrip', 'luchi', 'auto', 'bus', 'train', 'med'])
    );
  });

  it('recomputes totalSpend from parsed expenses and matches the sheet total', () => {
    const jan1 = entries.find(e => e.day === 'Thursday');
    // 50+30+20+15+80+50+126 = 371, matching the sheet's "Total Spend" column
    expect(jan1?.totalSpend).toBe(371);
    expect(jan1?.parseNotes.some(n => n.includes("doesn't match"))).toBe(false);
  });

  it('every row keeps its own gym status from the GYM column', () => {
    expect(entries.every(e => e.gymAttended === 'no')).toBe(true);
  });
});
