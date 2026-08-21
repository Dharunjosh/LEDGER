import { useEffect, useState } from 'react';
import { Plus, Save, X } from 'lucide-react';
import Button from '../Button/Button';
import { todayISO } from '../../utils/dateUtils';

function emptyDraft() {
  return { title: '', date: todayISO(), time: '09:00' };
}

export default function ReminderForm({ initialReminder, onSubmit, onCancel }) {
  const [draft, setDraft] = useState(initialReminder ? { ...initialReminder } : emptyDraft());

  useEffect(() => {
    setDraft(initialReminder ? { ...initialReminder } : emptyDraft());
  }, [initialReminder]);

  function handleSubmit(event) {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title || !draft.date) return;
    onSubmit({ ...draft, title });
    if (!initialReminder) setDraft(emptyDraft());
  }

  const isEditing = Boolean(initialReminder);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3.5 rounded-2xl border border-rule bg-paper-card p-4 sm:p-5 shadow-card dark:border-rule-dark dark:bg-paper-card-dark transition-all"
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-ink-soft-dark">
          Reminder Title
        </span>
        <input
          autoFocus
          type="text"
          value={draft.title}
          onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
          placeholder="What do you need to be reminded of?"
          className="rounded-xl border border-rule bg-transparent px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-tab-reminder dark:border-rule-dark dark:text-ink-dark transition-colors"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-ink-soft-dark">
            Date
          </span>
          <input
            type="date"
            value={draft.date}
            onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))}
            className="rounded-xl border border-rule bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-tab-reminder dark:border-rule-dark dark:text-ink-dark dark:[color-scheme:dark]"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-ink-soft-dark">
            Time
          </span>
          <input
            type="time"
            value={draft.time}
            onChange={(event) => setDraft((current) => ({ ...current, time: event.target.value }))}
            className="rounded-xl border border-rule bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-tab-reminder dark:border-rule-dark dark:text-ink-dark dark:[color-scheme:dark]"
          />
        </label>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        {isEditing && (
          <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
            <X size={15} /> Cancel
          </Button>
        )}
        <Button type="submit" size="sm">
          {isEditing ? <Save size={15} /> : <Plus size={15} />}
          {isEditing ? 'Save changes' : 'Add reminder'}
        </Button>
      </div>
    </form>
  );
}
