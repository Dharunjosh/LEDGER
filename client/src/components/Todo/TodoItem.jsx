import { useState } from 'react';
import { Archive, Calendar, Pencil, Star, Trash2, Share2, Lock, Unlock } from 'lucide-react';
import Card from '../Card/Card';
import TodoForm from './TodoForm';
import Button from '../Button/Button';
import { shareItem } from '../../utils/shareUtils';
import { useToast } from '../../context/ToastContext';

const PRIORITY_STYLES = {
  High: 'bg-danger/10 text-danger',
  Medium: 'bg-tab-notes/15 text-[#8A6212] dark:text-tab-notes',
  Low: 'bg-tab-reminder/10 text-tab-reminder',
};

export default function TodoItem({ task, categories, onToggle, onDelete, onUpdate, onToggleHighlight, onArchive }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const { showToast } = useToast();

  const isItemLocked = Boolean(task.isLocked && !isUnlocked);

  if (isEditing) {
    return (
      <TodoForm
        initialTask={task}
        categories={categories}
        onCancel={() => setIsEditing(false)}
        onSubmit={(updated) => {
          onUpdate(task.id, updated);
          setIsEditing(false);
        }}
      />
    );
  }

  const dueLabel = task.dueDate
    ? new Date(`${task.dueDate}T00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : null;

  const handleShare = () => {
    if (isItemLocked) {
      showToast('Unlock task to share its content', 'error');
      return;
    }
    shareItem({
      title: `Task: ${task.title}`,
      text: `📋 Task: ${task.title}\nCategory: ${task.category || 'General'}\nPriority: ${task.priority || 'Medium'}${dueLabel ? `\nDue Date: ${dueLabel}` : ''}\nStatus: ${task.completed ? 'Completed ✅' : 'Pending ⏳'}`,
      showToast,
    });
  };

  const getSavedPin = () => {
    const raw = localStorage.getItem('ledger:private-pin') || localStorage.getItem('teamflow:private-pin');
    return raw ? JSON.parse(raw) : '';
  };

  const handleToggleLock = () => {
    const savedPin = getSavedPin();
    if (!task.isLocked && !savedPin) {
      showToast('Please set a Security PIN in Settings first', 'info');
      return;
    }
    const newLockState = !task.isLocked;
    onUpdate(task.id, { isLocked: newLockState });
    setIsUnlocked(false);
    showToast(newLockState ? 'Task locked with PIN' : 'Task unlocked');
  };

  const handleUnlockSubmit = (e) => {
    e.preventDefault();
    const savedPin = getSavedPin();
    if (!savedPin || pinInput.trim() === savedPin.toString().trim()) {
      setIsUnlocked(true);
      setShowPinPrompt(false);
      setPinInput('');
      showToast('Task unlocked');
    } else {
      showToast('Incorrect PIN', 'error');
    }
  };

  return (
    <Card
      tabColor="bg-tab-todo"
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 transition-all ${
        task.completed ? 'opacity-60' : ''
      }`}
    >
      {/* Content Section - 100% full width on mobile */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <button
          type="button"
          role="checkbox"
          aria-checked={task.completed}
          aria-label={task.completed ? 'Mark task as pending' : 'Mark task as completed'}
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
            task.completed
              ? 'border-success bg-success text-white'
              : 'border-rule dark:border-rule-dark'
          }`}
        >
          {task.completed && (
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
              <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          {isItemLocked ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-ink-soft dark:text-ink-soft-dark">
                <Lock size={14} className="text-amber-500 shrink-0" />
                <span className="font-semibold text-xs italic">🔒 Private Task (Locked with PIN)</span>
              </div>
              {showPinPrompt ? (
                <form onSubmit={handleUnlockSubmit} className="flex flex-wrap items-center gap-2 pt-1.5">
                  <input
                    type="password"
                    autoFocus
                    placeholder="Enter PIN"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="h-8 w-28 rounded-xl border border-rule bg-paper px-2.5 text-xs text-ink outline-none focus:border-tab-todo dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark"
                  />
                  <button
                    type="submit"
                    className="h-8 rounded-xl bg-tab-todo px-3 text-xs font-bold text-white shadow-2xs hover:bg-tab-todo/90 active:scale-95 transition-all"
                  >
                    Unlock
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPinPrompt(false)}
                    className="h-8 rounded-xl border border-rule bg-paper px-2.5 text-xs font-medium text-ink-soft hover:text-ink dark:border-rule-dark dark:bg-paper-dark dark:text-ink-soft-dark"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPinPrompt(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-tab-todo/40 bg-tab-todo/10 px-2.5 py-1 text-xs font-semibold text-tab-todo hover:bg-tab-todo hover:text-white transition-all self-start mt-1"
                >
                  <Unlock size={13} /> <span>Enter PIN to unlock</span>
                </button>
              )}
            </div>
          ) : (
            <>
              <p className={`text-sm font-medium text-ink dark:text-ink-dark leading-snug break-words ${task.completed ? 'line-through text-ink-soft' : ''}`}>
                {task.title}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="rounded-md bg-paper px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-ink-soft dark:bg-paper-dark dark:text-ink-soft-dark border border-rule/50 dark:border-rule-dark/50">
                  {task.category || 'General'}
                </span>
                <span className={`rounded-md px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium}`}>
                  {task.priority || 'Medium'}
                </span>
                {dueLabel && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-paper px-2 py-0.5 text-[10px] sm:text-[11px] font-mono text-ink-soft dark:bg-paper-dark dark:text-ink-soft-dark border border-rule/50 dark:border-rule-dark/50">
                    <Calendar size={11} /> {dueLabel}
                  </span>
                )}
                {task.subtasks && task.subtasks.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-tab-todo/15 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-tab-todo">
                    ✓ {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} steps
                  </span>
                )}
                {task.highlighted && (
                  <span className="rounded-md bg-tab-notes/15 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-[#8A6212] dark:text-tab-notes">
                    Starred
                  </span>
                )}
                {task.isLocked && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/15 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    <Lock size={10} /> PIN Protected
                  </span>
                )}
              </div>

              {/* Nested Subtasks Interactive Checklist */}
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="mt-2.5 rounded-xl border border-rule/60 bg-paper/60 p-2.5 dark:border-rule-dark/60 dark:bg-paper-dark/50 space-y-1.5">
                  {/* Progress bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-rule/50 dark:bg-rule-dark/50">
                    <div
                      className="h-full bg-tab-todo transition-all duration-300 rounded-full"
                      style={{
                        width: `${Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="space-y-1 pt-1">
                    {task.subtasks.map((subtask) => (
                      <label
                        key={subtask.id}
                        className="flex items-center gap-2 text-xs text-ink dark:text-ink-dark cursor-pointer group hover:bg-paper-card dark:hover:bg-paper-card-dark p-1 rounded-md transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(subtask.completed)}
                          onChange={() => {
                            const updatedSubtasks = task.subtasks.map((s) =>
                              s.id === subtask.id ? { ...s, completed: !s.completed } : s
                            );
                            onUpdate(task.id, { ...task, subtasks: updatedSubtasks });
                          }}
                          className="h-3.5 w-3.5 rounded border-rule accent-tab-todo cursor-pointer"
                        />
                        <span className={`leading-snug break-words ${subtask.completed ? 'line-through text-ink-soft dark:text-ink-soft-dark' : ''}`}>
                          {subtask.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Action Buttons - Dedicated clean row on mobile, right-aligned on desktop */}
      <div className="flex items-center justify-end gap-1 mt-1 pt-2 border-t border-rule/40 dark:border-rule-dark/40 sm:mt-0 sm:pt-0 sm:border-0 shrink-0">
        <Button variant="ghost" size="icon" aria-label="Share task" title="Share task" onClick={handleShare}>
          <Share2 size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={task.isLocked ? "Unlock task" : "Lock task with PIN"}
          title={task.isLocked ? "Unlock / Remove PIN lock" : "Lock with PIN"}
          onClick={handleToggleLock}
        >
          {task.isLocked ? <Lock size={14} className="text-amber-500" /> : <Unlock size={14} />}
        </Button>
        <Button variant="ghost" size="icon" aria-label="Archive task" title="Archive task" onClick={() => onArchive(task.id)}>
          <Archive size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={task.highlighted ? 'Remove task highlight' : 'Highlight task'}
          title="Highlight task"
          onClick={() => onToggleHighlight(task.id)}
        >
          <Star size={14} className={task.highlighted ? 'fill-tab-notes text-tab-notes' : ''} />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Edit task" title="Edit task" onClick={() => setIsEditing(true)}>
          <Pencil size={14} />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Delete task" title="Delete task" onClick={() => onDelete(task.id)}>
          <Trash2 size={14} className="text-danger" />
        </Button>
      </div>
    </Card>
  );
}
