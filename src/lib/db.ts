import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { DayEntry, MonthConfig } from '@/data/mockData';
import { DATABASE } from '@/config/constants';

interface JournalDB extends DBSchema {
  entries: {
    key: string; // date string
    value: DayEntry;
  };
  configs: {
    key: string; // month string
    value: MonthConfig;
  };
  syncQueue: {
    key: number;
    value: SyncOperation;
    indexes: { 'by-date': number };
  };
}

export type SyncOperation = {
  id?: number;
  type: 'ADD_ENTRY' | 'UPDATE_ENTRY' | 'DELETE_ENTRY' | 'UPDATE_CONFIG';
  payload: any;
  timestamp: number;
};

let dbPromise: Promise<IDBPDatabase<JournalDB>>;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<JournalDB>(DATABASE.IDB_NAME, DATABASE.IDB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('entries')) {
          db.createObjectStore('entries', { keyPath: 'date' });
        }
        if (!db.objectStoreNames.contains('configs')) {
          db.createObjectStore('configs', { keyPath: 'month' });
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          const queueStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          queueStore.createIndex('by-date', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
};

// Entries
export const getOfflineEntries = async () => {
  const db = await getDB();
  return db.getAll('entries');
};

export const saveOfflineEntry = async (entry: DayEntry) => {
  const db = await getDB();
  await db.put('entries', entry);
};

export const deleteOfflineEntry = async (date: string) => {
  const db = await getDB();
  await db.delete('entries', date);
};

export const clearOfflineEntries = async () => {
  const db = await getDB();
  await db.clear('entries');
};

export const saveBulkOfflineEntries = async (entries: DayEntry[]) => {
  const db = await getDB();
  const tx = db.transaction('entries', 'readwrite');
  await Promise.all([
    ...entries.map(entry => tx.store.put(entry)),
    tx.done
  ]);
};

// Configs
export const getOfflineConfig = async (month: string) => {
  const db = await getDB();
  return db.get('configs', month);
};

export const saveOfflineConfig = async (config: MonthConfig) => {
  const db = await getDB();
  await db.put('configs', config);
};

// Sync Queue
export const getSyncQueue = async () => {
  const db = await getDB();
  return db.getAll('syncQueue');
};

export const addToSyncQueue = async (operation: Omit<SyncOperation, 'id'>) => {
  const db = await getDB();
  await db.add('syncQueue', operation as SyncOperation);
};

export const removeFromSyncQueue = async (id: number) => {
  const db = await getDB();
  await db.delete('syncQueue', id);
};

export const clearSyncQueue = async () => {
  const db = await getDB();
  await db.clear('syncQueue');
};
