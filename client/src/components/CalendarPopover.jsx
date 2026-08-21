import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../utils/api";
import { useToast } from "../context/ToastContext";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const keyFor = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function CalendarPopover({ onClose }) {
  const [cursor, setCursor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState(() => keyFor(new Date()));
  const [events, setEvents] = useState({});
  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([api.get("/todos"), api.get("/reminders")])
      .then(([todos, reminders]) => {
        const next = [
          ...todos.filter((item) => item.dueDate).map((item) => ({ ...item, date: item.dueDate, kind: "task" })),
          ...reminders.filter((item) => item.date).map((item) => ({ ...item, kind: "reminder" }))
        ].reduce((all, item) => ({ ...all, [item.date]: [...(all[item.date] || []), item] }), {});
        setEvents(next);
      })
      .catch((error) => showToast(error.message, "error"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const days = useMemo(() => {
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1 - new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [cursor]);

  const today = keyFor(new Date());
  const selectedEvents = events[selected] || [];

  return (
    <>
      {/* Mobile background backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-xs sm:hidden" 
        onClick={onClose}
        aria-hidden="true"
      />

      <section
        className="fixed inset-x-4 top-16 z-50 mx-auto max-w-sm rounded-2xl border border-rule bg-paper-card p-4 shadow-2xl dark:border-rule-dark dark:bg-paper-card-dark sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-84 sm:p-4 sm:shadow-card animate-in fade-in zoom-in-95 duration-150"
        aria-label="Calendar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between border-b border-rule/70 pb-2.5 dark:border-rule-dark/70">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              className="rounded-lg p-1.5 text-ink-soft hover:bg-paper hover:text-ink dark:text-ink-soft-dark dark:hover:bg-paper-dark dark:hover:text-ink-dark transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              className="rounded-lg p-1.5 text-ink-soft hover:bg-paper hover:text-ink dark:text-ink-soft-dark dark:hover:bg-paper-dark dark:hover:text-ink-dark transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
            <strong className="ml-1 text-sm font-semibold text-ink dark:text-ink-dark">
              {cursor.toLocaleDateString(undefined, { month: "short", year: "numeric" })}
            </strong>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
                setSelected(today);
              }}
              className="rounded-md bg-paper px-2 py-0.5 text-[11px] font-medium text-ink hover:bg-paper-dark/10 dark:bg-paper-dark dark:text-ink-dark"
            >
              Today
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-ink-soft hover:bg-paper hover:text-ink dark:text-ink-soft-dark dark:hover:bg-paper-dark dark:hover:text-ink-dark"
              aria-label="Close calendar"
            >
              &#x2715;
            </button>
          </div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((day, index) => (
            <span key={`${day}-${index}`} className="pb-1 text-[11px] font-semibold text-ink-soft/70 dark:text-ink-soft-dark/70">
              {day}
            </span>
          ))}
          {days.map((day) => {
            const key = keyFor(day);
            const currentMonth = day.getMonth() === cursor.getMonth();
            const dayEvents = events[key] || [];
            const hasTasks = dayEvents.some((e) => e.kind === "task");
            const hasReminders = dayEvents.some((e) => e.kind === "reminder");
            const isSelected = selected === key;
            const isToday = key === today;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(key)}
                className={`relative mx-auto flex h-8 w-8 items-center justify-center rounded-xl text-xs font-medium transition-all ${
                  !currentMonth ? "text-ink-soft/30 dark:text-ink-soft-dark/30" : "text-ink dark:text-ink-dark"
                } ${
                  isSelected
                    ? "bg-tab-reminder text-white font-bold shadow-sm"
                    : "hover:bg-paper dark:hover:bg-paper-dark"
                } ${isToday && !isSelected ? "ring-1.5 ring-tab-reminder font-semibold" : ""}`}
              >
                {day.getDate()}
                {dayEvents.length > 0 && (
                  <span className="absolute bottom-1 flex gap-0.5">
                    {hasTasks && (
                      <span
                        className={`h-1 w-1 rounded-full ${
                          isSelected ? "bg-white" : "bg-tab-todo"
                        }`}
                      />
                    )}
                    {hasReminders && (
                      <span
                        className={`h-1 w-1 rounded-full ${
                          isSelected ? "bg-white" : "bg-tab-reminder"
                        }`}
                      />
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Event details for selected date */}
        <div className="mt-3 border-t border-rule/70 pt-2.5 dark:border-rule-dark/70">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-ink dark:text-ink-dark">
              {new Date(`${selected}T00:00`).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
            <span className="text-[10px] text-ink-soft dark:text-ink-soft-dark">
              {selectedEvents.length} scheduled
            </span>
          </div>

          {selectedEvents.length ? (
            <ul className="mt-2 max-h-28 space-y-1.5 overflow-y-auto pr-1 scrollbar-thin">
              {selectedEvents.map((item) => (
                <li
                  key={`${item.kind}-${item.id}`}
                  className="flex items-center justify-between gap-2 rounded-lg bg-paper px-2.5 py-1.5 text-xs dark:bg-paper-dark border border-rule/40 dark:border-rule-dark/40"
                >
                  <span className="truncate text-ink dark:text-ink-dark font-medium">{item.title}</span>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      item.kind === "task"
                        ? "bg-tab-todo/15 text-tab-todo"
                        : "bg-tab-reminder/15 text-tab-reminder"
                    }`}
                  >
                    {item.kind === "task" ? "Task" : item.time || "Reminder"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 text-xs text-ink-soft dark:text-ink-soft-dark italic">
              No tasks or reminders on this date.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
