import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckSquare,
  NotebookPen,
  AlarmClock,
  ArrowUpRight,
  Plus,
  Clock,
  Sparkles,
  Calendar,
  Layers,
  Search,
  CheckCircle2,
  Trash2,
  Copy,
  Star,
  Play,
  Volume2,
  VolumeX,
  Share2,
} from "lucide-react";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import DashboardHeader from "../../components/DashboardHeader";
import { api } from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { formatReminderDateTime, isUpcoming } from "../../utils/dateUtils";
import { playReminderSound, playTaskDoneSound, getSoundSettings } from "../../utils/sound";
import { shareItem } from "../../utils/shareUtils";

const NOTE_COLORS = {
  amber: "border-amber-400/50 bg-amber-50/70 dark:border-amber-800/40 dark:bg-amber-950/20 text-amber-950 dark:text-amber-100",
  emerald: "border-emerald-400/50 bg-emerald-50/70 dark:border-emerald-800/40 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-100",
  sky: "border-sky-400/50 bg-sky-50/70 dark:border-sky-800/40 dark:bg-sky-950/20 text-sky-950 dark:text-sky-100",
  purple: "border-purple-400/50 bg-purple-50/70 dark:border-purple-800/40 dark:bg-purple-950/20 text-purple-950 dark:text-purple-100",
  rose: "border-rose-400/50 bg-rose-50/70 dark:border-rose-800/40 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100",
  teal: "border-teal-400/50 bg-teal-50/70 dark:border-teal-800/40 dark:bg-teal-950/20 text-teal-950 dark:text-teal-100",
  coral: "border-orange-400/50 bg-orange-50/70 dark:border-orange-800/40 dark:bg-orange-950/20 text-orange-950 dark:text-orange-100",
  slate: "border-rule bg-paper-card dark:border-rule-dark dark:bg-paper-card-dark text-ink dark:text-ink-dark",
};

const NOTE_COLOR_CHOICES = ["amber", "emerald", "sky", "purple", "rose", "teal", "coral"];

