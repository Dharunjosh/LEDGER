import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { api } from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import NoteForm from "../../components/Notes/NoteForm";
import NoteItem from "../../components/Notes/NoteItem";
import DuplicateNoteDialog from "../../components/DuplicateNoteDialog";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [duplicateChoice, setDuplicateChoice] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    api
      .get("/notes")
      .then(setNotes)
      .catch((error) => showToast(error.message, "error"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd(draft) {
    const normalizedTitle = (draft.title || "").trim();
    const duplicate = notes.find(
      (note) =>
        note.title.trim().toLowerCase() === normalizedTitle.toLowerCase() &&
        normalizedTitle,
    );

    if (duplicate) { setDuplicateChoice({ duplicate, draft }); return; }
    await createNote(draft);
  }

  async function createNote(draft) {
    try { const note = await api.post("/notes", { ...draft, color: draft.color || "amber" }); setNotes((current) => [note, ...current]); showToast("Note created"); } catch (error) { showToast(error.message, "error"); }
  }

  async function overwriteDuplicate() {
    const { duplicate, draft } = duplicateChoice;
    try { const updated = await api.put(`/notes/${duplicate.id}`, { ...duplicate, ...draft, title: duplicate.title, color: draft.color || duplicate.color || "amber" }); setNotes((current) => current.map((note) => (note.id === duplicate.id ? updated : note))); showToast("Note updated"); } catch (error) { showToast(error.message, "error"); } finally { setDuplicateChoice(null); }
  }

  async function handleUpdate(id, updated) {
    try {
      const note = await api.put(`/notes/${id}`, updated);
      setNotes((current) => current.map((n) => (n.id === id ? note : n)));
      showToast("Note updated");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/notes/${id}`);
      setNotes((current) => current.filter((note) => note.id !== id));
      showToast("Note moved to recycle bin", "info");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  async function handleArchive(id) {
    try {
      await api.patch(`/notes/${id}/archive`);
      setNotes((current) => current.filter((note) => note.id !== id));
      showToast("Note archived");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  const visibleNotes = useMemo(() => {
    if (!query.trim()) return notes;
    const needle = query.trim().toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(needle) ||
        note.content.toLowerCase().includes(needle),
    );
  }, [notes, query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Notes</h1>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-soft-dark">
            {notes.length === 0
              ? "No notes yet."
              : `${notes.length} note${notes.length === 1 ? "" : "s"} kept.`}
          </p>
        </div>
        <div className="relative sm:w-64">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft dark:text-ink-soft-dark"
          />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notes..."
            className="w-full rounded-lg border border-rule bg-paper-card py-2 pl-8 pr-3 text-sm text-ink outline-none placeholder:text-ink-soft/70 dark:border-rule-dark dark:bg-paper-card-dark dark:text-ink-dark"
          />
        </div>
      </div>

      <NoteForm onSubmit={handleAdd} />
      {duplicateChoice && <DuplicateNoteDialog title={duplicateChoice.duplicate.title} onOverwrite={overwriteDuplicate} onKeepSeparate={() => { createNote(duplicateChoice.draft); setDuplicateChoice(null); }} onCancel={() => setDuplicateChoice(null)} />}

      {loading ? (
        <p className="rounded-card border border-dashed border-rule p-8 text-center text-sm text-ink-soft dark:border-rule-dark dark:text-ink-soft-dark">
          Loading notes...
        </p>
      ) : visibleNotes.length === 0 ? (
        <p className="rounded-card border border-dashed border-rule p-8 text-center text-sm text-ink-soft dark:border-rule-dark dark:text-ink-soft-dark">
          {notes.length === 0
            ? "Write your first note above."
            : "No notes match your search."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2 xl:grid-cols-3">
          {visibleNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
