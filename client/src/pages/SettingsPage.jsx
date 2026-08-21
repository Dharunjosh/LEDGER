import { useState, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Upload,
  Trash2,
  Bell,
  CheckCircle,
  Shield,
  Palette,
  Sparkles,
  Music,
} from "lucide-react";
import useLocalStorage from "../utils/useLocalStorage";
import { useToast } from "../context/ToastContext";
import {
  getSoundSettings,
  saveSoundSettings,
  PRESET_OPTIONS,
  testSound,
} from "../utils/sound";

export default function SettingsPage({ darkMode, onToggleDarkMode }) {
  const [pin, setPin] = useLocalStorage(
    "ledger:private-pin",
    () => {
      try {
        const legacy = localStorage.getItem("teamflow:private-pin");
        return legacy ? JSON.parse(legacy) : "";
      } catch {
        return "";
      }
    }
  );
  const { showToast } = useToast();

  // Sound settings state
  const [soundConfig, setSoundConfig] = useState(getSoundSettings);
  const [isUploading, setIsUploading] = useState(false);

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

  const updateSoundConfig = (updater) => {
    setSoundConfig((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      saveSoundSettings(next);
      return next;
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Audio file size should be less than 5MB.", "error");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      updateSoundConfig({
        preset: "custom",
        customSoundData: base64,
        customSoundName: file.name,
      });
      setIsUploading(false);
      showToast(`Custom sound "${file.name}" uploaded successfully!`);
      testSound("custom", base64, soundConfig.volume);
    };
    reader.onerror = () => {
      setIsUploading(false);
      showToast("Failed to read audio file.", "error");
    };
    reader.readAsDataURL(file);
  };

  const removeCustomSound = () => {
    updateSoundConfig({
      preset: "chime",
      customSoundData: null,
      customSoundName: null,
    });
    showToast("Custom sound removed, reset to Gentle Chime.");
  };

  const handleTestSound = (presetId = soundConfig.preset) => {
    testSound(
      presetId,
      presetId === "custom" ? soundConfig.customSoundData : null,
      soundConfig.volume,
    );
  };

  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      showToast("This browser does not support system notifications.", "error");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      showToast(
        permission === "granted"
          ? "System notifications enabled."
          : "System notifications were not enabled.",
        permission === "granted" ? "success" : "info",
      );
      // Play sample sound
      if (permission === "granted") {
        handleTestSound();
      }
    } catch {
      showToast("Could not request notification permission.", "error");
    }
  };

  return (
    <div className="max-w-3xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-ink dark:text-ink-dark">
          Settings
        </h1>
        <p className="mt-1 text-sm text-ink-soft dark:text-ink-soft-dark">
          Personalize workspace aesthetics, notification alerts, custom audio, and security.
        </p>
      </div>

      <div className="space-y-4">
        {/* Notification Sound & Audio Manager */}
        <section className="rounded-2xl border border-rule bg-paper-card p-5 shadow-card dark:border-rule-dark dark:bg-paper-card-dark transition-all">
          <div className="flex items-center justify-between border-b border-rule/70 pb-3 dark:border-rule-dark/70">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-tab-reminder/15 text-tab-reminder font-semibold">
                <Music size={18} />
              </span>
              <div>
                <h2 className="font-semibold text-ink dark:text-ink-dark text-base">
                  Reminder Notification Sounds
                </h2>
                <p className="text-xs text-ink-soft dark:text-ink-soft-dark">
                  Choose built-in high-fidelity chimes or upload your custom notification tone.
                </p>
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={soundConfig.enabled}
                onChange={(e) => updateSoundConfig({ enabled: e.target.checked })}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-rule peer-checked:bg-tab-reminder peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all dark:bg-rule-dark"></div>
            </label>
          </div>

          {soundConfig.enabled && (
            <div className="mt-4 space-y-4 animate-in fade-in duration-200">
              {/* Preset Sound Selection */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-ink-soft-dark">
                  Select Alert Sound Preset
                </label>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {PRESET_OPTIONS.map((preset) => {
                    const isSelected = soundConfig.preset === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => {
                          updateSoundConfig({ preset: preset.id });
                          testSound(preset.id, null, soundConfig.volume);
                        }}
                        className={`group flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                          isSelected
                            ? "border-tab-reminder bg-tab-reminder/10 shadow-sm dark:bg-tab-reminder/20 text-tab-reminder font-semibold"
                            : "border-rule/80 bg-paper/50 hover:bg-paper dark:border-rule-dark dark:bg-paper-dark/40 dark:hover:bg-paper-dark text-ink dark:text-ink-dark"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="truncate text-xs font-semibold">{preset.name}</p>
                          <p className="truncate text-[10px] text-ink-soft dark:text-ink-soft-dark">
                            {preset.desc}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSoundConfig({ preset: preset.id });
                            testSound(preset.id, null, soundConfig.volume);
                          }}
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform active:scale-90 ${
                            isSelected
                              ? "bg-tab-reminder text-white"
                              : "bg-paper text-ink-soft group-hover:text-ink dark:bg-paper-dark dark:text-ink-soft-dark"
                          }`}
                          title="Play preview"
                        >
                          <Play size={12} className="ml-0.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Audio Upload */}
              <div className="rounded-xl border border-dashed border-rule p-3.5 dark:border-rule-dark bg-paper/40 dark:bg-paper-dark/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink dark:text-ink-dark">
                      <Upload size={14} className="text-tab-reminder" /> Custom Audio File
                    </span>
                    <p className="text-[11px] text-ink-soft dark:text-ink-soft-dark mt-0.5">
                      Upload your own MP3, WAV, or OGG sound alert (max 5MB).
                    </p>
                    {soundConfig.customSoundName && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-tab-reminder/15 px-2 py-0.5 text-xs font-medium text-tab-reminder">
                          <Music size={12} /> {soundConfig.customSoundName}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleTestSound("custom")}
                          className="rounded-md border border-rule px-2 py-0.5 text-xs font-medium text-ink hover:bg-paper dark:border-rule-dark dark:text-ink-dark"
                        >
                          ▶ Play
                        </button>
                        <button
                          type="button"
                          onClick={removeCustomSound}
                          className="text-danger hover:text-danger/80 p-1"
                          title="Remove custom audio"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-ink px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-ink/90 active:scale-95 dark:bg-tab-reminder dark:text-paper-dark">
                      <Upload size={14} />
                      {isUploading ? "Uploading..." : "Choose Audio File"}
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Volume Slider & Test Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-rule/60 dark:border-rule-dark/60">
                <div className="flex items-center gap-3 flex-1 max-w-sm">
                  <button
                    type="button"
                    onClick={() =>
                      updateSoundConfig({ volume: soundConfig.volume === 0 ? 80 : 0 })
                    }
                    className="text-ink-soft hover:text-ink dark:text-ink-soft-dark dark:hover:text-ink-dark"
                  >
                    {soundConfig.volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={soundConfig.volume}
                    onChange={(e) =>
                      updateSoundConfig({ volume: parseInt(e.target.value, 10) })
                    }
                    className="h-1.5 flex-1 cursor-pointer accent-tab-reminder bg-rule dark:bg-rule-dark rounded-lg"
                  />
                  <span className="w-9 text-right font-mono text-xs font-semibold text-ink-soft dark:text-ink-soft-dark">
                    {soundConfig.volume}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestSound()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rule bg-paper px-3 py-1.5 text-xs font-semibold text-ink shadow-sm transition-all hover:bg-paper-card dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark"
                  >
                    <Play size={12} className="text-tab-reminder" /> Test Sound Alert
                  </button>
                </div>
              </div>

              {/* Task Celebration Sound */}
              <div className="pt-2 border-t border-rule/60 dark:border-rule-dark/60">
                <label className="flex items-center justify-between gap-4 text-xs cursor-pointer">
                  <span>
                    <span className="block font-semibold text-ink dark:text-ink-dark">
                      Task Completion Chime
                    </span>
                    <span className="text-[11px] text-ink-soft dark:text-ink-soft-dark">
                      Play a subtle cheerful tone when marking tasks as completed.
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={soundConfig.taskSoundEnabled}
                    onChange={(e) =>
                      updateSoundConfig({ taskSoundEnabled: e.target.checked })
                    }
                    className="h-4 w-4 accent-tab-reminder"
                  />
                </label>
              </div>
            </div>
          )}
        </section>

        {/* System Notifications */}
        <section className="rounded-2xl border border-rule bg-paper-card p-5 shadow-card dark:border-rule-dark dark:bg-paper-card-dark">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-tab-todo/15 text-tab-todo font-semibold">
              <Bell size={18} />
            </span>
            <div>
              <h2 className="font-semibold text-ink dark:text-ink-dark text-base">
                Browser System Notifications
              </h2>
              <p className="text-xs text-ink-soft dark:text-ink-soft-dark">
                Receive notifications with sound when TeamFlow is running.
              </p>
            </div>
          </div>
          <p className="text-xs text-ink-soft dark:text-ink-soft-dark">
            In-app alerts are delivered at 15, 10, 5 minutes and exact due time before reminders.
          </p>
          <button
            type="button"
            onClick={enableNotifications}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-rule bg-paper-card px-3.5 py-2 text-xs font-semibold text-ink shadow-sm transition-all hover:bg-paper dark:border-rule-dark dark:bg-paper-card-dark dark:text-ink-dark dark:hover:bg-paper-dark"
          >
            <CheckCircle size={14} className="text-success" /> Request Notification Permission
          </button>
        </section>

        {/* Appearance & Layout */}
        <section className="rounded-2xl border border-rule bg-paper-card p-5 shadow-card dark:border-rule-dark dark:bg-paper-card-dark">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-tab-notes/15 text-tab-notes font-semibold">
              <Palette size={18} />
            </span>
            <div>
              <h2 className="font-semibold text-ink dark:text-ink-dark text-base">Appearance</h2>
              <p className="text-xs text-ink-soft dark:text-ink-soft-dark">
                Tailor themes, dark mode, and interface spacing.
              </p>
            </div>
          </div>

            <label className="flex items-center justify-between gap-4 text-sm cursor-pointer pt-2">
              <span>
                <span className="block font-semibold text-ink dark:text-ink-dark">Dark Mode</span>
                <span className="text-xs text-ink-soft dark:text-ink-soft-dark">
                  Switch between warm daylight and sleek dark paper palettes.
                </span>
              </span>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={onToggleDarkMode}
                className="h-4 w-4 accent-tab-reminder cursor-pointer"
              />
            </label>
        </section>

        {/* Security & PIN Protection */}
        <section className="rounded-2xl border border-rule bg-paper-card p-5 shadow-card dark:border-rule-dark dark:bg-paper-card-dark">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/15 text-amber-500 font-semibold">
              <Shield size={18} />
            </span>
            <div>
              <h2 className="font-semibold text-ink dark:text-ink-dark text-base">Security PIN Lock</h2>
              <p className="text-xs text-ink-soft dark:text-ink-soft-dark">
                Passcode to lock sensitive tasks, private notes, reminders, and your archive on this device.
              </p>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const val = e.currentTarget.pin.value.trim();
              setPin(val);
              showToast(
                val ? "Security PIN saved successfully!" : "Security PIN removed.",
              );
            }}
            className="mt-3 flex max-w-md gap-2"
          >
            <input
              name="pin"
              type="password"
              defaultValue={pin}
              className="min-w-0 flex-1 rounded-xl border border-rule bg-paper px-3.5 py-2 text-xs text-ink placeholder:text-ink-soft/60 focus:border-tab-reminder dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark outline-none"
              placeholder="Set a 4-digit security PIN (e.g. 1234)"
            />
            <button
              type="submit"
              className="rounded-xl bg-ink px-4 text-xs font-bold text-white shadow-xs transition-transform active:scale-95 hover:bg-ink/90 dark:bg-tab-reminder dark:text-paper-dark"
            >
              Save PIN
            </button>
            {pin && (
              <button
                type="button"
                onClick={() => {
                  setPin("");
                  showToast("Security PIN removed");
                }}
                className="rounded-xl border border-danger/40 bg-danger/10 px-3 text-xs font-bold text-danger hover:bg-danger hover:text-white transition-colors"
              >
                Clear
              </button>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