export default function Home() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [todos, setTodos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active View Mode: 'all' (3-in-1 integrated board) | 'tasks' | 'notes' | 'reminders'
  const [activeTab, setActiveTab] = useState("all");

  // Inline Quick Input States
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [quickTaskPriority, setQuickTaskPriority] = useState("Medium");
  const [quickTaskCategory, setQuickTaskCategory] = useState("General");

  const [quickNoteTitle, setQuickNoteTitle] = useState("");
  const [quickNoteContent, setQuickNoteContent] = useState("");
  const [quickNoteColor, setQuickNoteColor] = useState("amber");

  const [quickReminderTitle, setQuickReminderTitle] = useState("");
  const [quickReminderDate, setQuickReminderDate] = useState(() =>
    new Date().toISOString().split("T")[0],
  );
  const [quickReminderTime, setQuickReminderTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(0);
    return d.toTimeString().slice(0, 5);
  });

  // Fetch all 3 pillars data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [todosRes, notesRes, remindersRes] = await Promise.all([
        api.get("/todos"),
        api.get("/notes"),
        api.get("/reminders"),
      ]);
      setTodos(todosRes || []);
      setNotes(notesRes || []);
      setReminders(remindersRes || []);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculations
  const pendingTodos = useMemo(() => todos.filter((t) => !t.completed), [todos]);
  const completedTodos = useMemo(() => todos.filter((t) => t.completed), [todos]);
  const completionRate = todos.length
    ? Math.round((completedTodos.length / todos.length) * 100)
    : 0;

  const sortedReminders = useMemo(() => {
    return [...reminders].sort(
      (a, b) =>
        new Date(`${a.date}T${a.time || "00:00"}`) -
        new Date(`${b.date}T${b.time || "00:00"}`),
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

  // Next reminder countdown calculation
  const nextReminderCountdown = useMemo(() => {
    if (!nextReminder) return null;
    const now = new Date();
    const target = new Date(`${nextReminder.date}T${nextReminder.time || "00:00"}`);
    const diffMs = target - now;
    if (diffMs <= 0) return "Due now";
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `In ${diffMins} min${diffMins === 1 ? "" : "s"}`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `In ${diffHours} hr${diffHours === 1 ? "" : "s"}`;
    const diffDays = Math.floor(diffHours / 24);
    return `In ${diffDays} day${diffDays === 1 ? "" : "s"}`;
  }, [nextReminder]);

  // Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // --- Handlers ---
  // Task Handlers
  const handleQuickAddTask = async (e) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    try {
      const newTask = await api.post("/todos", {
        title: quickTaskTitle.trim(),
        priority: quickTaskPriority,
        category: quickTaskCategory,
        completed: false,
      });
      setTodos((curr) => [newTask, ...curr]);
      setQuickTaskTitle("");
      showToast("Task created!");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleToggleTask = async (task) => {
    try {
      const nextStatus = !task.completed;
      if (nextStatus) {
        playTaskDoneSound();
      }
      const updated = await api.put(`/todos/${task.id}`, {
        ...task,
        completed: nextStatus,
      });
      setTodos((curr) => curr.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos((curr) => curr.filter((t) => t.id !== id));
      showToast("Task moved to recycle bin", "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Note Handlers
  const handleQuickAddNote = async (e) => {
    e.preventDefault();
    if (!quickNoteTitle.trim()) return;
    try {
      const newNote = await api.post("/notes", {
        title: quickNoteTitle.trim(),
        content: quickNoteContent.trim(),
        color: quickNoteColor,
      });
      setNotes((curr) => [newNote, ...curr]);
      setQuickNoteTitle("");
      setQuickNoteContent("");
      showToast("Note kept!");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes((curr) => curr.filter((n) => n.id !== id));
      showToast("Note moved to recycle bin", "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleCopyNote = (content, title) => {
    navigator.clipboard.writeText(`${title}\n\n${content}`);
    showToast("Note copied to clipboard!");
  };

  // Reminder Handlers
  const handleQuickAddReminder = async (e) => {
    e.preventDefault();
    if (!quickReminderTitle.trim() || !quickReminderDate) return;
    try {
      const newReminder = await api.post("/reminders", {
        title: quickReminderTitle.trim(),
        date: quickReminderDate,
        time: quickReminderTime || "12:00",
      });
      setReminders((curr) => [newReminder, ...curr]);
      setQuickReminderTitle("");
      showToast("Reminder set with audio alert!");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      await api.delete(`/reminders/${id}`);
      setReminders((curr) => curr.filter((r) => r.id !== id));
      showToast("Reminder removed", "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Dynamic Hero Greeting & Command Hub Header with Unified Tab Switcher */}
      <DashboardHeader activeTabOverride={activeTab} onTabChange={setActiveTab} />

      {/* Integrated 3-in-1 Columns Workspace Grid */}
      <div
        className={`grid gap-6 ${
          activeTab === "all"
            ? "grid-cols-1 lg:grid-cols-3"
            : "grid-cols-1"
        }`}
      >
        {/* ========================================================= */}
        {/* 1. TASKS DASHBOARD PANEL */}
        {/* ========================================================= */}
        {(activeTab === "all" || activeTab === "tasks") && (
          <div className="flex flex-col gap-4">
            <Card tabColor="bg-tab-todo" className="flex flex-col gap-4 p-4 sm:p-5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-rule/70 pb-3 dark:border-rule-dark/70">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-tab-todo/15 text-tab-todo">
                    <CheckSquare size={17} />
                  </span>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-ink dark:text-ink-dark">Tasks Hub</h2>
                    <p className="text-[11px] sm:text-xs text-ink-soft dark:text-ink-soft-dark">
                      {pendingTodos.length} pending · {completedTodos.length} completed
                    </p>
                  </div>
                </div>
                <Link
                  to="/todo"
                  className="inline-flex items-center gap-1 rounded-xl border border-rule/80 bg-paper px-2.5 py-1 text-xs font-semibold text-tab-todo shadow-2xs hover:bg-paper-card dark:border-rule-dark dark:bg-paper-dark dark:hover:bg-paper-card-dark transition-all"
                >
                  <span>Full View</span>
                  <ArrowUpRight size={12} />
                </Link>
              </div>

              {/* Quick Task Inline Form */}
              <form onSubmit={handleQuickAddTask} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={quickTaskTitle}
                    onChange={(e) => setQuickTaskTitle(e.target.value)}
                    placeholder="Quick add new task..."
                    className="flex-1 rounded-xl border border-rule bg-paper px-3 py-1.5 sm:py-2 text-xs text-ink placeholder:text-ink-soft/60 focus:border-tab-todo focus:bg-paper-card dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    className="flex h-8 items-center gap-1 rounded-xl bg-tab-todo px-3 text-xs font-semibold text-white shadow-xs hover:bg-tab-todo/90 active:scale-95 transition-transform shrink-0"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={quickTaskPriority}
                    onChange={(e) => setQuickTaskPriority(e.target.value)}
                    className="rounded-lg border border-rule bg-paper px-2 py-1 text-[11px] text-ink dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark outline-none"
                  >
                    <option value="High">🔴 High Priority</option>
                    <option value="Medium">🟡 Medium Priority</option>
                    <option value="Low">🟢 Low Priority</option>
                  </select>
                  <select
                    value={quickTaskCategory}
                    onChange={(e) => setQuickTaskCategory(e.target.value)}
                    className="rounded-lg border border-rule bg-paper px-2 py-1 text-[11px] text-ink dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark outline-none"
                  >
                    <option value="General">General</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </form>

              {/* Tasks List */}
              <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
                {todos.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-rule p-6 text-center text-xs text-ink-soft dark:border-rule-dark dark:text-ink-soft-dark">
                    No tasks yet. Create one above!
                  </p>
                ) : (
                  todos.slice(0, activeTab === "tasks" ? 20 : 6).map((task) => (
                    <div
                      key={task.id}
                      className={`group flex items-center justify-between gap-2.5 rounded-xl border p-2.5 transition-all ${
                        task.completed
                          ? "border-rule/50 bg-paper/30 opacity-60 dark:border-rule-dark/50 dark:bg-paper-dark/30"
                          : "border-rule bg-paper/70 hover:bg-paper-card dark:border-rule-dark dark:bg-paper-dark/60 dark:hover:bg-paper-card-dark"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task)}
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-colors ${
                            task.completed
                              ? "border-success bg-success text-white"
                              : "border-rule dark:border-rule-dark"
                          }`}
                        >
                          {task.completed && (
                            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
                              <path
                                d="M2 6l2.5 2.5L10 3"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                        <span
                          className={`truncate text-xs font-medium text-ink dark:text-ink-dark ${
                            task.completed ? "line-through text-ink-soft" : ""
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="rounded-md bg-paper px-1.5 py-0.5 text-[10px] font-medium text-ink-soft dark:bg-paper-dark dark:text-ink-soft-dark">
                          {task.category || "General"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            shareItem({
                              title: `Task: ${task.title}`,
                              text: `📋 Task: ${task.title}\nCategory: ${task.category || 'General'}\nStatus: ${task.completed ? 'Completed ✅' : 'Pending ⏳'}`,
                              showToast,
                            })
                          }
                          className="opacity-0 group-hover:opacity-100 text-ink-soft hover:text-ink dark:text-ink-soft-dark dark:hover:text-ink-dark p-1 transition-opacity"
                          title="Share task"
                        >
                          <Share2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-danger hover:text-danger/80 p-1 transition-opacity"
                          title="Delete task"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {todos.length > 6 && activeTab === "all" && (
                <Link
                  to="/todo"
                  className="text-center text-xs font-semibold text-tab-todo hover:underline pt-1"
                >
                  +{todos.length - 6} more tasks in full view →
                </Link>
              )}
            </Card>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. NOTES DASHBOARD PANEL */}
        {/* ========================================================= */}
        {(activeTab === "all" || activeTab === "notes") && (
          <div className="flex flex-col gap-4">
            <Card tabColor="bg-tab-notes" className="flex flex-col gap-4 p-4 sm:p-5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-rule/70 pb-3 dark:border-rule-dark/70">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-tab-notes/15 text-tab-notes">
                    <NotebookPen size={17} />
                  </span>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-ink dark:text-ink-dark">Notes Hub</h2>
                    <p className="text-[11px] sm:text-xs text-ink-soft dark:text-ink-soft-dark">
                      {notes.length} saved thoughts & docs
                    </p>
                  </div>
                </div>
                <Link
                  to="/notes"
                  className="inline-flex items-center gap-1 rounded-xl border border-rule/80 bg-paper px-2.5 py-1 text-xs font-semibold text-tab-notes shadow-2xs hover:bg-paper-card dark:border-rule-dark dark:bg-paper-dark dark:hover:bg-paper-card-dark transition-all"
                >
                  <span>Full View</span>
                  <ArrowUpRight size={12} />
                </Link>
              </div>

              {/* Quick Note Inline Form */}
              <form onSubmit={handleQuickAddNote} className="flex flex-col gap-2">
                <input
                  type="text"
                  value={quickNoteTitle}
                  onChange={(e) => setQuickNoteTitle(e.target.value)}
                  placeholder="Quick note title..."
                  className="rounded-xl border border-rule bg-paper px-3 py-1.5 text-xs text-ink placeholder:text-ink-soft/60 focus:border-tab-notes focus:bg-paper-card dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark outline-none transition-colors"
                />
                <textarea
                  rows={2}
                  value={quickNoteContent}
                  onChange={(e) => setQuickNoteContent(e.target.value)}
                  placeholder="Write note content..."
                  className="resize-none rounded-xl border border-rule bg-paper px-3 py-1.5 text-xs text-ink placeholder:text-ink-soft/60 focus:border-tab-notes focus:bg-paper-card dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark outline-none transition-colors"
                />
                <div className="flex items-center justify-between gap-2 pt-1">
                  {/* Color Selector */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {NOTE_COLOR_CHOICES.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setQuickNoteColor(color)}
                        className={`h-4 w-4 rounded-full transition-transform ${
                          color === "amber"
                            ? "bg-amber-400"
                            : color === "emerald"
                            ? "bg-emerald-400"
                            : color === "sky"
                            ? "bg-sky-400"
                            : color === "purple"
                            ? "bg-purple-400"
                            : color === "rose"
                            ? "bg-rose-400"
                            : color === "teal"
                            ? "bg-teal-400"
                            : "bg-orange-400"
                        } ${quickNoteColor === color ? "scale-125 ring-2 ring-ink dark:ring-white" : ""}`}
                        title={`${color} note`}
                      />
                    ))}

                    {/* Custom Color Input */}
                    <label
                      className={`relative flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-rule bg-gradient-to-tr from-amber-400 via-rose-400 to-sky-400 transition-all ${
                        quickNoteColor?.startsWith('#') ? "scale-125 ring-2 ring-ink dark:ring-white" : "hover:scale-110"
                      }`}
                      title="Choose custom color"
                    >
                      <input
                        type="color"
                        value={quickNoteColor?.startsWith('#') ? quickNoteColor : "#8b5cf6"}
                        onChange={(e) => setQuickNoteColor(e.target.value)}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="flex h-7.5 items-center gap-1 rounded-xl bg-ink px-3 text-xs font-semibold text-white shadow-xs hover:bg-ink/90 active:scale-95 transition-transform dark:bg-tab-notes dark:text-ink"
                  >
                    <Plus size={13} /> Add
                  </button>
                </div>
              </form>

              {/* Notes Grid/List */}
              <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {notes.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-rule p-6 text-center text-xs text-ink-soft dark:border-rule-dark dark:text-ink-soft-dark">
                    No notes kept yet. Write your first thought above!
                  </p>
                ) : (
                  notes.slice(0, activeTab === "notes" ? 18 : 5).map((note) => {
                    const isCustomHex = note.color?.startsWith('#');
                    const colorClass = !isCustomHex
                      ? (NOTE_COLORS[note.color] || NOTE_COLORS.amber)
                      : "text-ink dark:text-ink-dark";
                    const customStyle = isCustomHex
                      ? { borderColor: `${note.color}80`, backgroundColor: `${note.color}15` }
                      : undefined;

                    return (
                      <div
                        key={note.id}
                        style={customStyle}
                        className={`group relative rounded-xl border p-3 shadow-xs transition-all hover:shadow-md ${colorClass}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="truncate font-semibold text-xs text-ink dark:text-ink-dark">
                            {note.title}
                          </h3>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() =>
                                shareItem({
                                  title: note.title,
                                  text: `📝 ${note.title}\n\n${note.content || ''}`,
                                  showToast,
                                })
                              }
                              className="text-ink-soft hover:text-ink dark:text-ink-soft-dark dark:hover:text-ink-dark p-0.5"
                              title="Share note"
                            >
                              <Share2 size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyNote(note.content, note.title)}
                              className="text-ink-soft hover:text-ink dark:text-ink-soft-dark dark:hover:text-ink-dark p-0.5"
                              title="Copy note"
                            >
                              <Copy size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-danger hover:text-danger/80 p-0.5"
                              title="Delete note"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        {note.content && (
                          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-ink/80 dark:text-ink-dark/80">
                            {note.content}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {notes.length > 5 && activeTab === "all" && (
                <Link
                  to="/notes"
                  className="text-center text-xs font-semibold text-tab-notes hover:underline pt-1"
                >
                  +{notes.length - 5} more notes in full view →
                </Link>
              )}
            </Card>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. REMINDERS DASHBOARD PANEL */}
        {/* ========================================================= */}
        {(activeTab === "all" || activeTab === "reminders") && (
          <div className="flex flex-col gap-4">
            <Card tabColor="bg-tab-reminder" className="flex flex-col gap-4 p-4 sm:p-5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-rule/70 pb-3 dark:border-rule-dark/70">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-tab-reminder/15 text-tab-reminder">
                    <AlarmClock size={17} />
                  </span>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-ink dark:text-ink-dark">
                      Reminders Hub
                    </h2>
                    <p className="text-[11px] sm:text-xs text-ink-soft dark:text-ink-soft-dark">
                      {upcomingReminders.length} active scheduled alerts
                    </p>
                  </div>
                </div>
                <Link
                  to="/reminders"
                  className="inline-flex items-center gap-1 rounded-xl border border-rule/80 bg-paper px-2.5 py-1 text-xs font-semibold text-tab-reminder shadow-2xs hover:bg-paper-card dark:border-rule-dark dark:bg-paper-dark dark:hover:bg-paper-card-dark transition-all"
                >
                  <span>Full View</span>
                  <ArrowUpRight size={12} />
                </Link>
              </div>

              {/* Quick Reminder Inline Form - Aligned */}
              <form onSubmit={handleQuickAddReminder} className="flex flex-col gap-2">
                <input
                  type="text"
                  value={quickReminderTitle}
                  onChange={(e) => setQuickReminderTitle(e.target.value)}
                  placeholder="Reminder title (e.g., Client meeting)..."
                  className="rounded-xl border border-rule bg-paper px-3 py-1.5 text-xs text-ink placeholder:text-ink-soft/60 focus:border-tab-reminder focus:bg-paper-card dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark outline-none transition-colors"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="date"
                    value={quickReminderDate}
                    onChange={(e) => setQuickReminderDate(e.target.value)}
                    className="h-8 rounded-xl border border-rule bg-paper px-2.5 text-xs text-ink dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark outline-none"
                  />
                  <input
                    type="time"
                    value={quickReminderTime}
                    onChange={(e) => setQuickReminderTime(e.target.value)}
                    className="h-8 rounded-xl border border-rule bg-paper px-2.5 text-xs text-ink dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark outline-none"
                  />
                  <button
                    type="submit"
                    className="flex h-8 items-center justify-center gap-1 rounded-xl bg-tab-reminder px-3 text-xs font-semibold text-white shadow-xs hover:bg-tab-reminder/90 active:scale-95 transition-transform shrink-0"
                  >
                    <Plus size={13} /> Set
                  </button>
                </div>
              </form>

              {/* Reminders List & Timeline */}
              <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
                {reminders.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-rule p-6 text-center text-xs text-ink-soft dark:border-rule-dark dark:text-ink-soft-dark">
                    No reminders scheduled. Set a reminder above!
                  </p>
                ) : (
                  sortedReminders.slice(0, activeTab === "reminders" ? 18 : 6).map((reminder) => {
                    const isPast =
                      new Date(`${reminder.date}T${reminder.time || "00:00"}`) < new Date();
                    return (
                      <div
                        key={reminder.id}
                        className={`group flex items-center justify-between gap-2.5 rounded-xl border p-2.5 transition-all ${
                          isPast
                            ? "border-rule/50 bg-paper/40 opacity-60 dark:border-rule-dark/50 dark:bg-paper-dark/40"
                            : "border-rule bg-paper/70 hover:bg-paper-card dark:border-rule-dark dark:bg-paper-dark/60 dark:hover:bg-paper-card-dark"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${isPast ? "bg-ink-soft" : "bg-tab-reminder animate-pulse"}`} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-ink dark:text-ink-dark">
                              {reminder.title}
                            </p>
                            <p className="font-mono text-[10px] text-ink-soft dark:text-ink-soft-dark">
                              {formatReminderDateTime(reminder.date, reminder.time)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              shareItem({
                                title: `Reminder: ${reminder.title}`,
                                text: `⏰ Reminder: ${reminder.title}\nDate & Time: ${formatReminderDateTime(reminder.date, reminder.time)}`,
                                showToast,
                              })
                            }
                            className="opacity-0 group-hover:opacity-100 text-ink-soft hover:text-ink dark:text-ink-soft-dark dark:hover:text-ink-dark p-1 transition-opacity"
                            title="Share reminder"
                          >
                            <Share2 size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReminder(reminder.id)}
                            className="opacity-0 group-hover:opacity-100 text-danger hover:text-danger/80 p-1 transition-opacity"
                            title="Delete reminder"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {reminders.length > 6 && activeTab === "all" && (
                <Link
                  to="/reminders"
                  className="text-center text-xs font-semibold text-tab-reminder hover:underline pt-1"
                >
                  +{reminders.length - 6} more reminders in full view →
                </Link>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
