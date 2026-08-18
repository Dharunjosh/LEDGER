import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  LogOut,
  Settings,
  Trash2,
  Archive,
  UserRound,
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

function AppShell({ darkMode, onToggleDarkMode }) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [profileOpen, setProfileOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const reminderAlertCache = useRef(new Set());

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
          const message = slot === 0 ? `Reminder due now: ${reminder.title}` : `Reminder in ${slot} minutes: ${reminder.title}`;
          showToast(message, "info");
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Ledger reminder", { body: message, tag: cacheKey, renotify: true });
          }
        });
      } catch (error) {
        console.error("Reminder alert check failed:", error);
      }
    };

    pollReminderAlerts();
    const interval = window.setInterval(pollReminderAlerts, 30000);

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

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Navbar />

      <main className="ruled-bg flex-1 px-3 pb-24 pt-3 sm:px-5 md:px-7 md:pb-8 md:pt-4">
        <div className="mx-auto w-full max-w-6xl">
          <header className="mb-3 flex items-center justify-between gap-3">
            <div className="flex-1 max-w-md">
              <GlobalSearch />
            </div>
            <div className="relative flex items-center gap-2" data-profile-menu>
              <div className="relative" data-calendar-menu>
                <button type="button" onClick={() => setCalendarOpen((value) => !value)} className="flex h-9 w-9 items-center justify-center rounded-full border border-rule bg-paper-card text-ink transition-colors hover:bg-paper dark:border-rule-dark dark:bg-paper-card-dark dark:text-ink-dark dark:hover:bg-paper-dark" aria-label="Open calendar"><CalendarDays size={17} /></button>
                {calendarOpen && <CalendarPopover onClose={() => setCalendarOpen(false)} />}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((current) => !current)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] dark:bg-tab-reminder dark:text-paper-dark"
                  aria-label="Toggle profile menu"
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-rule bg-paper-card p-2 shadow-card dark:border-rule-dark dark:bg-paper-card-dark">
                    <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2 text-left">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-tab-reminder/15 text-tab-reminder">
                        <UserRound size={16} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink dark:text-ink-dark">
                          {user?.name || "Account"}
                        </p>
                        <p className="truncate text-[11px] text-ink-soft dark:text-ink-soft-dark">
                          {user?.email || "Signed in"}
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-ink hover:bg-paper dark:text-ink-dark dark:hover:bg-paper-dark"
                    >
                      <UserRound size={16} /> Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-ink hover:bg-paper dark:text-ink-dark dark:hover:bg-paper-dark"
                    >
                      <Settings size={16} /> Settings
                    </Link>
                    <Link
                      to="/archive"
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-ink hover:bg-paper dark:text-ink-dark dark:hover:bg-paper-dark"
                    >
                      <Archive size={16} /> Archive
                    </Link>
                    <Link
                      to="/trash"
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-ink hover:bg-paper dark:text-ink-dark dark:hover:bg-paper-dark"
                    >
                      <Trash2 size={16} /> Deleted
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-danger hover:bg-danger/10"
                    >
                      <LogOut size={16} /> Log out
                    </button>
                  </div>
                )}
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
