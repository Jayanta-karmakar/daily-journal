import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { DayEntry, MonthConfig, Expense, initialMonthConfig } from '@/data/mockData';
import { toast } from 'sonner';

interface AppContextType {
  entries: DayEntry[];
  config: MonthConfig;
  setConfig: (config: MonthConfig) => void;
  addEntry: (entry: DayEntry) => void;
  updateEntry: (entry: DayEntry) => void;
  getEntryByDate: (date: string) => DayEntry | undefined;
  session: any;
  loading: boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [config, setConfigState] = useState<MonthConfig>(initialMonthConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchConfig();
      fetchEntries();
    } else {
      setEntries([]);
      setLoading(false);
    }
  }, [session]);

  const fetchConfig = async () => {
    if (!session?.user?.id) return;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data, error } = await supabase
      .from('month_configs')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('month', currentMonth)
      .single();

    if (data && !error) {
      setConfigState({
        month: data.month,
        salary: data.salary,
        dailySpendLimit: data.daily_spend_limit,
        monthlyBudget: data.monthly_budget,
      });
    }
  };

  const fetchEntries = async () => {
    if (!session?.user?.id) return;
    const { data, error } = await supabase
      .from('entries')
      .select('*, expenses(*)')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false });

    if (error) {
      toast.error('Failed to load entries');
      setLoading(false);
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
    }
    setLoading(false);
  };

  const setConfig = async (newConfig: MonthConfig) => {
    if (!session?.user?.id) return;
    setConfigState(newConfig);
    const { error } = await supabase
      .from('month_configs')
      .upsert({
        user_id: session.user.id,
        month: newConfig.month,
        salary: newConfig.salary,
        daily_spend_limit: newConfig.dailySpendLimit,
        monthly_budget: newConfig.monthlyBudget,
      }, { onConflict: 'user_id, month' });

    if (error) {
      toast.error('Failed to save config');
    }
  };

  const addEntry = async (entry: DayEntry) => {
    if (!session?.user?.id) return;
    
    // Check if entry already exists on this date
    // (In EditEntry it calls updateEntry, but NewEntry checks addEntry... wait we can just handle it. Supabase might complain about unique constraint if not upserted. Let's do an upsert or check)
    const { data: existingData } = await supabase.from('entries').select('id').eq('date', entry.date).eq('user_id', session.user.id).single();
    
    if (existingData) {
        toast.error('An entry for this date already exists. Please edit it instead.');
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
      toast.error('Failed to save entry');
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

    fetchEntries();
  };

  const updateEntry = async (entry: DayEntry) => {
    if (!session?.user?.id) return;

    const { data: existingData } = await supabase.from('entries').select('id').eq('date', entry.date).eq('user_id', session.user.id).single();
    if (!existingData) return;

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
      toast.error('Failed to update entry');
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

    fetchEntries();
  };

  const getEntryByDate = (date: string) => entries.find((e) => e.date === date);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AppContext.Provider value={{ entries, config, setConfig, addEntry, updateEntry, getEntryByDate, session, loading, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
