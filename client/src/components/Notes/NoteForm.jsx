import { useEffect, useState } from "react";
import { Plus, Save, X, Pipette, Palette } from "lucide-react";
import Button from "../Button/Button";

export const NOTE_COLORS = [
  { name: "Amber", value: "amber", bg: "bg-amber-400" },
  { name: "Emerald", value: "emerald", bg: "bg-emerald-400" },
  { name: "Sky", value: "sky", bg: "bg-sky-400" },
  { name: "Purple", value: "purple", bg: "bg-purple-400" },
  { name: "Rose", value: "rose", bg: "bg-rose-400" },
  { name: "Teal", value: "teal", bg: "bg-teal-400" },
  { name: "Coral", value: "coral", bg: "bg-orange-400" },
  { name: "Slate", value: "slate", bg: "bg-slate-400" },
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
  const isCustomHex = draft.color?.startsWith("#");

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3.5 rounded-2xl border border-rule bg-paper-card p-4 sm:p-5 shadow-card dark:border-rule-dark dark:bg-paper-card-dark transition-all"
    >
      <input
        autoFocus
        type="text"
        value={draft.title}
        onChange={(event) =>
          setDraft((current) => ({ ...current, title: event.target.value }))
        }
        placeholder="Note title..."
        className="rounded-xl border border-rule bg-transparent px-3 py-2.5 text-sm font-semibold text-ink outline-none placeholder:text-ink-soft/60 focus:border-tab-notes dark:border-rule-dark dark:text-ink-dark transition-colors"
      />
      <textarea
        value={draft.content}
        onChange={(event) =>
          setDraft((current) => ({ ...current, content: event.target.value }))
        }
        placeholder="Write your note here..."
        rows={4}
        className="resize-y rounded-xl border border-rule bg-transparent px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-tab-notes dark:border-rule-dark dark:text-ink-dark transition-colors"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Color Palette Selector with Custom Color Picker */}
        <div className="flex flex-wrap items-center gap-1.5" aria-label="Note color">
          {NOTE_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              aria-label={`Use ${color.name} note color`}
              aria-pressed={draft.color === color.value}
              onClick={() =>
                setDraft((current) => ({ ...current, color: color.value }))
              }
              className={`h-5 w-5 rounded-full transition-all ${color.bg} ${
                draft.color === color.value
                  ? "scale-125 ring-2 ring-ink ring-offset-2 ring-offset-paper dark:ring-white dark:ring-offset-paper-card-dark"
                  : "hover:scale-110 opacity-80 hover:opacity-100"
              }`}
              title={`${color.name} color`}
            />
          ))}

          {/* Custom Hex Color Picker */}
          <label
            className={`relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-rule bg-gradient-to-tr from-amber-400 via-rose-400 to-sky-400 transition-all ${
              isCustomHex
                ? "scale-125 ring-2 ring-ink ring-offset-2 ring-offset-paper dark:ring-white dark:ring-offset-paper-card-dark"
                : "hover:scale-110"
            }`}
            title="Choose custom color"
          >
            <input
              type="color"
              value={isCustomHex ? draft.color : "#8b5cf6"}
              onChange={(e) => setDraft((curr) => ({ ...curr, color: e.target.value }))}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Custom color picker"
            />
            <Pipette size={11} className="text-white drop-shadow-sm pointer-events-none" />
          </label>
        </div>

        <div className="flex items-center gap-2">
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
            {isEditing ? "Save changes" : "Add"}
          </Button>
        </div>
      </div>
    </form>
  );
}
