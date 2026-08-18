import { useState } from 'react';
import { Archive, Calendar, Pencil, Star, Trash2 } from 'lucide-react';
import Card from '../Card/Card';
import TodoForm from './TodoForm';
import Button from '../Button/Button';

const PRIORITY_STYLES = {
  High: 'bg-danger/10 text-danger',
  Medium: 'bg-tab-notes/15 text-[#8A6212] dark:text-tab-notes',
  Low: 'bg-tab-reminder/10 text-tab-reminder',
};

export default function TodoItem({ task, categories, onToggle, onDelete, onUpdate, onToggleHighlight, onArchive }) {
  const [isEditing, setIsEditing] = useState(false);

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

  return (
    <Card
      tabColor="bg-tab-todo"
      className={`flex items-start gap-3 p-4 transition-opacity ${task.completed ? 'opacity-60' : ''}`}
    >
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
        <p className={`text-sm font-medium text-ink dark:text-ink-dark ${task.completed ? 'line-through' : ''}`}>
          {task.title}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-paper px-2 py-0.5 text-[11px] font-medium text-ink-soft dark:bg-paper-dark dark:text-ink-soft-dark">
            {task.category}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_STYLES[task.priority]}`}>
            {task.priority}
          </span>
          {dueLabel && (
            <span className="inline-flex items-center gap-1 rounded-full bg-paper px-2 py-0.5 text-[11px] font-mono text-ink-soft dark:bg-paper-dark dark:text-ink-soft-dark">
              <Calendar size={11} /> {dueLabel}
            </span>
          )}
          {task.highlighted && (
            <span className="rounded-full bg-tab-notes/15 px-2 py-0.5 text-[11px] font-medium text-[#8A6212] dark:text-tab-notes">
              Highlighted
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Archive task" onClick={() => onArchive(task.id)}><Archive size={15} /></Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={task.highlighted ? 'Remove task highlight' : 'Highlight task'}
          onClick={() => onToggleHighlight(task.id)}
        >
          <Star size={15} className={task.highlighted ? 'fill-tab-notes text-tab-notes' : ''} />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Edit task" onClick={() => setIsEditing(true)}>
          <Pencil size={15} />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Delete task" onClick={() => onDelete(task.id)}>
          <Trash2 size={15} className="text-danger" />
        </Button>
      </div>
    </Card>
  );
}
