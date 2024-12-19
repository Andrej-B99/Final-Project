import { openDB } from 'idb';

// Open or create the database
export const db = openDB('TaskPlannerDB', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('tasks')) {
      db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
    }
    if (!db.objectStoreNames.contains('users')) {
      db.createObjectStore('users', { keyPath: 'email' });
    }
  },
});

// Save data to IndexedDB
export async function saveData(storeName, data) {
  const database = await db;
  const tx = database.transaction(storeName, 'readwrite');
  await tx.objectStore(storeName).put(data);
  await tx.done;
}

// Get all data from IndexedDB
export async function getAllData(storeName) {
  const database = await db;
  return database.getAll(storeName);
}

// Delete data from IndexedDB
export async function deleteData(storeName, key) {
  const database = await db;
  const tx = database.transaction(storeName, 'readwrite');
  await tx.objectStore(storeName).delete(key);
  await tx.done;
}
