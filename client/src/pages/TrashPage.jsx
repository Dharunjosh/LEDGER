import { useEffect, useState } from 'react';
import { Archive, RotateCcw, Trash2 } from 'lucide-react';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';

const LABELS = { todo: 'Task', note: 'Note', reminder: 'Reminder' };

export default function TrashPage() {
  const [trash, setTrash] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    api
      .get('/trash')
      .then(setTrash)
      .catch((error) => showToast(error.message, 'error'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function restore(entry) {
    try {
      await api.post(`/trash/${entry.id}/restore`);
      setTrash((items) => items.filter((item) => item.id !== entry.id));
      showToast('Item restored');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async function archive(entry) {
    try {
      await api.post(`/trash/${entry.id}/archive`);
      setTrash((items) => items.filter((item) => item.id !== entry.id));
      showToast('Item moved to archive');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async function permanentlyDelete(entry) {
    if (!window.confirm('Permanently delete this item?')) return;
    try {
      await api.delete(`/trash/${entry.id}`);
      setTrash((items) => items.filter((item) => item.id !== entry.id));
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async function emptyBin() {
    if (!window.confirm('Permanently remove every item in the recycle bin?')) return;
    try {
      await api.delete('/trash');
      setTrash([]);
      showToast('Recycle bin emptied', 'info');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Recycle bin</h1>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-soft-dark">Deleted items stay here until you permanently remove them.</p>
        </div>
        {trash.length > 0 && (
          <button
            type="button"
            onClick={emptyBin}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-danger/40 bg-danger/10 px-3.5 py-2 text-xs font-bold text-danger hover:bg-danger hover:text-white transition-all shadow-xs active:scale-95 self-start sm:self-auto"
          >
            <Trash2 size={14} />
            <span>Empty Recycle Bin</span>
          </button>
        )}
      </div>

      {loading ? (
        <p className="rounded-card border border-dashed border-rule p-8 text-center text-sm text-ink-soft dark:border-rule-dark dark:text-ink-soft-dark">Loading...</p>
      ) : trash.length === 0 ? (
        <p className="rounded-card border border-dashed border-rule p-8 text-center text-sm text-ink-soft dark:border-rule-dark dark:text-ink-soft-dark">The recycle bin is empty.</p>
      ) : (
        <div className="space-y-3">
          {trash.map((entry) => (
            <article key={entry.id} className="flex items-center gap-3 rounded-card border border-rule bg-paper-card p-4 shadow-card dark:border-rule-dark dark:bg-paper-card-dark">
              <Trash2 size={17} className="text-danger" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{entry.payload.title}</p>
                <p className="text-xs text-ink-soft dark:text-ink-soft-dark">
                  {LABELS[entry.type]} · deleted {new Date(entry.deletedAt).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => archive(entry)} className="rounded-lg p-2 text-tab-reminder hover:bg-paper dark:hover:bg-paper-dark" aria-label="Archive">
                <Archive size={17} />
              </button>
              <button onClick={() => restore(entry)} className="rounded-lg p-2 text-tab-reminder hover:bg-paper dark:hover:bg-paper-dark" aria-label="Restore">
                <RotateCcw size={17} />
              </button>
              <button onClick={() => permanentlyDelete(entry)} className="rounded-lg p-2 text-danger hover:bg-danger/10" aria-label="Delete permanently">
                <Trash2 size={17} />
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
