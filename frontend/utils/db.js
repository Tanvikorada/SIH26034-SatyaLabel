import { openDB } from 'idb';

const DB_NAME = 'SatyaLabelDB';
const DB_VERSION = 2;
const STORE_NAME = 'outbox';
const PENDING_STORE = 'pendingScans';

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Create outbox store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
      // Create pendingScans store if it doesn't exist (added in v2)
      if (!db.objectStoreNames.contains(PENDING_STORE)) {
        db.createObjectStore(PENDING_STORE, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const saveToOutbox = async (data) => {
  const db = await initDB();
  return db.add(STORE_NAME, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

export const getOutbox = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const removeFromOutbox = async (id) => {
  const db = await initDB();
  return db.delete(STORE_NAME, id);
};
