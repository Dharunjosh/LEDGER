import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  LogOut,
  Settings,
  Trash2,
  Archive,
  UserRound,
  BellRing,
  Volume2,
  VolumeX,
  Sun,
  Moon,
} from "lucide-react";
import { Link, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import TodoPage from "./pages/TodoPage/TodoPage";
import NotesPage from "./pages/NotesPage/NotesPage";
import ReminderPage from "./pages/ReminderPage/ReminderPage";
import NotFound from "./pages/NotFound";
import ArchivePage from "./pages/ArchivePage";
import TrashPage from "./pages/TrashPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import GlobalSearch from "./components/GlobalSearch";
import useLocalStorage from "./utils/useLocalStorage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { useToast } from "./context/ToastContext";
import { api } from "./utils/api";
import CalendarPopover from "./components/CalendarPopover";
import LiveClock from "./components/LiveClock";
import { playReminderSound, getSoundSettings, saveSoundSettings } from "./utils/sound";

function AppShell({ darkMode, onToggleDarkMode }) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [profileOpen, setProfileOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => getSoundSettings().enabled);
  const reminderAlertCache = useRef(new Set());

  useEffect(() => {
    function handleSoundChange(e) {
      if (e.detail && typeof e.detail.enabled === "boolean") {
        setSoundEnabled(e.detail.enabled);
      }
    }
    window.addEventListener("ledger-sound-settings-changed", handleSoundChange);
    window.addEventListener("teamflow-sound-settings-changed", handleSoundChange);
    return () => {
      window.removeEventListener("ledger-sound-settings-changed", handleSoundChange);
      window.removeEventListener("teamflow-sound-settings-changed", handleSoundChange);
    };
  }, []);

  const toggleSound = () => {
    const current = getSoundSettings();
    const next = !current.enabled;
    saveSoundSettings({ ...current, enabled: next });
    setSoundEnabled(next);
    showToast(next ? "Reminder sound alerts turned ON" : "Reminder sound alerts MUTED", "info");
    if (next) playReminderSound();
  };

  useEffect(() => {
    if (!user) return undefined;

    let cancelled = false;
    const pollReminderAlerts = async () => {
      try {
        const items = await api.get("/reminders");
        if (cancelled) return;

        const now = Date.now();
        items.forEach((reminder) => {
          const reminderDate = new Date(
            `${reminder.date}T${reminder.time || "00:00"}`,
          );
          if (Number.isNaN(reminderDate.getTime())) return;

          const diffMinutes = (reminderDate.getTime() - now) / 60000;
          const alertSlots = [15, 10, 5, 0];
          const slot = alertSlots.find(
            (value) => diffMinutes <= value && diffMinutes > value - 5,
          );

          if (slot === undefined || diffMinutes < -1) return;

          const cacheKey = `${reminder.id}-${slot}`;
          if (reminderAlertCache.current.has(cacheKey)) return;

          reminderAlertCache.current.add(cacheKey);
          const message =
            slot === 0
              ? `🔔 Reminder due now: ${reminder.title}`
              : `⏰ Reminder in ${slot} minutes: ${reminder.title}`;

          // Play sound notification
          playReminderSound();

          showToast(message, "info");
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("TeamFlow reminder", {
              body: message,
              tag: cacheKey,
              renotify: true,
            });
          }
        });
      } catch (error) {
        console.error("Reminder alert check failed:", error);
      }
    };

    pollReminderAlerts();
    const interval = window.setInterval(pollReminderAlerts, 20000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [user, showToast]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!event.target.closest("[data-profile-menu]")) {
        setProfileOpen(false);
      }
      if (!event.target.closest("[data-calendar-menu]")) setCalendarOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const profileDropdown = (
    <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-rule bg-paper-card p-3 shadow-2xl dark:border-rule-dark dark:bg-paper-card-dark animate-in fade-in zoom-in-95 duration-150">
      {/* User Header */}
      <div className="mb-2.5 flex items-center gap-3 rounded-xl bg-paper/70 p-2.5 text-left dark:bg-paper-dark/70 border border-rule/50 dark:border-rule-dark/50">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tab-reminder/15 text-tab-reminder font-bold text-sm shadow-xs">
          {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-ink dark:text-ink-dark">
            {user?.name || "Account"}
          </p>
          <p className="truncate text-[10px] text-ink-soft dark:text-ink-soft-dark">
            {user?.email || "Signed in"}
          </p>
        </div>
      </div>

      {/* Navigation Options with Colored Icons */}
      <div className="space-y-1">
        <Link
          to="/profile"
          onClick={() => setProfileOpen(false)}
          className="flex items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-semibold text-ink hover:bg-paper dark:text-ink-dark dark:hover:bg-paper-dark transition-colors"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-tab-reminder/15 text-tab-reminder">
            <UserRound size={15} />
          </span>
          <span>Profile</span>
        </Link>
        <Link
          to="/settings"
          onClick={() => setProfileOpen(false)}
          className="flex items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-semibold text-ink hover:bg-paper dark:text-ink-dark dark:hover:bg-paper-dark transition-colors"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-tab-reminder/15 text-tab-reminder">
            <Settings size={15} />
          </span>
          <span>Settings</span>
        </Link>
        <Link
          to="/archive"
          onClick={() => setProfileOpen(false)}
          className="flex items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-semibold text-ink hover:bg-paper dark:text-ink-dark dark:hover:bg-paper-dark transition-colors"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-tab-notes/15 text-tab-notes">
            <Archive size={15} />
          </span>
          <span>Archive</span>
        </Link>
        <Link
          to="/trash"
          onClick={() => setProfileOpen(false)}
          className="flex items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-semibold text-ink hover:bg-paper dark:text-ink-dark dark:hover:bg-paper-dark transition-colors"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-danger/15 text-danger">
            <Trash2 size={15} />
          </span>
          <span>Recycle Bin</span>
        </Link>

        {/* Quick Toggles: Dark Mode & Sound */}
        <div className="my-1.5 border-t border-rule/70 dark:border-rule-dark/70" />

        <button
          type="button"
          onClick={onToggleDarkMode}
          className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-ink hover:bg-paper dark:text-ink-dark dark:hover:bg-paper-dark transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-400/15 text-amber-500 dark:text-amber-400">
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </span>
            <span>Dark Mode</span>
          </div>
          <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-bold text-ink-soft dark:bg-paper-dark dark:text-ink-soft-dark">
            {darkMode ? "On" : "Off"}
          </span>
        </button>

        <button
          type="button"
          onClick={toggleSound}
          className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-ink hover:bg-paper dark:text-ink-dark dark:hover:bg-paper-dark transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-tab-reminder/15 text-tab-reminder">
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </span>
            <span>Audio Alerts</span>
          </div>
          <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-bold text-ink-soft dark:bg-paper-dark dark:text-ink-soft-dark">
            {soundEnabled ? "On" : "Muted"}
          </span>
        </button>

        <div className="my-1.5 border-t border-rule/70 dark:border-rule-dark/70" />

        <button
          type="button"
          onClick={() => {
            setProfileOpen(false);
            logout();
          }}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/10 transition-colors"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-danger/10 text-danger">
            <LogOut size={14} />
          </span>
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Navbar />

      <main className="ruled-bg flex-1 px-3 pb-24 pt-3 sm:px-5 md:px-7 md:pb-8 md:pt-4">
        <div className="mx-auto w-full max-w-7xl">
          {/* Mobile Top Header - Clean, non-crowded, prominent title */}
          <header className="mb-4 flex items-center justify-between gap-2 border-b border-rule/70 pb-3 dark:border-rule-dark/70 md:hidden">
            <Link to="/" className="flex items-center gap-2.5 min-w-0 shrink-0 hover:opacity-85 transition-opacity" title="TeamFlow Home">
              <span className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-ink font-display text-xs font-bold text-white shadow-sm dark:bg-tab-reminder dark:text-paper-dark">
                TF
              </span>
              <div className="min-w-0">
                <p className="font-display text-base font-bold text-ink dark:text-ink-dark leading-tight tracking-tight">
                  TeamFlow
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse shrink-0" />
                  <LiveClock className="text-[10px] font-medium text-ink-soft dark:text-ink-soft-dark" />
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-1.5 shrink-0">
              <GlobalSearch />

              <div className="relative" data-calendar-menu>
                <button
                  type="button"
                  onClick={() => setCalendarOpen((value) => !value)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-rule bg-paper-card text-ink shadow-xs transition-colors hover:bg-paper dark:border-rule-dark dark:bg-paper-card-dark dark:text-ink-dark dark:hover:bg-paper-dark"
                  aria-label="Open calendar"
                >
                  <CalendarDays size={16} />
                </button>
                {calendarOpen && <CalendarPopover onClose={() => setCalendarOpen(false)} />}
              </div>

              <div className="relative" data-profile-menu>
                <button
                  type="button"
                  onClick={() => setProfileOpen((current) => !current)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-xs font-bold text-white shadow-xs transition-transform hover:scale-105 active:scale-95 dark:bg-tab-reminder dark:text-paper-dark"
                  aria-label="Toggle profile menu"
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </button>
                {profileOpen && profileDropdown}
              </div>
            </div>
          </header>

          {/* Desktop Top Header */}
          <header className="mb-5 hidden items-center justify-between gap-3 md:flex">
            <div className="flex-1 max-w-md">
              <GlobalSearch />
            </div>
            <div className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSound}
                className={`flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-all ${
                  soundEnabled
                    ? "border-tab-reminder/40 bg-tab-reminder/10 text-tab-reminder hover:bg-tab-reminder/20"
                    : "border-rule bg-paper-card text-ink-soft hover:bg-paper dark:border-rule-dark dark:bg-paper-card-dark dark:text-ink-soft-dark"
                }`}
                title={soundEnabled ? "Audio alerts enabled" : "Audio alerts muted"}
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                <span>{soundEnabled ? "Sound On" : "Muted"}</span>
              </button>

              <button
                type="button"
                onClick={onToggleDarkMode}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-rule bg-paper-card text-ink shadow-xs transition-all hover:bg-paper dark:border-rule-dark dark:bg-paper-card-dark dark:text-ink-dark dark:hover:bg-paper-dark"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? (
                  <Sun size={17} className="text-amber-400" />
                ) : (
                  <Moon size={17} className="text-ink-soft hover:text-ink transition-colors" />
                )}
              </button>

              <div className="relative" data-calendar-menu>
                <button
                  type="button"
                  onClick={() => setCalendarOpen((value) => !value)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-rule bg-paper-card text-ink shadow-xs transition-colors hover:bg-paper dark:border-rule-dark dark:bg-paper-card-dark dark:text-ink-dark dark:hover:bg-paper-dark"
                  aria-label="Open calendar"
                >
                  <CalendarDays size={17} />
                </button>
                {calendarOpen && <CalendarPopover onClose={() => setCalendarOpen(false)} />}
              </div>

              <div className="relative" data-profile-menu>
                <button
                  type="button"
                  onClick={() => setProfileOpen((current) => !current)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white shadow-xs transition-transform hover:scale-105 active:scale-95 dark:bg-tab-reminder dark:text-paper-dark"
                  aria-label="Toggle profile menu"
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </button>
                {profileOpen && profileDropdown}
              </div>
            </div>
          </header>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/todo" element={<TodoPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/reminders" element={<ReminderPage />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/trash" element={<TrashPage />} />
            <Route
              path="/settings"
              element={
                <SettingsPage
                  darkMode={darkMode}
                  onToggleDarkMode={onToggleDarkMode}
                />
              }
            />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useLocalStorage("ledger:dark-mode", false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode((current) => !current)}
            />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
