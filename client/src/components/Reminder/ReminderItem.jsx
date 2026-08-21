import { useState } from 'react';
import { AlarmClock, Archive, Pencil, Star, Trash2, Share2, Lock, Unlock } from 'lucide-react';
import Card from '../Card/Card';
import ReminderForm from './ReminderForm';
import Button from '../Button/Button';
import { formatReminderDateTime, isPast, isUpcoming } from '../../utils/dateUtils';
import { shareItem } from '../../utils/shareUtils';
import { useToast } from '../../context/ToastContext';

export default function ReminderItem({ reminder, onDelete, onUpdate, onToggleHighlight, onArchive }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const { showToast } = useToast();

  const isItemLocked = Boolean(reminder.isLocked && !isUnlocked);

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
  const formattedTime = formatReminderDateTime(reminder.date, reminder.time);

  const handleShare = () => {
    if (isItemLocked) {
      showToast('Unlock reminder to share its content', 'error');
      return;
    }
    shareItem({
      title: `Reminder: ${reminder.title}`,
      text: `⏰ Reminder: ${reminder.title}\nDate & Time: ${formattedTime}\nStatus: ${upcoming ? 'Upcoming ⚡' : 'Past ⏳'}`,
      showToast,
    });
  };

  const getSavedPin = () => {
    const raw = localStorage.getItem('ledger:private-pin') || localStorage.getItem('teamflow:private-pin');
    return raw ? JSON.parse(raw) : '';
  };

  const handleToggleLock = () => {
    const savedPin = getSavedPin();
    if (!reminder.isLocked && !savedPin) {
      showToast('Please set a Security PIN in Settings first', 'info');
      return;
    }
    const newLockState = !reminder.isLocked;
    onUpdate(reminder.id, { isLocked: newLockState });
    setIsUnlocked(false);
    showToast(newLockState ? 'Reminder locked with PIN' : 'Reminder unlocked');
  };

  const handleUnlockSubmit = (e) => {
    e.preventDefault();
    const savedPin = getSavedPin();
    if (!savedPin || pinInput.trim() === savedPin.toString().trim()) {
      setIsUnlocked(true);
      setShowPinPrompt(false);
      setPinInput('');
      showToast('Reminder unlocked');
    } else {
      showToast('Incorrect PIN', 'error');
    }
  };

  return (
    <Card
      tabColor="bg-tab-reminder"
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 transition-all ${
        upcoming ? 'ring-2 ring-tab-reminder ring-offset-2 ring-offset-paper dark:ring-offset-paper-dark' : ''
      } ${past ? 'opacity-60' : ''}`}
    >
      {/* Content Section */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div
          className={`mt-0.5 flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full ${
            upcoming ? 'bg-tab-reminder text-white' : 'bg-paper text-ink-soft dark:bg-paper-dark dark:text-ink-soft-dark'
          }`}
        >
          <AlarmClock size={16} />
        </div>

        <div className="min-w-0 flex-1">
          {isItemLocked ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-ink-soft dark:text-ink-soft-dark">
                <Lock size={14} className="text-amber-500 shrink-0" />
                <span className="font-semibold text-xs italic">🔒 Private Reminder (Locked with PIN)</span>
              </div>
              {showPinPrompt ? (
                <form onSubmit={handleUnlockSubmit} className="flex flex-wrap items-center gap-2 pt-1.5">
                  <input
                    type="password"
                    autoFocus
                    placeholder="Enter PIN"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="h-8 w-28 rounded-xl border border-rule bg-paper px-2.5 text-xs text-ink outline-none focus:border-tab-reminder dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark"
                  />
                  <button
                    type="submit"
                    className="h-8 rounded-xl bg-tab-reminder px-3 text-xs font-bold text-white shadow-2xs hover:bg-tab-reminder/90 active:scale-95 transition-all"
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
                  className="inline-flex items-center gap-1.5 rounded-lg border border-tab-reminder/40 bg-tab-reminder/10 px-2.5 py-1 text-xs font-semibold text-tab-reminder hover:bg-tab-reminder hover:text-white transition-all self-start mt-1"
                >
                  <Unlock size={13} /> <span>Enter PIN to unlock</span>
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-ink dark:text-ink-dark leading-snug break-words">{reminder.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span className="rounded-md bg-paper px-2 py-0.5 font-mono text-[10px] sm:text-[11px] font-semibold text-ink-soft dark:bg-paper-dark dark:text-ink-soft-dark border border-rule/50 dark:border-rule-dark/50">
                  {formattedTime}
                </span>
                {upcoming && (
                  <span className="rounded-md bg-tab-reminder/15 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-tab-reminder">
                    Upcoming
                  </span>
                )}
                {past && (
                  <span className="rounded-md bg-paper px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-ink-soft dark:bg-paper-dark dark:text-ink-soft-dark">
                    Past
                  </span>
                )}
                {reminder.highlighted && (
                  <span className="rounded-md bg-tab-notes/15 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-[#8A6212] dark:text-tab-notes">
                    Starred
                  </span>
                )}
                {reminder.isLocked && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/15 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    <Lock size={10} /> PIN Protected
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons - Dedicated clean row on mobile, right-aligned on desktop */}
      <div className="flex items-center justify-end gap-1 mt-1 pt-2 border-t border-rule/40 dark:border-rule-dark/40 sm:mt-0 sm:pt-0 sm:border-0 shrink-0">
        <Button variant="ghost" size="icon" aria-label="Share reminder" title="Share reminder" onClick={handleShare}>
          <Share2 size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={reminder.isLocked ? "Unlock reminder" : "Lock reminder with PIN"}
          title={reminder.isLocked ? "Unlock / Remove PIN lock" : "Lock with PIN"}
          onClick={handleToggleLock}
        >
          {reminder.isLocked ? <Lock size={14} className="text-amber-500" /> : <Unlock size={14} />}
        </Button>
        <Button variant="ghost" size="icon" aria-label="Archive reminder" title="Archive reminder" onClick={() => onArchive(reminder.id)}>
          <Archive size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={reminder.highlighted ? 'Remove reminder star' : 'Star reminder'}
          title="Star reminder"
          onClick={() => onToggleHighlight(reminder.id)}
        >
          <Star size={14} className={reminder.highlighted ? 'fill-tab-notes text-tab-notes' : ''} />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Edit reminder" title="Edit reminder" onClick={() => setIsEditing(true)}>
          <Pencil size={14} />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Delete reminder" title="Delete reminder" onClick={() => onDelete(reminder.id)}>
          <Trash2 size={14} className="text-danger" />
        </Button>
      </div>
    </Card>
  );
}
