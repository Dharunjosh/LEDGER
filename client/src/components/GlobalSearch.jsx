import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { COLLECTIONS } from '../utils/itemStore';

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [todos, setTodos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [archive, setArchive] = useState([]);
  const [trash, setTrash] = useState([]);
  const navigate = useNavigate();

  // Load everything once the search palette is opened for the first time,
  // rather than on every keystroke or on every page load.
  useEffect(() => {
    if (!open) return;
    Promise.all([
      api.get('/todos'),
      api.get('/notes'),
      api.get('/reminders'),
      api.get('/archive'),
      api.get('/trash'),
    ])
      .then(([todosRes, notesRes, remindersRes, archiveRes, trashRes]) => {
        setTodos(todosRes);
        setNotes(notesRes);
        setReminders(remindersRes);
        setArchive(archiveRes);
        setTrash(trashRes);
      })
      .catch(() => {}); // search is non-critical; fail quietly
  }, [open]);

  useEffect(() => {
    const handleKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen(true); }
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    const all = [
      ...todos.map((item) => ({ type: 'todo', item, text: `${item.title} ${item.category || ''}` })),
      ...notes.map((item) => ({ type: 'note', item, text: `${item.title} ${item.content || ''}` })),
      ...reminders.map((item) => ({ type: 'reminder', item, text: item.title })),
      ...archive.map((entry) => ({ type: 'archive', item: entry.payload, text: `${entry.payload.title} ${entry.payload.content || ''}` })),
      ...trash.map((entry) => ({ type: 'trash', item: entry.payload, text: `${entry.payload.title} ${entry.payload.content || ''}` })),
    ];
    return all.filter((entry) => entry.text.toLowerCase().includes(needle)).slice(0, 12);
  }, [query, todos, notes, reminders, archive, trash]);

  const go = (type) => { setOpen(false); setQuery(''); navigate(type === 'archive' ? '/archive' : type === 'trash' ? '/trash' : COLLECTIONS[type].path); };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="hidden w-full items-center gap-2 rounded-lg border border-rule bg-paper px-3 py-2 text-left text-xs text-ink-soft hover:bg-paper-card dark:border-rule-dark dark:bg-paper-dark dark:text-ink-soft-dark sm:flex" aria-label="Search everything">
        <Search size={15} /> <span className="flex-1">Search everything…</span><kbd className="font-mono text-[10px]">Ctrl K</kbd>
      </button>
      {open && <div className="fixed inset-0 z-[60] flex items-start justify-center bg-ink/35 px-4 pt-20" onMouseDown={() => setOpen(false)}>
        <section className="w-full max-w-xl overflow-hidden rounded-card border border-rule bg-paper-card shadow-card dark:border-rule-dark dark:bg-paper-card-dark" onMouseDown={(event) => event.stopPropagation()} aria-label="Global search">
          <div className="flex items-center gap-2 border-b border-rule p-3 dark:border-rule-dark"><Search size={18} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks, notes and reminders…" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /><button onClick={() => setOpen(false)} aria-label="Close search"><X size={18} /></button></div>
          <div className="max-h-80 overflow-auto p-2">{query && results.length === 0 && <p className="p-4 text-center text-sm text-ink-soft dark:text-ink-soft-dark">No items match your search.</p>}{results.map(({ type, item }) => <button key={`${type}-${item.id}`} onClick={() => go(type)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-paper dark:hover:bg-paper-dark"><span className="truncate text-sm">{item.title}</span><span className="ml-3 shrink-0 rounded-full bg-paper px-2 py-0.5 text-[10px] uppercase text-ink-soft dark:bg-paper-dark dark:text-ink-soft-dark">{type === 'archive' ? 'Archive' : type === 'trash' ? 'Recycle bin' : COLLECTIONS[type].label}</span></button>)}</div>
        </section>
      </div>}
    </>
  );
}
