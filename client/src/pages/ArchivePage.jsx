import { useEffect, useState } from 'react';
import { ArchiveRestore, LockKeyhole, Trash2, ChevronDown, ChevronUp, CheckSquare, NotebookPen, AlarmClock, Calendar, Tag, ShieldCheck } from 'lucide-react';
import useLocalStorage from '../utils/useLocalStorage';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';

const TYPE_ICONS = {
  todo: CheckSquare,
  note: NotebookPen,
  reminder: AlarmClock,
};

const TYPE_LABELS = {
  todo: 'Task',
  note: 'Note',
  reminder: 'Reminder',
};

const TYPE_BADGE_STYLES = {
  todo: 'bg-tab-todo/15 text-tab-todo',
  note: 'bg-tab-notes/15 text-[#8A6212] dark:text-tab-notes',
  reminder: 'bg-tab-reminder/15 text-tab-reminder',
};

export default function ArchivePage() {
  const [archiveItems, setArchiveItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pin] = useLocalStorage('ledger:private-pin', () => {
    try {
      const legacy = localStorage.getItem('teamflow:private-pin');
      return legacy ? JSON.parse(legacy) : '';
    } catch {
      return '';
    }
  });
  const [unlocked, setUnlocked] = useState(false);
  const [expandedIds, setExpandedIds] = useState({});
  const { showToast } = useToast();

  useEffect(() => {
    api
      .get('/archive')
      .then(setArchiveItems)
      .catch((error) => showToast(error.message, 'error'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleExpand = (id) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  async function restore(entry, e) {
    e?.stopPropagation();
    try {
      await api.post(`/archive/${entry.id}/restore`);
      setArchiveItems((items) => items.filter((item) => item.id !== entry.id));
      showToast('Item restored to workspace');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async function discard(entry, e) {
    e?.stopPropagation();
    try {
      await api.post(`/archive/${entry.id}/trash`);
      setArchiveItems((items) => items.filter((item) => item.id !== entry.id));
      showToast('Archived item moved to recycle bin', 'info');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  if (pin && !unlocked) {
    return (
      <div className="max-w-md mx-auto py-8">
        <div className="rounded-2xl border border-rule bg-paper-card p-6 shadow-card dark:border-rule-dark dark:bg-paper-card-dark text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-500">
            <LockKeyhole size={24} />
          </div>
          <h1 className="text-xl font-bold text-ink dark:text-ink-dark">Private Archive Locked</h1>
          <p className="mt-1 text-xs text-ink-soft dark:text-ink-soft-dark">
            Enter your Security PIN to unlock and view archived notes, tasks, and reminders.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (e.currentTarget.pin.value === pin.toString().trim()) {
                setUnlocked(true);
                showToast('Archive unlocked');
              } else {
                showToast('Incorrect PIN', 'error');
              }
            }}
            className="mt-5 flex items-center gap-2"
          >
            <input
              name="pin"
              type="password"
              autoFocus
              required
              className="h-10 flex-1 rounded-xl border border-rule bg-paper px-3.5 text-sm text-ink outline-none focus:border-tab-reminder dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark"
              placeholder="Enter PIN..."
            />
            <button className="h-10 rounded-xl bg-ink px-5 text-xs font-bold text-white shadow-xs hover:bg-ink/90 active:scale-95 transition-all dark:bg-tab-reminder dark:text-paper-dark shrink-0">
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl text-ink dark:text-ink-dark">
            {pin ? 'Private Archive' : 'Archive'}
          </h1>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-soft-dark">
            Click any item header to expand its complete details and content.
          </p>
        </div>
        {pin && unlocked && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success self-start sm:self-auto">
            <ShieldCheck size={14} /> PIN Unlocked
          </span>
        )}
      </div>

      {loading ? (
        <p className="rounded-2xl border border-dashed border-rule p-8 text-center text-sm text-ink-soft dark:border-rule-dark dark:text-ink-soft-dark">
          Loading archive...
        </p>
      ) : archiveItems.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-rule p-8 text-center text-sm text-ink-soft dark:border-rule-dark dark:text-ink-soft-dark">
          Your archive is empty.
        </p>
      ) : (
        <div className="space-y-3">
          {archiveItems.map((entry) => {
            const Icon = TYPE_ICONS[entry.type] || NotebookPen;
            const isExpanded = Boolean(expandedIds[entry.id]);
            const payload = entry.payload || {};

            return (
              <article
                key={entry.id}
                onClick={() => toggleExpand(entry.id)}
                className="cursor-pointer overflow-hidden rounded-2xl border border-rule bg-paper-card shadow-xs transition-all hover:border-ink-soft/40 hover:shadow-md dark:border-rule-dark dark:bg-paper-card-dark"
              >
                {/* Header Summary Row */}
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${TYPE_BADGE_STYLES[entry.type] || 'bg-paper text-ink-soft'}`}>
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold text-ink dark:text-ink-dark">
                          {payload.title || 'Untitled'}
                        </p>
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${TYPE_BADGE_STYLES[entry.type]}`}>
                          {TYPE_LABELS[entry.type]}
                        </span>
                      </div>
                      <p className="text-xs text-ink-soft dark:text-ink-soft-dark mt-0.5">
                        Archived {new Date(entry.archivedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => restore(entry, e)}
                      className="inline-flex items-center gap-1 rounded-xl border border-tab-reminder/40 bg-tab-reminder/10 px-2.5 py-1.5 text-xs font-bold text-tab-reminder hover:bg-tab-reminder hover:text-white transition-colors"
                      title="Restore to workspace"
                    >
                      <ArchiveRestore size={14} />
                      <span className="hidden sm:inline">Restore</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => discard(entry, e)}
                      className="inline-flex items-center gap-1 rounded-xl border border-danger/30 bg-danger/10 px-2.5 py-1.5 text-xs font-bold text-danger hover:bg-danger hover:text-white transition-colors"
                      title="Move to recycle bin"
                    >
                      <Trash2 size={14} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                    <div className="p-1 text-ink-soft dark:text-ink-soft-dark">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Detailed Content */}
                {isExpanded && (
                  <div className="border-t border-rule/70 bg-paper/50 p-4 dark:border-rule-dark/70 dark:bg-paper-dark/50 animate-in fade-in duration-150">
                    {entry.type === 'note' && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft dark:text-ink-soft-dark">
                          Note Content:
                        </span>
                        <p className="whitespace-pre-wrap text-sm text-ink/90 dark:text-ink-dark/90 leading-relaxed font-sans">
                          {payload.content || '(No additional text content recorded)'}
                        </p>
                        {payload.color && (
                          <div className="flex items-center gap-2 pt-2">
                            <span className="text-[11px] text-ink-soft">Color:</span>
                            <span className="text-xs font-semibold capitalize text-ink dark:text-ink-dark">{payload.color}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {entry.type === 'todo' && (
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-paper px-2 py-1 text-xs font-semibold text-ink-soft dark:bg-paper-dark dark:text-ink-soft-dark border border-rule/50">
                            <Tag size={12} /> Category: {payload.category || 'General'}
                          </span>
                          <span className="rounded-lg bg-tab-todo/15 px-2 py-1 text-xs font-semibold text-tab-todo">
                            Priority: {payload.priority || 'Medium'}
                          </span>
                          {payload.dueDate && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-paper px-2 py-1 text-xs font-mono text-ink-soft dark:bg-paper-dark dark:text-ink-soft-dark border border-rule/50">
                              <Calendar size={12} /> Due: {payload.dueDate}
                            </span>
                          )}
                          <span className="rounded-lg bg-paper px-2 py-1 text-xs text-ink-soft dark:bg-paper-dark dark:text-ink-soft-dark">
                            Status: {payload.completed ? 'Completed ✅' : 'Pending ⏳'}
                          </span>
                        </div>
                      </div>
                    )}

                    {entry.type === 'reminder' && (
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-paper px-2.5 py-1 text-xs font-mono font-semibold text-ink dark:bg-paper-dark dark:text-ink-dark border border-rule/50">
                            <Calendar size={13} /> Date: {payload.date} at {payload.time || '09:00'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
