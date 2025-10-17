import { openDB } from 'idb';

const DB_NAME = 'zia-messages';
const STORE_NAME = 'messages';

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

export async function clearMessages() {
  const db = await getDB();
  await db.clear(STORE_NAME);
}