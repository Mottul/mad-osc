import { openDB, type DBSchema } from 'idb';
import type { Layout } from '../types';

interface MadOscDB extends DBSchema {
  layouts: {
    key: string;
    value: Layout;
  };
}

const dbPromise = openDB<MadOscDB>('mad-osc', 1, {
  upgrade(db) {
    db.createObjectStore('layouts', { keyPath: 'id' });
  },
});

export async function saveLayout(layout: Layout): Promise<void> {
  const db = await dbPromise;
  await db.put('layouts', layout);
}

export async function loadLayouts(): Promise<Layout[]> {
  const db = await dbPromise;
  return db.getAll('layouts');
}

export async function deleteLayout(id: string): Promise<void> {
  const db = await dbPromise;
  await db.delete('layouts', id);
}
