import { useState } from 'react';
import { Archive, FileDown, Pencil, Trash2, Share2, Lock, Unlock } from 'lucide-react';
import Card from '../Card/Card';
import NoteForm from './NoteForm';
import Button from '../Button/Button';
import { shareItem } from '../../utils/shareUtils';
import { useToast } from '../../context/ToastContext';

const NOTE_PRESET_STYLES = {
  amber: 'border-amber-400/50 bg-amber-50/70 dark:border-amber-800/40 dark:bg-amber-950/20 text-amber-950 dark:text-amber-100',
  emerald: 'border-emerald-400/50 bg-emerald-50/70 dark:border-emerald-800/40 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-100',
  sky: 'border-sky-400/50 bg-sky-50/70 dark:border-sky-800/40 dark:bg-sky-950/20 text-sky-950 dark:text-sky-100',
  purple: 'border-purple-400/50 bg-purple-50/70 dark:border-purple-800/40 dark:bg-purple-950/20 text-purple-950 dark:text-purple-100',
  rose: 'border-rose-400/50 bg-rose-50/70 dark:border-rose-800/40 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100',
  teal: 'border-teal-400/50 bg-teal-50/70 dark:border-teal-800/40 dark:bg-teal-950/20 text-teal-950 dark:text-teal-100',
  coral: 'border-orange-400/50 bg-orange-50/70 dark:border-orange-800/40 dark:bg-orange-950/20 text-orange-950 dark:text-orange-100',
  slate: 'border-rule bg-paper-card dark:border-rule-dark dark:bg-paper-card-dark text-ink dark:text-ink-dark',
};

