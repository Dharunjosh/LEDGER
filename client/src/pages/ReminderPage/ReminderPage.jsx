import { useEffect, useMemo, useState } from "react";
import { api } from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import ReminderForm from "../../components/Reminder/ReminderForm";
import ReminderItem from "../../components/Reminder/ReminderItem";

export default function ReminderPage() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    api
      .get("/reminders")
      .then(setReminders)
      .catch((error) => showToast(error.message, "error"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd(draft) {
    try {
      const reminder = await api.post("/reminders", draft);
      setReminders((current) => [reminder, ...current]);
      showToast("Reminder set");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  async function handleUpdate(id, updated) {
    try {
      const reminder = await api.put(`/reminders/${id}`, updated);
      setReminders((current) =>
        current.map((r) => (r.id === id ? reminder : r)),
      );
      showToast("Reminder updated");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/reminders/${id}`);
      setReminders((current) =>
        current.filter((reminder) => reminder.id !== id),
      );
      showToast("Reminder moved to recycle bin", "info");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  async function handleArchive(id) {
    try {
      await api.patch(`/reminders/${id}/archive`);
      setReminders((current) =>
        current.filter((reminder) => reminder.id !== id),
      );
      showToast("Reminder archived");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  function handleToggleHighlight(id) {
    const reminder = reminders.find((r) => r.id === id);
    if (reminder) handleUpdate(id, { highlighted: !reminder.highlighted });
  }

  const sortedReminders = useMemo(
    () =>
      [...reminders].sort(
        (a, b) =>
          new Date(`${a.date}T${a.time || "00:00"}`) -
          new Date(`${b.date}T${b.time || "00:00"}`),
      ),
    [reminders],
  );

  const visibleReminders = useMemo(
    () =>
      sortedReminders.filter((reminder) => {
        const isExpired =
          new Date(`${reminder.date}T${reminder.time || "00:00"}`) < new Date();
        return showPast ? true : !isExpired;
      }),
    [showPast, sortedReminders],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Reminders</h1>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-soft-dark">
            {reminders.length === 0
              ? "Nothing scheduled yet."
              : `${visibleReminders.length} active reminder${visibleReminders.length === 1 ? "" : "s"} on the board. Anything within 24 hours is highlighted.`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowPast((current) => !current)}
          className="rounded-lg border border-rule bg-paper-card px-3 py-2 text-sm text-ink transition-colors hover:bg-paper dark:border-rule-dark dark:bg-paper-card-dark dark:text-ink-dark dark:hover:bg-paper-dark"
        >
          {showPast ? "Hide ended" : "Show ended"}
        </button>
      </div>

      <ReminderForm onSubmit={handleAdd} />

      {loading ? (
        <p className="rounded-card border border-dashed border-rule p-8 text-center text-sm text-ink-soft dark:border-rule-dark dark:text-ink-soft-dark">
          Loading reminders...
        </p>
      ) : visibleReminders.length === 0 ? (
        <p className="rounded-card border border-dashed border-rule p-8 text-center text-sm text-ink-soft dark:border-rule-dark dark:text-ink-soft-dark">
          {showPast
            ? "No reminders match this view yet."
            : "Add your first reminder above."}
        </p>
      ) : (
        <div className="flex flex-col gap-3 pt-1">
          {visibleReminders.map((reminder) => (
            <ReminderItem
              key={reminder.id}
              reminder={reminder}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              onToggleHighlight={handleToggleHighlight}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
