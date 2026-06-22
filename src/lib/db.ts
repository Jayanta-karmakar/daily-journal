import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { DayEntry, MonthConfig } from '@/data/mockData';

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
  payload: unknown;
  timestamp: number;
};

const DB_VERSION = 1;

// IMPORTANT: Each signed-in user gets their own physically separate
// IndexedDB database, keyed by their Supabase user id. This is the
// load-bearing fix for the cross-account data leak: a single shared
// "MyDiaryDB" meant that on a shared device, logging in as a different
// user could read (or even sync-queue-write) the previous user's
// offline-cached entries, configs, and pending sync operations.
// With one DB per user, there is no shared storage to leak from.
const dbPromises = new Map<string, Promise<IDBPDatabase<JournalDB>>>();

const dbNameFor = (userId: string) => `MyDiaryDB_${userId}`;

const getDB = (userId: string) => {
  if (!userId) {
    throw new Error('getDB() requires a userId — offline storage is namespaced per user.');
  }
  let promise = dbPromises.get(userId);
  if (!promise) {
    promise = openDB<JournalDB>(dbNameFor(userId), DB_VERSION, {
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
    dbPromises.set(userId, promise);
  }
  return promise;
};

// Entries
export const getOfflineEntries = async (userId: string) => {
  const db = await getDB(userId);
  return db.getAll('entries');
};

export const saveOfflineEntry = async (userId: string, entry: DayEntry) => {
  const db = await getDB(userId);
  await db.put('entries', entry);
};

export const deleteOfflineEntry = async (userId: string, date: string) => {
  const db = await getDB(userId);
  await db.delete('entries', date);
};

export const clearOfflineEntries = async (userId: string) => {
  const db = await getDB(userId);
  await db.clear('entries');
};

export const saveBulkOfflineEntries = async (userId: string, entries: DayEntry[]) => {
  const db = await getDB(userId);
  const tx = db.transaction('entries', 'readwrite');
  await Promise.all([
    ...entries.map(entry => tx.store.put(entry)),
    tx.done
  ]);
};

// Configs
export const getOfflineConfig = async (userId: string, month: string) => {
  const db = await getDB(userId);
  return db.get('configs', month);
};

export const saveOfflineConfig = async (userId: string, config: MonthConfig) => {
  const db = await getDB(userId);
  await db.put('configs', config);
};

export const clearOfflineConfigs = async (userId: string) => {
  const db = await getDB(userId);
  await db.clear('configs');
};

// Sync Queue
export const getSyncQueue = async (userId: string) => {
  const db = await getDB(userId);
  return db.getAll('syncQueue');
};

export const addToSyncQueue = async (userId: string, operation: Omit<SyncOperation, 'id'>) => {
  const db = await getDB(userId);
  await db.add('syncQueue', operation as SyncOperation);
};

export const removeFromSyncQueue = async (userId: string, id: number) => {
  const db = await getDB(userId);
  await db.delete('syncQueue', id);
};

export const clearSyncQueue = async (userId: string) => {
  const db = await getDB(userId);
  await db.clear('syncQueue');
};

// Wipes every offline store for a single user (entries + configs +
// pending sync queue). Used on logout so a shared/public device doesn't
// retain plaintext journal data after the user signs out.
export const clearAllOfflineData = async (userId: string) => {
  const db = await getDB(userId);
  await Promise.all([
    db.clear('entries'),
    db.clear('configs'),
    db.clear('syncQueue'),
  ]);
  // Drop the cached connection too so a future re-login for this same
  // user re-opens cleanly rather than reusing a stale handle.
  dbPromises.delete(userId);
};
