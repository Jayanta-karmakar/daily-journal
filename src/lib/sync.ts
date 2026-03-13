import { supabase } from './supabase';
import { getSyncQueue, removeFromSyncQueue, SyncOperation } from './db';
import { DayEntry, MonthConfig } from '@/data/mockData';

export const processSyncQueue = async (session: any) => {
  if (!navigator.onLine || !session?.user?.id) return;

  const queue = await getSyncQueue();
  if (queue.length === 0) return;

  console.log(`Processing ${queue.length} items in sync queue...`);
  
  for (const operation of queue) {
    let success = false;
    try {
      if (operation.type === 'ADD_ENTRY' || operation.type === 'UPDATE_ENTRY') {
        success = await syncEntry(session.user.id, operation.payload as DayEntry, operation.type);
      } else if (operation.type === 'DELETE_ENTRY') {
        const payload = operation.payload as { date: string };
        const { error } = await supabase.from('entries').delete().eq('date', payload.date).eq('user_id', session.user.id);
        success = !error;
      } else if (operation.type === 'UPDATE_CONFIG') {
        const payload = operation.payload as MonthConfig;
        const { error } = await supabase.from('month_configs').upsert({
          user_id: session.user.id,
          month: payload.month,
          salary: payload.salary,
          daily_spend_limit: payload.dailySpendLimit,
          monthly_budget: payload.monthlyBudget,
        }, { onConflict: 'user_id, month' });
        success = !error;
      }

      if (success && operation.id) {
        await removeFromSyncQueue(operation.id);
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
      .eq('id', entryId);
    
    if (error) return false;
  }

  // Handle expenses sync
  if (entryId) {
    await supabase.from('expenses').delete().eq('entry_id', entryId);
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
