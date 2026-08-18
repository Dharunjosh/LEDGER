import { useEffect, useState } from 'react';
import { Plus, Save, X } from 'lucide-react';
import Button from '../Button/Button';

const PRIORITIES = ['Low', 'Medium', 'High'];
const DEFAULT_CATEGORIES = ['General', 'Work', 'Personal', 'Errands'];

const emptyDraft = { title: '', category: 'General', priority: 'Medium', dueDate: '' };

/**
 * TodoForm
 * Handles both "add a new task" and "edit an existing task" — controlled
 * by whether an `initialTask` is passed in.
 */
export default function TodoForm({ initialTask, categories = DEFAULT_CATEGORIES, onSubmit, onCancel }) {
  const [draft, setDraft] = useState(initialTask ? { ...initialTask } : emptyDraft);

  useEffect(() => {
    setDraft(initialTask ? { ...initialTask } : emptyDraft);
  }, [initialTask]);

  function handleChange(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title) return;
    onSubmit({ ...draft, title });
    if (!initialTask) setDraft(emptyDraft);
  }

  const isEditing = Boolean(initialTask);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-card border border-rule bg-paper-card p-4 shadow-card dark:border-rule-dark dark:bg-paper-card-dark"
    >
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-soft dark:text-ink-soft-dark">
          Task
        </span>
        <input
          autoFocus
          type="text"
          value={draft.title}
          onChange={(event) => handleChange('title', event.target.value)}
          placeholder="What needs doing?"
          className="rounded-lg border border-rule bg-transparent px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/70 dark:border-rule-dark dark:text-ink-dark"
        />
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-soft dark:text-ink-soft-dark">
            Category
          </span>
          <select
            value={draft.category}
            onChange={(event) => handleChange('category', event.target.value)}
            className="rounded-lg border border-rule bg-transparent px-3 py-2 text-sm text-ink outline-none dark:border-rule-dark dark:text-ink-dark dark:[color-scheme:dark]"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-soft dark:text-ink-soft-dark">
            Priority
          </span>
          <select
            value={draft.priority}
            onChange={(event) => handleChange('priority', event.target.value)}
            className="rounded-lg border border-rule bg-transparent px-3 py-2 text-sm text-ink outline-none dark:border-rule-dark dark:text-ink-dark dark:[color-scheme:dark]"
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-soft dark:text-ink-soft-dark">
            Due date
          </span>
          <input
            type="date"
            value={draft.dueDate}
            onChange={(event) => handleChange('dueDate', event.target.value)}
            className="rounded-lg border border-rule bg-transparent px-3 py-2 text-sm text-ink outline-none dark:border-rule-dark dark:text-ink-dark dark:[color-scheme:dark]"
          />
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        {isEditing && (
          <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
            <X size={15} /> Cancel
          </Button>
        )}
        <Button type="submit" size="sm">
          {isEditing ? <Save size={15} /> : <Plus size={15} />}
          {isEditing ? 'Save changes' : 'Add task'}
        </Button>
      </div>
    </form>
  );
}

export { DEFAULT_CATEGORIES };