function formatTimestamp(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Export note as PDF via browser print
function exportNoteAsPdf(note) {
  const printWindow = window.open('', '_blank', 'width=650,height=800');
  if (!printWindow) return;
  const safeTitle = (note.title || 'Untitled Note').replace(/</g, '&lt;');
  const safeContent = (note.content || '').replace(/</g, '&lt;').replace(/\n/g, '<br />');
  printWindow.document.write(`<!doctype html>
    <html>
      <head>
        <title>${safeTitle}</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: Georgia, 'Times New Roman', serif; padding: 48px; color: #1F2A37; }
          h1 { font-size: 22px; margin-bottom: 4px; }
          p.meta { color: #5B6675; font-size: 12px; margin-top: 0; margin-bottom: 24px; }
          div.content { font-size: 15px; line-height: 1.7; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h1>${safeTitle}</h1>
        <p class="meta">Exported from TeamFlow &middot; ${formatTimestamp(note.updatedAt || note.createdAt)}</p>
        <div class="content">${safeContent}</div>
      </body>
    </html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export default function NoteItem({ note, onDelete, onUpdate, onArchive }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const { showToast } = useToast();

  const isItemLocked = Boolean(note.isLocked && !isUnlocked);

  if (isEditing) {
    return (
      <NoteForm
        initialNote={note}
        onCancel={() => setIsEditing(false)}
        onSubmit={(updated) => {
          onUpdate(note.id, updated);
          setIsEditing(false);
        }}
      />
    );
  }

  const handleShare = () => {
    if (isItemLocked) {
      showToast('Unlock note to share its content', 'error');
      return;
    }
    shareItem({
      title: note.title || 'Note',
      text: `📝 ${note.title || 'Untitled Note'}\n\n${note.content || ''}`,
      showToast,
    });
  };

  const getSavedPin = () => {
    const raw = localStorage.getItem('ledger:private-pin') || localStorage.getItem('teamflow:private-pin');
    return raw ? JSON.parse(raw) : '';
  };

  const handleToggleLock = () => {
    const savedPin = getSavedPin();
    if (!note.isLocked && !savedPin) {
      showToast('Please set a Security PIN in Settings first', 'info');
      return;
    }
    const newLockState = !note.isLocked;
    onUpdate(note.id, { isLocked: newLockState });
    setIsUnlocked(false);
    showToast(newLockState ? 'Note locked with PIN' : 'Note unlocked');
  };

  const handleUnlockSubmit = (e) => {
    e.preventDefault();
    const savedPin = getSavedPin();
    if (!savedPin || pinInput.trim() === savedPin.toString().trim()) {
      setIsUnlocked(true);
      setShowPinPrompt(false);
      setPinInput('');
      showToast('Note unlocked');
    } else {
      showToast('Incorrect PIN', 'error');
    }
  };

  // Determine custom vs preset style
  const isCustomHex = note.color?.startsWith('#');
  const customInlineStyle = isCustomHex
    ? {
        borderColor: `${note.color}80`,
        backgroundColor: `${note.color}15`,
      }
    : undefined;

  const presetClass = !isCustomHex
    ? NOTE_PRESET_STYLES[note.color] || NOTE_PRESET_STYLES.amber
    : 'text-ink dark:text-ink-dark';

  return (
    <Card
      tabColor="bg-tab-notes"
      style={customInlineStyle}
      className={`flex h-full flex-col justify-between p-3.5 sm:p-4 transition-all shadow-xs hover:shadow-md ${presetClass}`}
    >
      <div>
        {isItemLocked ? (
          <div className="flex flex-col gap-2 py-4">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-amber-500 shrink-0" />
              <span className="font-semibold text-sm italic text-ink dark:text-ink-dark">🔒 Private Note (Locked)</span>
            </div>
            <p className="text-xs text-ink-soft dark:text-ink-soft-dark">
              This note is protected with your PIN. Content is hidden.
            </p>
            {showPinPrompt ? (
              <form onSubmit={handleUnlockSubmit} className="flex flex-wrap items-center gap-2 pt-2">
                <input
                  type="password"
                  autoFocus
                  placeholder="Enter PIN"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="h-8 w-28 rounded-xl border border-rule bg-paper px-2.5 text-xs text-ink outline-none focus:border-tab-notes dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark"
                />
                <button
                  type="submit"
                  className="h-8 rounded-xl bg-tab-notes px-3 text-xs font-bold text-ink shadow-2xs hover:bg-tab-notes/90 active:scale-95 transition-all"
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-tab-notes/40 bg-tab-notes/15 px-2.5 py-1 text-xs font-semibold text-ink dark:text-ink-dark hover:bg-tab-notes hover:text-white transition-all self-start mt-1"
              >
                <Unlock size={13} /> <span>Enter PIN to unlock</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-base font-semibold text-ink dark:text-ink-dark leading-snug break-words">
                {note.title}
              </h3>
              {note.isLocked && (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                  <Lock size={10} /> PIN
                </span>
              )}
            </div>
            <p className="mt-2 line-clamp-6 whitespace-pre-wrap text-xs sm:text-sm text-ink/80 dark:text-ink-dark/80 leading-relaxed break-words">
              {note.content || 'No content yet.'}
            </p>
          </>
        )}
      </div>

      {/* Note Footer with timestamp and action buttons */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-rule/60 pt-2.5 dark:border-rule-dark/60">
        <span className="font-mono text-[10px] sm:text-[11px] text-ink-soft dark:text-ink-soft-dark">
          {formatTimestamp(note.updatedAt || note.createdAt)}
        </span>

        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" aria-label="Share note" title="Share note" onClick={handleShare}>
            <Share2 size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={note.isLocked ? "Unlock note" : "Lock note with PIN"}
            title={note.isLocked ? "Unlock / Remove PIN lock" : "Lock with PIN"}
            onClick={handleToggleLock}
          >
            {note.isLocked ? <Lock size={14} className="text-amber-500" /> : <Unlock size={14} />}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Archive note" title="Archive note" onClick={() => onArchive(note.id)}>
            <Archive size={14} />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Export note as PDF" title="Export note as PDF" onClick={() => exportNoteAsPdf(note)}>
            <FileDown size={14} />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Edit note" title="Edit note" onClick={() => setIsEditing(true)}>
            <Pencil size={14} />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Delete note" title="Delete note" onClick={() => onDelete(note.id)}>
            <Trash2 size={14} className="text-danger" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
