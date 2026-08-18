import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { combineDateTime, formatReminderDateTime } from '../utils/dateUtils';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export default function CalendarPage() {
  const [todos, setTodos] = useState([]);
  const [reminders, setReminders] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([api.get('/todos'), api.get('/reminders')])
      .then(([todosRes, remindersRes]) => {
        setTodos(todosRes);
        setReminders(remindersRes);
      })
      .catch((error) => showToast(error.message, 'error'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [cursor, setCursor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState(() => dateKey(new Date()));
  const events = useMemo(() => {
    const combined = [
      ...todos.filter((task) => task.dueDate).map((task) => ({ ...task, date: task.dueDate, kind: 'task' })),
      ...reminders.filter((reminder) => reminder.date).map((reminder) => ({ ...reminder, kind: 'reminder' })),
    ];
    return combined.reduce((map, event) => ({ ...map, [event.date]: [...(map[event.date] || []), event] }), {});
  }, [todos, reminders]);
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1 - first.getDay());
  const days = Array.from({ length: 42 }, (_, index) => { const date = new Date(start); date.setDate(start.getDate() + index); return date; });
  const selectedEvents = events[selected] || [];
  const today = dateKey(new Date());
  return <div className="flex flex-col gap-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-semibold sm:text-3xl">Calendar</h1><p className="mt-1 text-sm text-ink-soft dark:text-ink-soft-dark">Your task due dates and reminders, accurately arranged by day.</p></div><div className="flex items-center gap-2"><button onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="rounded-lg border border-rule p-2 dark:border-rule-dark" aria-label="Previous month"><ChevronLeft size={17}/></button><strong className="min-w-36 text-center text-sm">{cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</strong><button onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="rounded-lg border border-rule p-2 dark:border-rule-dark" aria-label="Next month"><ChevronRight size={17}/></button></div></div><div className="grid grid-cols-7 overflow-hidden rounded-card border border-rule bg-paper-card shadow-card dark:border-rule-dark dark:bg-paper-card-dark">{weekdays.map((day) => <div key={day} className="border-b border-rule p-2 text-center text-[11px] font-medium uppercase text-ink-soft dark:border-rule-dark dark:text-ink-soft-dark">{day}</div>)}{days.map((date) => { const key = dateKey(date); const inMonth = date.getMonth() === cursor.getMonth(); return <button key={key} onClick={() => setSelected(key)} className={`min-h-20 border-b border-r border-rule p-1.5 text-left transition-colors dark:border-rule-dark sm:min-h-28 ${!inMonth ? 'bg-paper/60 text-ink-soft/50 dark:bg-paper-dark/40' : ''} ${selected === key ? 'bg-tab-reminder/10' : 'hover:bg-paper dark:hover:bg-paper-dark'}`}><span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${key === today ? 'bg-tab-reminder text-white' : ''}`}>{date.getDate()}</span><div className="mt-1 space-y-1">{(events[key] || []).slice(0, 2).map((event) => <span key={`${event.kind}-${event.id}`} className={`block truncate rounded px-1 py-0.5 text-[10px] ${event.kind === 'task' ? 'bg-tab-todo/15 text-danger' : 'bg-tab-reminder/15 text-tab-reminder'}`}>{event.kind === 'reminder' && event.time ? `${event.time} ` : ''}{event.title}</span>)}{(events[key] || []).length > 2 && <span className="block text-[10px] text-ink-soft">+{events[key].length - 2} more</span>}</div></button>})}</div><div className="rounded-card border border-rule bg-paper-card p-4 shadow-card dark:border-rule-dark dark:bg-paper-card-dark"><h2 className="text-base font-semibold">{new Date(`${selected}T00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h2>{selectedEvents.length === 0 ? <p className="mt-2 text-sm text-ink-soft dark:text-ink-soft-dark">Nothing scheduled for this day.</p> : <ul className="mt-3 space-y-2">{selectedEvents.sort((a,b) => (combineDateTime(a.date, a.time) || 0) - (combineDateTime(b.date, b.time) || 0)).map((event) => <li key={`${event.kind}-${event.id}`} className="flex items-center justify-between gap-3 text-sm"><span>{event.title}</span><span className="text-xs text-ink-soft dark:text-ink-soft-dark">{event.kind === 'task' ? `Task · ${event.completed ? 'Completed' : 'Due'}` : formatReminderDateTime(event.date, event.time)}</span></li>)}</ul>}</div></div>;
}
