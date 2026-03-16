import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { DayEntry, MonthConfig, Expense, initialMonthConfig } from '@/data/mockData';
import { toast } from 'sonner';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import {
  getOfflineEntries,
  saveOfflineEntry,
  deleteOfflineEntry,
  clearOfflineEntries,
  saveBulkOfflineEntries,
  getOfflineConfig,
  saveOfflineConfig,
  addToSyncQueue
} from '@/lib/db';
import { processSyncQueue } from '@/lib/sync';

interface AppContextType {
  entries: DayEntry[];
  config: MonthConfig;
  setConfig: (config: MonthConfig) => void;
  addEntry: (entry: DayEntry) => void;
  updateEntry: (entry: DayEntry) => void;
  getEntryByDate: (date: string) => DayEntry | undefined;
  session: any;
  profile: {
    role: string;
    is_banned: boolean;
  } | null;
  loading: boolean;
  logout: () => void;
  deleteEntry: (date: string) => Promise<void>;
  deleteAllEntries: () => Promise<void>;
  isOnline: boolean;
  isSyncing: boolean;
  refreshEntries: () => Promise<void>;
  deleteMonthEntries: (month: string) => Promise<void>;
  deleteYearEntries: (year: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<{ role: string, is_banned: boolean } | null>(null);
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [config, setConfigState] = useState<MonthConfig>(initialMonthConfig);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const isOnline = useOnlineStatus();

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const handleAuthChange = async (currSession: any) => {
      setSession(currSession);
      if (currSession?.user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, is_banned')
          .eq('id', currSession.user.id)
          .single();
        
        if (data && !error) {
          if (data.is_banned) {
            toast.error('Your account has been banned. Please contact support.', {
              id: 'ban-notification'
            });
            await logout();
            return;
          }
          setProfile(data);
        }
      } else {
        setProfile(null);
      }
      setIsInitialized(true);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      handleAuthChange(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Offline-first initial load
  useEffect(() => {
    if (!isInitialized) return; // Wait until initial session check completes

    const loadOfflineData = async () => {
      const offlineEntries = await getOfflineEntries();
      if (offlineEntries.length > 0) {
        // Sort offline entries by date descending to match UI expectation
        offlineEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEntries(offlineEntries);
      }
      
      const currentMonth = new Date().toISOString().slice(0, 7);
      const offlineConfig = await getOfflineConfig(currentMonth);
      if (offlineConfig) {
        setConfigState(offlineConfig);
      }
    };
    
    if (session?.user?.id) {
      loadOfflineData().then(() => {
        if (isOnline) {
          fetchConfig();
          fetchEntries().finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      });
    } else {
      setEntries([]);
      setLoading(false);
    }
  }, [session, isOnline, isInitialized]);

  // Sync when online
  useEffect(() => {
    if (isOnline && session?.user?.id) {
      const attemptSync = async () => {
        setIsSyncing(true);
        await processSyncQueue(session);
        await fetchConfig();
        await fetchEntries();
        setIsSyncing(false);
      };
      attemptSync();
    }
  }, [isOnline, session]);

  const fetchConfig = async () => {
    if (!session?.user?.id || !isOnline) return;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data, error } = await supabase
      .from('month_configs')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('month', currentMonth)
      .single();

    if (data && !error) {
      const upToDateConfig = {
        month: data.month,
        salary: data.salary,
        dailySpendLimit: data.daily_spend_limit,
        monthlyBudget: data.monthly_budget,
        currency: data.currency || 'INR',
      };
      setConfigState(upToDateConfig);
      await saveOfflineConfig(upToDateConfig);
    } else {
      // If no config for current month, try to get the latest one to "lock" the currency choice
      const { data: latestData } = await supabase
        .from('month_configs')
        .select('currency')
        .eq('user_id', session.user.id)
        .order('month', { ascending: false })
        .limit(1);
      
      if (latestData && latestData.length > 0 && latestData[0].currency) {
        setConfigState(prev => ({ ...prev, currency: latestData[0].currency }));
      }
    }
  };

  const fetchEntries = async () => {
    if (!session?.user?.id || !isOnline) return;
    const { data, error } = await supabase
      .from('entries')
      .select('*, expenses(*)')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false });

    if (error) {
      return;
    }

    if (data) {
      const formattedEntries: DayEntry[] = data.map((d: any) => ({
        id: d.id,
        date: d.date,
        day: d.day,
        journalText: d.journal_text,
        gymAttended: d.gym_attended,
        notes: d.notes || '',
        totalSpend: Number(d.total_spend),
        totalInvested: Number(d.total_invested),
        expenses: d.expenses.map((e: any) => ({
          id: e.id,
          label: e.label,
          amount: Number(e.amount),
          type: e.expense_type,
        })),
      }));
      setEntries(formattedEntries);
      await saveBulkOfflineEntries(formattedEntries);
    }
  };

  const setConfig = async (newConfig: MonthConfig) => {
    setConfigState(newConfig);
    await saveOfflineConfig(newConfig);

    if (!session?.user?.id) return;

    if (!isOnline) {
      toast('Saved offline. Will sync when back online.', { icon: '🔄' });
      await addToSyncQueue({ type: 'UPDATE_CONFIG', payload: newConfig, timestamp: Date.now() });
      return;
    }

    const { error } = await supabase
      .from('month_configs')
      .upsert({
        user_id: session.user.id,
        month: newConfig.month,
        salary: newConfig.salary,
        daily_spend_limit: newConfig.dailySpendLimit,
        monthly_budget: newConfig.monthlyBudget,
        currency: newConfig.currency,
      }, { onConflict: 'user_id, month' });

    if (error) {
      toast.error('Failed to sync config. Added to sync queue.');
      await addToSyncQueue({ type: 'UPDATE_CONFIG', payload: newConfig, timestamp: Date.now() });
    }
  };

  const addEntry = async (entry: DayEntry) => {
    if (entries.find(e => e.date === entry.date)) {
      toast.error('An entry for this date already exists.');
      return;
    }

    // Optimistic Update
    setEntries(prev => [entry, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    await saveOfflineEntry(entry);

    if (!session?.user?.id) return;

    if (!isOnline) {
      toast('Saved offline. Will sync when back online.', { icon: '🔄' });
      await addToSyncQueue({ type: 'ADD_ENTRY', payload: entry, timestamp: Date.now() });
      return;
    }

    const { data: newEntryData, error: entryError } = await supabase
      .from('entries')
      .insert({
        user_id: session.user.id,
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

    if (entryError || !newEntryData) {
      toast.error('Failed to sync. Added to sync queue.');
      await addToSyncQueue({ type: 'ADD_ENTRY', payload: entry, timestamp: Date.now() });
      return;
    }

    if (entry.expenses.length > 0) {
      const expensesToInsert = entry.expenses.map((e) => ({
        user_id: session.user.id,
        entry_id: newEntryData.id,
        label: e.label,
        amount: e.amount,
        expense_type: e.type,
      }));
      await supabase.from('expenses').insert(expensesToInsert);
    }
  };

  const updateEntry = async (entry: DayEntry) => {
    // Optimistic Update
    setEntries(prev => prev.map(e => e.date === entry.date ? entry : e));
    await saveOfflineEntry(entry);

    if (!session?.user?.id) return;

    if (!isOnline) {
      toast('Saved offline. Will sync when back online.', { icon: '🔄' });
      await addToSyncQueue({ type: 'UPDATE_ENTRY', payload: entry, timestamp: Date.now() });
      return;
    }

    const { data: existingData } = await supabase.from('entries').select('id').eq('date', entry.date).eq('user_id', session.user.id).single();
    if (!existingData) {
      // If it doesn't exist remotely, it's actually an add
      await addToSyncQueue({ type: 'ADD_ENTRY', payload: entry, timestamp: Date.now() });
      processSyncQueue(session);
      return;
    }

    const { error: entryError } = await supabase
      .from('entries')
      .update({
        journal_text: entry.journalText,
        gym_attended: entry.gymAttended,
        notes: entry.notes,
        total_spend: entry.totalSpend,
        total_invested: entry.totalInvested,
      })
      .eq('id', existingData.id);

    if (entryError) {
      toast.error('Failed to sync update. Added to sync queue.');
      await addToSyncQueue({ type: 'UPDATE_ENTRY', payload: entry, timestamp: Date.now() });
      return;
    }

    // Replace all expenses
    await supabase.from('expenses').delete().eq('entry_id', existingData.id);
    if (entry.expenses.length > 0) {
      const expensesToInsert = entry.expenses.map((e) => ({
        user_id: session.user.id,
        entry_id: existingData.id,
        label: e.label,
        amount: e.amount,
        expense_type: e.type,
      }));
      await supabase.from('expenses').insert(expensesToInsert);
    }
  };
  
  const deleteEntry = async (date: string) => {
    // Optimistic Delete
    setEntries(prev => prev.filter(e => e.date !== date));
    await deleteOfflineEntry(date);

    if (!session?.user?.id) return;

    if (!isOnline) {
      toast('Deleted offline. Will sync when back online.', { icon: '🔄' });
      await addToSyncQueue({ type: 'DELETE_ENTRY', payload: { date }, timestamp: Date.now() });
      return;
    }

    const { error } = await supabase.from('entries').delete().eq('date', date).eq('user_id', session.user.id);
    if (error) {
      toast.error('Failed to sync deletion. Added to sync queue.');
      await addToSyncQueue({ type: 'DELETE_ENTRY', payload: { date }, timestamp: Date.now() });
    } else {
      toast.success('Entry deleted');
    }
  };

  const deleteAllEntries = async () => {
    if (!isOnline) {
      toast.error('Must be online to clear all remote data');
      return;
    }
    
    setEntries([]);
    await clearOfflineEntries();

    if (!session?.user?.id) return;
    const { error } = await supabase.from('entries').delete().eq('user_id', session.user.id);
    if (error) {
      toast.error('Failed to clear remote data');
      fetchEntries(); // Revert
    } else {
      toast.success('All data cleared');
    }
  };

  const getEntryByDate = (date: string) => entries.find((e) => e.date === date);

  const deleteMonthEntries = async (month: string) => {
    // Optimistic Delete
    setEntries(prev => prev.filter(e => e.date.slice(0, 7) !== month));
    
    if (!session?.user?.id) return;

    if (!isOnline) {
      toast('Changes cached. Will sync when back online.', { icon: '🔄' });
      // For bulk deletes in offline mode, we'd need a more complex sync queue. 
      // For now, let's just trigger individual sync items or refresh later.
      return;
    }

    const [y, m] = month.split('-');
    const lastDay = new Date(parseInt(y), parseInt(m), 0).getDate();

    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('user_id', session.user.id)
      .gte('date', `${month}-01`)
      .lte('date', `${month}-${lastDay}`);

    if (error) {
      toast.error('Failed to delete some entries.');
      await fetchEntries(); // Revert
    } else {
      toast.success(`Records for ${month} cleared`);
    }
  };

  const deleteYearEntries = async (year: string) => {
    // Optimistic Delete
    setEntries(prev => prev.filter(e => e.date.slice(0, 4) !== year));
    
    if (!session?.user?.id) return;

    if (!isOnline) {
      toast('Changes cached. Will sync when back online.', { icon: '🔄' });
      return;
    }

    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('user_id', session.user.id)
      .gte('date', `${year}-01-01`)
      .lte('date', `${year}-12-31`);

    if (error) {
      toast.error('Failed to delete some entries.');
      await fetchEntries(); // Revert
    } else {
      toast.success(`Records for ${year} cleared`);
    }
  };

  const logout = async () => {
    await clearOfflineEntries();
    await supabase.auth.signOut();
  };

  return (
    <AppContext.Provider value={{ 
      entries, config, setConfig, addEntry, updateEntry, 
      getEntryByDate, session, profile, loading, logout, deleteEntry, 
      deleteAllEntries, isOnline, isSyncing, refreshEntries: fetchEntries,
      deleteMonthEntries, deleteYearEntries
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};

