import { useEffect, useState } from 'react';
import { ArchiveRestore, LockKeyhole, Trash2 } from 'lucide-react';
import useLocalStorage from '../utils/useLocalStorage';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';

const LABELS = { todo: 'Task', note: 'Note', reminder: 'Reminder' };

export default function ArchivePage() {
  const [archiveItems, setArchiveItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pin] = useLocalStorage('ledger:private-pin', '');
  const [unlocked, setUnlocked] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    api
      .get('/archive')
      .then(setArchiveItems)
      .catch((error) => showToast(error.message, 'error'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function restore(entry) {
    try {
      await api.post(`/archive/${entry.id}/restore`);
      setArchiveItems((items) => items.filter((item) => item.id !== entry.id));
      showToast('Item restored');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async function discard(entry) {
    try {
      await api.post(`/archive/${entry.id}/trash`);
      setArchiveItems((items) => items.filter((item) => item.id !== entry.id));
      showToast('Archived item moved to trash', 'info');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  if (pin && !unlocked) {
    return (
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold">Private archive</h1>
        <p className="mt-1 text-sm text-ink-soft dark:text-ink-soft-dark">Enter your local PIN to view archived items.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (e.currentTarget.pin.value === pin) setUnlocked(true);
            else showToast('That PIN does not match', 'error');
          }}
          className="mt-5 flex gap-2"
        >
          <input name="pin" type="password" required className="flex-1 rounded-lg border border-rule bg-paper-card px-3 py-2 text-sm dark:border-rule-dark dark:bg-paper-card-dark" placeholder="PIN" />
          <button className="rounded-lg bg-ink px-3 text-sm text-white dark:bg-tab-reminder">Unlock</button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{pin ? 'Private archive' : 'Archive'}</h1>
        <p className="mt-1 text-sm text-ink-soft dark:text-ink-soft-dark">Keep finished items out of sight without deleting them.</p>
      </div>

      {loading ? (
        <p className="rounded-card border border-dashed border-rule p-8 text-center text-sm text-ink-soft dark:border-rule-dark dark:text-ink-soft-dark">Loading...</p>
      ) : archiveItems.length === 0 ? (
        <p className="rounded-card border border-dashed border-rule p-8 text-center text-sm text-ink-soft dark:border-rule-dark dark:text-ink-soft-dark">Your archive is empty.</p>
      ) : (
        <div className="space-y-3">
          {archiveItems.map((entry) => (
            <article key={entry.id} className="flex items-center gap-3 rounded-card border border-rule bg-paper-card p-4 shadow-card dark:border-rule-dark dark:bg-paper-card-dark">
              <LockKeyhole size={17} className="text-ink-soft" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{entry.payload.title}</p>
                <p className="text-xs text-ink-soft dark:text-ink-soft-dark">
                  {LABELS[entry.type]} · archived {new Date(entry.archivedAt).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => restore(entry)} className="rounded-lg p-2 text-tab-reminder hover:bg-paper dark:hover:bg-paper-dark" aria-label="Restore">
                <ArchiveRestore size={17} />
              </button>
              <button onClick={() => discard(entry)} className="rounded-lg p-2 text-danger hover:bg-danger/10" aria-label="Move to trash">
                <Trash2 size={17} />
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
