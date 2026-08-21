import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Volume2, VolumeX, Play, Settings as SettingsIcon, Bell } from "lucide-react";
import { api } from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import ReminderForm from "../../components/Reminder/ReminderForm";
import ReminderItem from "../../components/Reminder/ReminderItem";
import DashboardHeader from "../../components/DashboardHeader";
import {
  getSoundSettings,
  saveSoundSettings,
  playReminderSound,
  PRESET_OPTIONS,
} from "../../utils/sound";

export default function ReminderPage() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);
  const [soundConfig, setSoundConfig] = useState(getSoundSettings);
  const { showToast } = useToast();

  useEffect(() => {
    api
      .get("/reminders")
      .then(setReminders)
      .catch((error) => showToast(error.message, "error"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handleSoundChange(e) {
      if (e.detail) setSoundConfig(e.detail);
    }
    window.addEventListener("ledger-sound-settings-changed", handleSoundChange);
    window.addEventListener("teamflow-sound-settings-changed", handleSoundChange);
    return () => {
      window.removeEventListener("ledger-sound-settings-changed", handleSoundChange);
      window.removeEventListener("teamflow-sound-settings-changed", handleSoundChange);
    };
  }, []);

  const toggleSound = () => {
    const next = !soundConfig.enabled;
    const updated = { ...soundConfig, enabled: next };
    setSoundConfig(updated);
    saveSoundSettings(updated);
    showToast(next ? "Audio alerts enabled" : "Audio alerts muted", "info");
    if (next) playReminderSound();
  };

  async function handleAdd(draft) {
    try {
      const reminder = await api.post("/reminders", draft);
      setReminders((current) => [reminder, ...current]);
      showToast("Reminder scheduled");
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

  const currentSoundName = useMemo(() => {
    if (soundConfig.preset === "custom") {
      return soundConfig.customSoundName || "Custom Sound";
    }
    const preset = PRESET_OPTIONS.find((p) => p.id === soundConfig.preset);
    return preset ? preset.name : "Gentle Chime";
  }, [soundConfig]);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <DashboardHeader />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight sm:text-xl text-ink dark:text-ink-dark">
            Scheduled Reminders
          </h2>
          <p className="text-xs text-ink-soft dark:text-ink-soft-dark">
            {reminders.length === 0
              ? "Nothing scheduled yet."
              : `${visibleReminders.length} active reminder${visibleReminders.length === 1 ? "" : "s"} scheduled with audio alerts.`}
          </p>
        </div>

        {/* Action Buttons & Sound Control */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Audio Quick Bar */}
          <div className="flex items-center gap-1.5 rounded-xl border border-rule bg-paper-card px-2.5 py-1.5 shadow-xs dark:border-rule-dark dark:bg-paper-card-dark">
            <button
              type="button"
              onClick={toggleSound}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                soundConfig.enabled
                  ? "bg-tab-reminder/15 text-tab-reminder"
                  : "bg-paper text-ink-soft dark:bg-paper-dark dark:text-ink-soft-dark"
              }`}
              title={soundConfig.enabled ? "Mute audio alerts" : "Enable audio alerts"}
            >
              {soundConfig.enabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
            <button
              type="button"
              onClick={() => playReminderSound()}
              className="inline-flex items-center gap-1 text-xs font-semibold text-ink dark:text-ink-dark hover:text-tab-reminder"
              title="Test current notification sound"
            >
              <Play size={12} className="text-tab-reminder" />
              <span className="hidden sm:inline">{currentSoundName}</span>
            </button>
            <Link
              to="/settings"
              className="ml-0.5 text-ink-soft hover:text-ink dark:text-ink-soft-dark dark:hover:text-ink-dark p-0.5"
              title="Change reminder sound in Settings"
            >
              <SettingsIcon size={13} />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setShowPast((current) => !current)}
            className="rounded-xl border border-rule bg-paper-card px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-paper dark:border-rule-dark dark:bg-paper-card-dark dark:text-ink-dark dark:hover:bg-paper-dark shadow-xs"
          >
            {showPast ? "Hide ended" : "Show ended"}
          </button>
        </div>
      </div>

      <ReminderForm onSubmit={handleAdd} />

      {loading ? (
        <p className="rounded-2xl border border-dashed border-rule p-8 text-center text-sm text-ink-soft dark:border-rule-dark dark:text-ink-soft-dark">
          Loading reminders...
        </p>
      ) : visibleReminders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-rule p-8 text-center text-sm text-ink-soft dark:border-rule-dark dark:text-ink-soft-dark">
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
