import { NavLink } from "react-router-dom";
import {
  CheckSquare,
  LayoutGrid,
  NotebookPen,
  BellRing,
} from "lucide-react";
import LiveClock from "../LiveClock";

const LINKS = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/todo", label: "Tasks", icon: CheckSquare, end: false },
  { to: "/notes", label: "Notes", icon: NotebookPen, end: false },
  { to: "/reminders", label: "Reminders", icon: BellRing, end: false },
];

function linkClasses({ isActive }) {
  return [
    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
    "md:flex-row",
    "flex-col md:flex-row",
    isActive
      ? "bg-ink text-white dark:bg-tab-reminder dark:text-paper-dark"
      : "text-ink-soft hover:bg-paper hover:text-ink dark:text-ink-soft-dark dark:hover:bg-paper-dark dark:hover:text-ink-dark",
  ].join(" ");
}

export default function Navbar() {

  return (
    <>
      {/* Desktop / tablet sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-rule bg-paper-card px-4 py-6 dark:border-rule-dark dark:bg-paper-card-dark md:flex">
        <div className="mb-8 flex items-center gap-2 px-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink font-display text-base font-semibold text-white dark:bg-tab-reminder dark:text-paper-dark">
            L
          </span>
          <div>
            <p className="font-display text-lg font-semibold leading-none text-ink dark:text-ink-dark">
              Ledger
            </p>
            <p className="text-[11px] text-ink-soft dark:text-ink-soft-dark">
              your desk, organized
            </p>
          </div>
        </div>

        <LiveClock className="mb-5 rounded-lg bg-paper px-3 py-2 text-center text-sm text-ink dark:bg-paper-dark dark:text-ink-dark" />
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClasses}>
              <Icon size={18} strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

      </aside>

      {/* Mobile bottom tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex gap-1 overflow-x-auto border-t border-rule bg-paper-card px-2 py-2 dark:border-rule-dark dark:bg-paper-card-dark md:hidden"
        aria-label="Primary"
      >
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-w-14 shrink-0 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] font-medium ${
                isActive
                  ? "text-tab-reminder"
                  : "text-ink-soft dark:text-ink-soft-dark"
              }`
            }
          >
            <Icon size={20} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
