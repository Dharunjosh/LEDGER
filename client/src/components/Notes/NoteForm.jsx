import { useEffect, useState } from "react";
import { Plus, Save, X } from "lucide-react";
import Button from "../Button/Button";

export const NOTE_COLORS = [
  { name: "Amber", value: "amber", className: "bg-tab-notes" },
  { name: "Teal", value: "teal", className: "bg-tab-reminder" },
  { name: "Coral", value: "coral", className: "bg-tab-todo" },
  { name: "Slate", value: "slate", className: "bg-ink-soft" },
];

const emptyDraft = { title: "", content: "", color: "amber" };

export default function NoteForm({ initialNote, onSubmit, onCancel }) {
  const [draft, setDraft] = useState(
    initialNote ? { ...emptyDraft, ...initialNote } : emptyDraft,
  );

  useEffect(() => {
    setDraft(initialNote ? { ...emptyDraft, ...initialNote } : emptyDraft);
  }, [initialNote]);

  function handleSubmit(event) {
    event.preventDefault();
    const title = draft.title.trim();
    const content = draft.content.trim();
    if (!title && !content) return;
    onSubmit({ ...draft, title: title || "Untitled note", content });
    if (!initialNote) setDraft(emptyDraft);
  }

  const isEditing = Boolean(initialNote);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-card border border-rule bg-paper-card p-4 shadow-card dark:border-rule-dark dark:bg-paper-card-dark"
    >
      <input
        autoFocus
        type="text"
        value={draft.title}
        onChange={(event) =>
          setDraft((current) => ({ ...current, title: event.target.value }))
        }
        placeholder="Note title"
        className="rounded-lg border border-rule bg-transparent px-3 py-2 text-sm font-medium text-ink outline-none placeholder:text-ink-soft/70 dark:border-rule-dark dark:text-ink-dark"
      />
      <textarea
        value={draft.content}
        onChange={(event) =>
          setDraft((current) => ({ ...current, content: event.target.value }))
        }
        placeholder="Write it down..."
        rows={5}
        className="resize-y rounded-lg border border-rule bg-transparent px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/70 dark:border-rule-dark dark:text-ink-dark"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2" aria-label="Note color">
          {NOTE_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              aria-label={`Use ${color.name} note color`}
              aria-pressed={draft.color === color.value}
              onClick={() =>
                setDraft((current) => ({ ...current, color: color.value }))
              }
              className={`h-5 w-5 rounded-full border border-transparent transition-all ${color.className} ${
                draft.color === color.value
                  ? "scale-110 border-ink shadow-sm ring-2 ring-ink/40 ring-offset-2 ring-offset-paper dark:border-ink-dark dark:ring-ink-dark/40 dark:ring-offset-paper-card-dark"
                  : "hover:scale-110 hover:border-ink/40"
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          {isEditing && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onCancel}
            >
              <X size={15} /> Cancel
            </Button>
          )}
          <Button type="submit" size="sm">
            {isEditing ? <Save size={15} /> : <Plus size={15} />}
            {isEditing ? "Save changes" : "Add note"}
          </Button>
        </div>
      </div>
    </form>
  );
}
