import { useEffect, useState } from 'react';
import { Plus, Save, X, PlusCircle, Tag, ChevronDown, CheckSquare, Trash2, ListPlus } from 'lucide-react';
import Button from '../Button/Button';

const PRIORITIES = ['Low', 'Medium', 'High'];
const DEFAULT_CATEGORIES = ['General', 'Work', 'Personal'];

const emptyDraft = { title: '', category: 'General', priority: 'Medium', dueDate: '', subtasks: [] };

export default function TodoForm({ initialTask, categories = DEFAULT_CATEGORIES, onSubmit, onCancel }) {
  const [draft, setDraft] = useState(initialTask ? { ...emptyDraft, ...initialTask, subtasks: initialTask.subtasks || [] } : emptyDraft);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [newSubtaskText, setNewSubtaskText] = useState('');

  useEffect(() => {
    if (initialTask) {
      setDraft({ ...emptyDraft, ...initialTask, subtasks: initialTask.subtasks || [] });
      const isKnown = categories.includes(initialTask.category);
      if (!isKnown && initialTask.category) {
        setIsCustomCategory(true);
        setCustomCategoryInput(initialTask.category);
      } else {
        setIsCustomCategory(false);
        setCustomCategoryInput('');
      }
    } else {
      setDraft(emptyDraft);
      setIsCustomCategory(false);
      setCustomCategoryInput('');
    }
  }, [initialTask, categories]);

  function handleChange(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function handleCategorySelect(e) {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomCategory(true);
      setDraft((current) => ({ ...current, category: customCategoryInput.trim() || 'Custom' }));
    } else {
      setIsCustomCategory(false);
      handleChange('category', val);
    }
  }

  function handleCustomCategoryChange(e) {
    const val = e.target.value;
    setCustomCategoryInput(val);
    handleChange('category', val.trim() || 'General');
  }

  function handleAddSubtask(e) {
    e?.preventDefault();
    const text = newSubtaskText.trim();
    if (!text) return;
    const newSubtask = {
      id: Date.now().toString(),
      text,
      completed: false,
    };
    setDraft((curr) => ({
      ...curr,
      subtasks: [...(curr.subtasks || []), newSubtask],
    }));
    setNewSubtaskText('');
  }

  function handleRemoveSubtask(subtaskId) {
    setDraft((curr) => ({
      ...curr,
      subtasks: (curr.subtasks || []).filter((s) => s.id !== subtaskId),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title) return;
    const category = (isCustomCategory ? customCategoryInput.trim() : draft.category) || 'General';
    onSubmit({ ...draft, title, category });
    if (!initialTask) {
      setDraft(emptyDraft);
      setIsCustomCategory(false);
      setCustomCategoryInput('');
      setNewSubtaskText('');
    }
  }

  const isEditing = Boolean(initialTask);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3.5 rounded-2xl border border-rule bg-paper-card p-4 sm:p-5 shadow-card dark:border-rule-dark dark:bg-paper-card-dark transition-all"
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-ink-soft-dark">
          Task Description
        </span>
        <input
          autoFocus
          type="text"
          value={draft.title}
          onChange={(event) => handleChange('title', event.target.value)}
          placeholder="What needs doing today?"
          className="rounded-xl border border-rule bg-transparent px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-tab-todo dark:border-rule-dark dark:text-ink-dark transition-colors"
        />
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-ink-soft-dark">
              Category
            </span>
            <button
              type="button"
              onClick={() => {
                if (!isCustomCategory) {
                  setIsCustomCategory(true);
                  setDraft((curr) => ({ ...curr, category: customCategoryInput.trim() || 'Custom' }));
                } else {
                  setIsCustomCategory(false);
                  setDraft((curr) => ({ ...curr, category: categories[0] || 'General' }));
                }
              }}
              className="text-[11px] font-medium text-tab-todo hover:underline inline-flex items-center gap-1"
            >
              {isCustomCategory ? 'Use standard' : '+ Custom'}
            </button>
          </div>

          {!isCustomCategory ? (
            <div className="relative">
              <select
                value={draft.category}
                onChange={handleCategorySelect}
                className="w-full appearance-none rounded-xl border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none hover:border-tab-todo focus:border-tab-todo dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark cursor-pointer transition-colors"
              >
                {categories.map((category) => (
                  <option key={category} value={category} className="bg-paper-card dark:bg-paper-card-dark text-ink dark:text-ink-dark">
                    {category}
                  </option>
                ))}
                <option value="__custom__" className="bg-paper-card dark:bg-paper-card-dark text-tab-todo font-semibold">+ Add Custom Category...</option>
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft dark:text-ink-soft-dark" />
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={customCategoryInput}
                onChange={handleCustomCategoryChange}
                placeholder="e.g. Finance, Meeting, Study"
                className="w-full rounded-xl border border-tab-todo/80 bg-tab-todo/5 px-3 py-2 text-sm text-ink outline-none dark:border-tab-todo dark:bg-tab-todo/10 dark:text-ink-dark placeholder:text-ink-soft/60"
              />
            </div>
          )}
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-ink-soft-dark">
            Priority
          </span>
          <div className="relative">
            <select
              value={draft.priority}
              onChange={(event) => handleChange('priority', event.target.value)}
              className="w-full appearance-none rounded-xl border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none hover:border-tab-todo focus:border-tab-todo dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark cursor-pointer transition-colors"
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority} className="bg-paper-card dark:bg-paper-card-dark text-ink dark:text-ink-dark">
                  {priority === 'High' ? '🔴 High Priority' : priority === 'Medium' ? '🟡 Medium Priority' : '🟢 Low Priority'}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft dark:text-ink-soft-dark" />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-ink-soft-dark">
            Due date
          </span>
          <input
            type="date"
            value={draft.dueDate}
            onChange={(event) => handleChange('dueDate', event.target.value)}
            className="rounded-xl border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-tab-todo dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark dark:[color-scheme:dark]"
          />
        </label>
      </div>

      {/* Subtasks / Checklist Section */}
      <div className="rounded-xl border border-rule/70 bg-paper/50 p-3 dark:border-rule-dark/70 dark:bg-paper-dark/40 space-y-2">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-ink-soft-dark">
            <ListPlus size={14} className="text-tab-todo" /> Checklist / Sub-tasks ({draft.subtasks?.length || 0})
          </span>
        </div>

        {/* Existing Subtasks List */}
        {draft.subtasks && draft.subtasks.length > 0 && (
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {draft.subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-rule/60 bg-paper-card px-2.5 py-1.5 text-xs dark:border-rule-dark/60 dark:bg-paper-card-dark"
              >
                <span className="text-ink dark:text-ink-dark truncate min-w-0">{subtask.text}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSubtask(subtask.id)}
                  className="text-danger hover:text-danger/80 p-0.5"
                  title="Remove subtask"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Subtask Input */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={newSubtaskText}
            onChange={(e) => setNewSubtaskText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSubtask();
              }
            }}
            placeholder="Add a checklist step (press Enter)..."
            className="flex-1 rounded-lg border border-rule bg-paper px-2.5 py-1.5 text-xs text-ink outline-none placeholder:text-ink-soft/60 focus:border-tab-todo dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark"
          />
          <button
            type="button"
            onClick={handleAddSubtask}
            className="inline-flex items-center gap-1 rounded-lg bg-tab-todo/15 px-2.5 py-1.5 text-xs font-semibold text-tab-todo hover:bg-tab-todo hover:text-white transition-colors shrink-0"
          >
            <Plus size={13} /> Add Step
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
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
