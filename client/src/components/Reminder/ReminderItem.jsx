import { useState } from 'react';
import { AlarmClock, Archive, Pencil, Star, Trash2 } from 'lucide-react';
import Card from '../Card/Card';
import ReminderForm from './ReminderForm';
import Button from '../Button/Button';
import { formatReminderDateTime, isPast, isUpcoming } from '../../utils/dateUtils';

export default function ReminderItem({ reminder, onDelete, onUpdate, onToggleHighlight, onArchive }) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <ReminderForm
        initialReminder={reminder}
        onCancel={() => setIsEditing(false)}
        onSubmit={(updated) => {
          onUpdate(reminder.id, updated);
          setIsEditing(false);
        }}
      />
    );
  }

  const upcoming = isUpcoming(reminder.date, reminder.time);
  const past = isPast(reminder.date, reminder.time);

  return (
    <Card
      tabColor="bg-tab-reminder"
      className={`flex items-start gap-3 p-4 ${
        upcoming ? 'ring-2 ring-tab-reminder ring-offset-2 ring-offset-paper dark:ring-offset-paper-dark' : ''
      } ${past ? 'opacity-60' : ''}`}
    >
      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          upcoming ? 'bg-tab-reminder text-white' : 'bg-paper text-ink-soft dark:bg-paper-dark dark:text-ink-soft-dark'
        }`}
      >
        <AlarmClock size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink dark:text-ink-dark">{reminder.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-paper px-2 py-0.5 font-mono text-[11px] text-ink-soft dark:bg-paper-dark dark:text-ink-soft-dark">
            {formatReminderDateTime(reminder.date, reminder.time)}
          </span>
          {upcoming && (
            <span className="rounded-full bg-tab-reminder/15 px-2 py-0.5 text-[11px] font-medium text-tab-reminder">
              Upcoming
            </span>
          )}
          {past && (
            <span className="rounded-full bg-paper px-2 py-0.5 text-[11px] font-medium text-ink-soft dark:bg-paper-dark dark:text-ink-soft-dark">
              Past
            </span>
          )}
          {reminder.highlighted && (
            <span className="rounded-full bg-tab-notes/15 px-2 py-0.5 text-[11px] font-medium text-[#8A6212] dark:text-tab-notes">
              Starred
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Archive reminder" onClick={() => onArchive(reminder.id)}><Archive size={15} /></Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={reminder.highlighted ? 'Remove reminder star' : 'Star reminder'}
          onClick={() => onToggleHighlight(reminder.id)}
        >
          <Star size={15} className={reminder.highlighted ? 'fill-tab-notes text-tab-notes' : ''} />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Edit reminder" onClick={() => setIsEditing(true)}>
          <Pencil size={15} />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Delete reminder" onClick={() => onDelete(reminder.id)}>
          <Trash2 size={15} className="text-danger" />
        </Button>
      </div>
    </Card>
  );
}
