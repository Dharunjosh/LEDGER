import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlarmClock, ArrowUpRight, CheckSquare, NotebookPen } from 'lucide-react';
import Card from '../../components/Card/Card';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { formatReminderDateTime, isUpcoming } from '../../utils/dateUtils';

const STAT_TABS = {
  tasks: 'bg-tab-todo',
  notes: 'bg-tab-notes',
  reminders: 'bg-tab-reminder',
};

function StatCard({ to, tab, icon: Icon, label, value, sublabel }) {
  return (
    <Link to={to} className="block">
      <Card tabColor={STAT_TABS[tab]} className="flex flex-col gap-4 p-5 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-paper text-ink dark:bg-paper-dark dark:text-ink-dark">
            <Icon size={18} />
          </span>
          <ArrowUpRight size={16} className="text-ink-soft dark:text-ink-soft-dark" />
        </div>
        <div>
          <p className="font-display text-4xl font-semibold leading-none text-ink dark:text-ink-dark">{value}</p>
          <p className="mt-2 text-sm font-medium text-ink dark:text-ink-dark">{label}</p>
          <p className="text-xs text-ink-soft dark:text-ink-soft-dark">{sublabel}</p>
        </div>
      </Card>
    </Link>
  );
}

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [reminders, setReminders] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([api.get('/todos'), api.get('/notes'), api.get('/reminders')])
      .then(([todosRes, notesRes, remindersRes]) => {
        setTodos(todosRes);
        setNotes(notesRes);
        setReminders(remindersRes);
      })
      .catch((error) => showToast(error.message, 'error'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pendingTodos = todos.filter((task) => !task.completed);
  const upcomingReminders = reminders
    .filter((reminder) => isUpcoming(reminder.date, reminder.time, 24 * 7))
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
    .slice(0, 4);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-wide text-ink-soft dark:text-ink-soft-dark">{today}</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Your desk at a glance</h1>
        <p className="mt-1 text-sm text-ink-soft dark:text-ink-soft-dark">
          Three drawers, one desk: tasks, notes and reminders, all kept where you put them.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          to="/todo"
          tab="tasks"
          icon={CheckSquare}
          label="Tasks"
          value={todos.length}
          sublabel={`${pendingTodos.length} pending`}
        />
        <StatCard
          to="/notes"
          tab="notes"
          icon={NotebookPen}
          label="Notes"
          value={notes.length}
          sublabel={notes.length === 1 ? '1 note kept' : `${notes.length} notes kept`}
        />
        <StatCard
          to="/reminders"
          tab="reminders"
          icon={AlarmClock}
          label="Reminders"
          value={reminders.length}
          sublabel={`${upcomingReminders.length} upcoming this week`}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-base font-semibold text-ink dark:text-ink-dark">Pending tasks</h2>
          {pendingTodos.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft dark:text-ink-soft-dark">
              Nothing pending — your list is clear.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2.5">
              {pendingTodos.slice(0, 5).map((task) => (
                <li key={task.id} className="flex items-center gap-2.5 text-sm">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-tab-todo" />
                  <span className="truncate text-ink dark:text-ink-dark">{task.title}</span>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/todo"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-tab-reminder hover:underline"
          >
            Open tasks <ArrowUpRight size={14} />
          </Link>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold text-ink dark:text-ink-dark">Upcoming reminders</h2>
          {upcomingReminders.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft dark:text-ink-soft-dark">
              Nothing on the horizon this week.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2.5">
              {upcomingReminders.map((reminder) => (
                <li key={reminder.id} className="flex items-center justify-between gap-2.5 text-sm">
                  <span className="truncate text-ink dark:text-ink-dark">{reminder.title}</span>
                  <span className="shrink-0 font-mono text-xs text-ink-soft dark:text-ink-soft-dark">
                    {formatReminderDateTime(reminder.date, reminder.time)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/reminders"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-tab-reminder hover:underline"
          >
            Open reminders <ArrowUpRight size={14} />
          </Link>
        </Card>
      </div>
    </div>
  );
}
