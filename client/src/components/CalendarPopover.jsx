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
        const next = [...todos.filter((item) => item.dueDate).map((item) => ({ ...item, date: item.dueDate, kind: "task" })), ...reminders.filter((item) => item.date).map((item) => ({ ...item, kind: "reminder" }))]
          .reduce((all, item) => ({ ...all, [item.date]: [...(all[item.date] || []), item] }), {});
        setEvents(next);
      })
      .catch((error) => showToast(error.message, "error"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const days = useMemo(() => {
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1 - new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay());
    return Array.from({ length: 42 }, (_, index) => { const day = new Date(start); day.setDate(start.getDate() + index); return day; });
  }, [cursor]);
  const today = keyFor(new Date());
  const selectedEvents = events[selected] || [];
  return <section className="absolute right-0 top-full z-50 mt-2 w-[min(92vw,23rem)] rounded-xl border border-rule bg-paper-card p-3 shadow-card dark:border-rule-dark dark:bg-paper-card-dark" aria-label="Calendar">
    <div className="mb-3 flex items-center justify-between"><button onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="rounded-md p-1.5 hover:bg-paper dark:hover:bg-paper-dark" aria-label="Previous month"><ChevronLeft size={16}/></button><strong className="text-sm">{cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</strong><button onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="rounded-md p-1.5 hover:bg-paper dark:hover:bg-paper-dark" aria-label="Next month"><ChevronRight size={16}/></button></div>
    <div className="grid grid-cols-7 gap-1 text-center">{WEEKDAYS.map((day, index) => <span key={`${day}-${index}`} className="pb-1 text-[10px] font-medium text-ink-soft dark:text-ink-soft-dark">{day}</span>)}{days.map((day) => { const key = keyFor(day); const currentMonth = day.getMonth() === cursor.getMonth(); const count = (events[key] || []).length; return <button key={key} onClick={() => setSelected(key)} className={`relative mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs ${!currentMonth ? "text-ink-soft/40" : ""} ${selected === key ? "bg-tab-reminder text-white" : "hover:bg-paper dark:hover:bg-paper-dark"} ${key === today && selected !== key ? "ring-1 ring-tab-reminder" : ""}`}>{day.getDate()}{count > 0 && <span className={`absolute bottom-0 h-1 w-1 rounded-full ${selected === key ? "bg-white" : "bg-tab-todo"}`}/>}</button>})}</div>
    <div className="mt-3 border-t border-rule pt-3 dark:border-rule-dark"><p className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark">{new Date(`${selected}T00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</p>{selectedEvents.length ? <ul className="mt-2 max-h-24 space-y-1 overflow-auto">{selectedEvents.map((item) => <li key={`${item.kind}-${item.id}`} className="truncate rounded bg-paper px-2 py-1 text-xs dark:bg-paper-dark"><span className={item.kind === "task" ? "text-danger" : "text-tab-reminder"}>{item.kind === "task" ? "Task" : item.time || "Reminder"}</span> · {item.title}</li>)}</ul> : <p className="mt-1 text-xs text-ink-soft dark:text-ink-soft-dark">Nothing planned.</p>}</div>
  </section>;
}
