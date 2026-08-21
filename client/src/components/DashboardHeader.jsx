import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CheckSquare,
  NotebookPen,
  AlarmClock,
  Layers,
  Play,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { playReminderSound } from "../utils/sound";

export default function DashboardHeader({
  activeTabOverride,
  onTabChange,
}) {
  const { user } = useAuth();
  const location = useLocation();

  const [todos, setTodos] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [notesCount, setNotesCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    Promise.all([api.get("/todos"), api.get("/notes"), api.get("/reminders")])
      .then(([todosRes, notesRes, remindersRes]) => {
        if (!isMounted) return;
        setTodos(todosRes || []);
        setNotesCount((notesRes || []).length);
        setReminders(remindersRes || []);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  // Determine current active tab
  const currentTab = useMemo(() => {
    if (activeTabOverride) return activeTabOverride;
    const path = location.pathname;
    if (path === "/todo") return "tasks";
    if (path === "/notes") return "notes";
    if (path === "/reminders") return "reminders";
    return "all";
  }, [activeTabOverride, location.pathname]);

  // Calculations
  const completedTodos = useMemo(
    () => todos.filter((t) => t.completed),
    [todos]
  );
  const pendingTodos = useMemo(
    () => todos.filter((t) => !t.completed),
    [todos]
  );
  const completionRate = todos.length
    ? Math.round((completedTodos.length / todos.length) * 100)
    : 0;

  const sortedReminders = useMemo(() => {
    return [...reminders].sort(
      (a, b) =>
        new Date(`${a.date}T${a.time || "00:00"}`) -
        new Date(`${b.date}T${b.time || "00:00"}`)
    );
  }, [reminders]);

  const upcomingReminders = useMemo(() => {
    const now = new Date();
    return sortedReminders.filter((r) => {
      const dt = new Date(`${r.date}T${r.time || "00:00"}`);
      return dt >= now;
    });
  }, [sortedReminders]);

  const nextReminder = upcomingReminders[0] || null;

  const nextReminderCountdown = useMemo(() => {
    if (!nextReminder) return null;
    const now = new Date();
    const target = new Date(
      `${nextReminder.date}T${nextReminder.time || "00:00"}`
    );
    const diffMs = target - now;
    if (diffMs <= 0) return "Due now";
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `In ${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `In ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `In ${diffDays}d`;
  }, [nextReminder]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const tabs = [
    {
      id: "all",
      label: "All",
      to: "/",
      icon: Layers,
      color: "tab-todo",
      activeBg: "bg-ink text-white shadow-sm dark:bg-tab-reminder dark:text-paper-dark",
    },
    {
      id: "tasks",
      label: `Tasks (${todos.length})`,
      to: "/todo",
      icon: CheckSquare,
      color: "tab-todo",
      activeBg: "bg-tab-todo text-white shadow-sm",
    },
    {
      id: "notes",
      label: `Notes (${notesCount})`,
      to: "/notes",
      icon: NotebookPen,
      color: "tab-notes",
      activeBg: "bg-tab-notes text-ink shadow-sm",
    },
    {
      id: "reminders",
      label: `Reminders (${reminders.length})`,
      to: "/reminders",
      icon: AlarmClock,
      color: "tab-reminder",
      activeBg: "bg-tab-reminder text-white shadow-sm",
    },
  ];

  return (
    <section className="relative mb-6 overflow-hidden rounded-2xl sm:rounded-3xl border border-rule/80 bg-gradient-to-br from-paper-card via-paper-card to-paper/60 p-4 sm:p-6 lg:p-8 shadow-card dark:border-rule-dark dark:from-paper-card-dark dark:via-paper-card-dark dark:to-paper-dark/60">
      {/* Background accents */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 sm:h-64 w-48 sm:w-64 rounded-full bg-tab-reminder/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 sm:h-64 w-48 sm:w-64 rounded-full bg-tab-todo/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-4 sm:gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-rule bg-paper px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs font-semibold text-ink-soft dark:border-rule-dark dark:bg-paper-dark dark:text-ink-soft-dark">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span>{todayFormatted}</span>
          </div>
          <h1 className="mt-1.5 text-xl font-bold tracking-tight text-ink dark:text-ink-dark sm:text-2xl lg:text-3xl">
            {greeting}, {user?.name ? user.name.split(" ")[0] : "Desk Master"} 👋
          </h1>
          <p className="mt-0.5 max-w-xl text-xs sm:text-sm text-ink-soft dark:text-ink-soft-dark leading-relaxed">
            Unified workspace for your daily tasks, quick notes, and audio reminders.
          </p>
        </div>

        {/* Quick Metrics Cards */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Task Completion Progress Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-rule bg-paper/80 p-2 sm:p-2.5 lg:p-3 shadow-xs dark:border-rule-dark dark:bg-paper-dark/80 backdrop-blur-xs">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-tab-todo/15 text-tab-todo font-bold text-xs">
              {completionRate}%
            </div>
            <div>
              <p className="text-xs font-semibold text-ink dark:text-ink-dark">
                {completedTodos.length}/{todos.length} Done
              </p>
              <p className="text-[10px] text-ink-soft dark:text-ink-soft-dark">
                {pendingTodos.length} Pending
              </p>
            </div>
          </div>

          {/* Next Reminder Countdown Pill */}
          {nextReminder && (
            <div className="flex items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-rule bg-paper/80 p-2 sm:p-2.5 lg:p-3 shadow-xs dark:border-rule-dark dark:bg-paper-dark/80 backdrop-blur-xs">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-tab-reminder/15 text-tab-reminder font-bold">
                <AlarmClock size={18} className="animate-bounce" />
              </div>
              <div className="max-w-[130px] sm:max-w-[160px]">
                <p className="truncate text-xs font-semibold text-ink dark:text-ink-dark">
                  {nextReminder.title}
                </p>
                <p className="inline-flex items-center gap-1 text-[10px] font-semibold text-tab-reminder">
                  <span>⚡ {nextReminderCountdown}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Switcher Menu */}
      <div className="relative z-10 mt-3.5 sm:mt-4 flex items-center justify-between border-t border-rule/70 pt-3 sm:pt-3.5 dark:border-rule-dark/70">
        <div className="flex w-full sm:w-auto items-center gap-1 overflow-x-auto rounded-xl border border-rule bg-paper p-1 shadow-xs dark:border-rule-dark dark:bg-paper-dark scrollbar-thin">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            if (onTabChange) {
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? tab.activeBg
                      : "text-ink-soft hover:text-ink dark:text-ink-soft-dark dark:hover:text-ink-dark"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={tab.id}
                to={tab.to}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? tab.activeBg
                    : "text-ink-soft hover:text-ink dark:text-ink-soft-dark dark:hover:text-ink-dark"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
