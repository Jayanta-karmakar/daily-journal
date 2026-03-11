import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DayEntry, MonthConfig, Expense, initialEntries, initialMonthConfig } from '@/data/mockData';

interface AppContextType {
  entries: DayEntry[];
  config: MonthConfig;
  setConfig: (config: MonthConfig) => void;
  addEntry: (entry: DayEntry) => void;
  updateEntry: (entry: DayEntry) => void;
  getEntryByDate: (date: string) => DayEntry | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [entries, setEntries] = useState<DayEntry[]>(initialEntries);
  const [config, setConfig] = useState<MonthConfig>(initialMonthConfig);

  const addEntry = (entry: DayEntry) => {
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.date !== entry.date);
      return [...filtered, entry].sort((a, b) => b.date.localeCompare(a.date));
    });
  };

  const updateEntry = (entry: DayEntry) => {
    setEntries((prev) =>
      prev.map((e) => (e.date === entry.date ? entry : e)).sort((a, b) => b.date.localeCompare(a.date))
    );
  };

  const getEntryByDate = (date: string) => entries.find((e) => e.date === date);

  return (
    <AppContext.Provider value={{ entries, config, setConfig, addEntry, updateEntry, getEntryByDate }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
