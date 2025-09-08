export async function clearMessages() {
  const db = await getDB();
  await db.clear(STORE_NAME);
}
import { openDB } from 'idb';
import type { Message } from '../components/Messaging/Chat';

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

export async function saveMessages(messages: Message[]) {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  for (const msg of messages) {
    await tx.store.put(msg);
  }
  await tx.done;
}

export async function getMessagesBetween(userA: string, userB: string) {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME);
  return all.filter(
    (msg: Message) =>
      (msg.fromUserId === userA && msg.toUserId === userB) ||
      (msg.fromUserId === userB && msg.toUserId === userA)
  );
}