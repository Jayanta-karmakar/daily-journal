import { supabase } from './supabase';
import { getSyncQueue, removeFromSyncQueue, SyncOperation } from './db';
import { DayEntry, MonthConfig } from '@/data/mockData';
import type { Session } from '@supabase/supabase-js';

export const processSyncQueue = async (session: Session | null) => {
  const userId = session?.user?.id;
  if (!navigator.onLine || !userId) return;

  // Each user's offline sync queue now lives in that user's own
  // namespaced IndexedDB database (see lib/db.ts), so this queue can
  // only ever contain operations this same user queued themselves —
  // it's no longer possible to replay another account's pending writes
  // into this session.
  const queue = await getSyncQueue(userId);
  if (queue.length === 0) return;

  console.log(`Processing ${queue.length} items in sync queue...`);

  for (const operation of queue) {
    let success = false;
    try {
      if (operation.type === 'ADD_ENTRY' || operation.type === 'UPDATE_ENTRY') {
        success = await syncEntry(userId, operation.payload as DayEntry, operation.type);
      } else if (operation.type === 'DELETE_ENTRY') {
        const payload = operation.payload as { date: string };
        const { error } = await supabase.from('entries').delete().eq('date', payload.date).eq('user_id', userId);
        success = !error;
      } else if (operation.type === 'UPDATE_CONFIG') {
        const payload = operation.payload as MonthConfig;
        const { error } = await supabase.from('month_configs').upsert({
          user_id: userId,
          month: payload.month,
          daily_spend_limit: payload.dailySpendLimit,
          monthly_budget: payload.monthlyBudget,
        }, { onConflict: 'user_id, month' });
        success = !error;
      }

      if (success && operation.id) {
        await removeFromSyncQueue(userId, operation.id);
      }
    } catch (e) {
      console.error('Error syncing operation:', operation, e);
    }
  }
};

const syncEntry = async (userId: string, entry: DayEntry, type: 'ADD_ENTRY' | 'UPDATE_ENTRY') => {
  // Check if entry exists
  const { data: existingData } = await supabase.from('entries').select('id').eq('date', entry.date).eq('user_id', userId).single();
  
  let entryId = existingData?.id;

  if (type === 'ADD_ENTRY' && !existingData) {
    const { data: newEntryData, error } = await supabase
      .from('entries')
      .insert({
        user_id: userId,
        date: entry.date,
        day: entry.day,
        journal_text: entry.journalText,
        gym_attended: entry.gymAttended,
        notes: entry.notes,
        total_spend: entry.totalSpend,
        total_invested: entry.totalInvested,
      })
      .select('id')
      .single();
    
    if (error || !newEntryData) return false;
    entryId = newEntryData.id;
  } else if (type === 'UPDATE_ENTRY' || (type === 'ADD_ENTRY' && existingData)) {
    // Both act as an update if it already exists
    if (!entryId) return false;
    const { error } = await supabase
      .from('entries')
      .update({
        journal_text: entry.journalText,
        gym_attended: entry.gymAttended,
        notes: entry.notes,
        total_spend: entry.totalSpend,
        total_invested: entry.totalInvested,
      })
      .eq('id', entryId)
      .eq('user_id', userId);

    if (error) return false;
  }

  // Handle expenses sync
  if (entryId) {
    // entryId was only ever resolved via a user_id-scoped lookup above,
    // but we still scope this delete by user_id defensively so a future
    // refactor can't accidentally widen entryId's provenance.
    await supabase.from('expenses').delete().eq('entry_id', entryId).eq('user_id', userId);
    if (entry.expenses.length > 0) {
      const expensesToInsert = entry.expenses.map((e) => ({
        user_id: userId,
        entry_id: entryId,
        label: e.label,
        amount: e.amount,
        expense_type: e.type,
      }));
      const { error: insertError } = await supabase.from('expenses').insert(expensesToInsert);
      if (insertError) return false;
    }
  }

  return true;
};
