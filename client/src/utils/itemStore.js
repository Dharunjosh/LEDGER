export const COLLECTIONS = {
  todo: { key: 'ledger:todos', label: 'Task', path: '/todo' },
  note: { key: 'ledger:notes', label: 'Note', path: '/notes' },
  reminder: { key: 'ledger:reminders', label: 'Reminder', path: '/reminders' },
};

export function makeStoredItem(type, item) {
  return { id: `${type}:${item.id}:${Date.now()}`, type, item, storedAt: new Date().toISOString() };
}

export function readCollection(type) {
  const definition = COLLECTIONS[type];
  if (!definition) return [];
  try { return JSON.parse(window.localStorage.getItem(definition.key) || '[]'); } catch { return []; }
}

export function writeCollection(type, items) {
  window.localStorage.setItem(COLLECTIONS[type].key, JSON.stringify(items));
}
