import { useState } from 'react';
import { Archive, FileDown, Pencil, Trash2 } from 'lucide-react';
import Card from '../Card/Card';
import NoteForm from './NoteForm';
import Button from '../Button/Button';

const NOTE_STYLES = {
  amber: 'border-tab-notes/50 bg-[#FFF9EA] dark:bg-[#2E2A1D]',
  teal: 'border-tab-reminder/50 bg-[#EDF9F6] dark:bg-[#18312D]',
  coral: 'border-tab-todo/50 bg-[#FFF2EF] dark:bg-[#36221E]',
  slate: 'border-rule bg-paper-card dark:bg-paper-card-dark',
};

function formatTimestamp(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Bonus feature: export a single note as a PDF via the browser's print dialog
// ("Save as PDF" destination) — no extra dependency required.
function exportNoteAsPdf(note) {
  const printWindow = window.open('', '_blank', 'width=650,height=800');
  if (!printWindow) return;
  const safeTitle = note.title.replace(/</g, '&lt;');
  const safeContent = note.content.replace(/</g, '&lt;').replace(/\n/g, '<br />');
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
        <p class="meta">Exported from Ledger &middot; ${formatTimestamp(note.updatedAt || note.createdAt)}</p>
        <div class="content">${safeContent}</div>
      </body>
    </html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export default function NoteItem({ note, onDelete, onUpdate, onArchive }) {
  const [isEditing, setIsEditing] = useState(false);

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

  return (
    <Card
      tabColor="bg-tab-notes"
      className={`flex h-full flex-col p-4 ${NOTE_STYLES[note.color] || NOTE_STYLES.amber}`}
    >
      <h3 className="font-display text-base font-semibold text-ink dark:text-ink-dark">{note.title}</h3>
      <p className="mt-1.5 line-clamp-6 flex-1 whitespace-pre-wrap text-sm text-ink-soft dark:text-ink-soft-dark">
        {note.content || 'No content yet.'}
      </p>
      <div className="mt-3 flex items-center justify-between border-t border-rule pt-2.5 dark:border-rule-dark">
        <span className="font-mono text-[11px] text-ink-soft dark:text-ink-soft-dark">
          {formatTimestamp(note.updatedAt || note.createdAt)}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Archive note" onClick={() => onArchive(note.id)}><Archive size={15} /></Button>
          <Button variant="ghost" size="icon" aria-label="Export note as PDF" onClick={() => exportNoteAsPdf(note)}>
            <FileDown size={15} />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Edit note" onClick={() => setIsEditing(true)}>
            <Pencil size={15} />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Delete note" onClick={() => onDelete(note.id)}>
            <Trash2 size={15} className="text-danger" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
