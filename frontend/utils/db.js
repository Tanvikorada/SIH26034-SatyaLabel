import { openDB } from 'idb';

const DB_NAME = 'SatyaLabelDB';
const STORE_NAME = 'outbox';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
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
