import { Link, NavLink } from "react-router-dom";
import {
  CheckSquare,
  LayoutGrid,
  NotebookPen,
  BellRing,
} from "lucide-react";
import LiveClock from "../LiveClock";

const LINKS = [
  { to: "/", label: "All", icon: LayoutGrid, end: true },
  { to: "/todo", label: "Tasks", icon: CheckSquare, end: false },
  { to: "/notes", label: "Notes", icon: NotebookPen, end: false },
  { to: "/reminders", label: "Reminders", icon: BellRing, end: false },
];

function linkClasses({ isActive }) {
  return [
    "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
    isActive
      ? "bg-ink text-white shadow-sm dark:bg-tab-reminder dark:text-paper-dark font-semibold"
      : "text-ink-soft hover:bg-paper hover:text-ink dark:text-ink-soft-dark dark:hover:bg-paper-dark dark:hover:text-ink-dark",
  ].join(" ");
}

export default function Navbar() {
  return (
    <>
      {/* Desktop / tablet sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-rule bg-paper-card px-4 py-6 dark:border-rule-dark dark:bg-paper-card-dark md:flex">
        <Link to="/" className="mb-6 flex items-center gap-3 px-1 hover:opacity-85 transition-opacity" title="TeamFlow Home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink font-display text-sm font-bold tracking-tight text-white dark:bg-tab-reminder dark:text-paper-dark shadow-sm">
            TF
          </span>
          <div>
            <p className="font-display text-base font-bold leading-tight text-ink dark:text-ink-dark">
              TeamFlow
            </p>
            <p className="text-[10px] tracking-wide uppercase font-medium text-ink-soft dark:text-ink-soft-dark">
              Smart Workspace
            </p>
          </div>
        </Link>

        <LiveClock className="mb-5 rounded-xl bg-paper px-3 py-2 text-center text-xs font-semibold text-ink dark:bg-paper-dark dark:text-ink-dark border border-rule/60 dark:border-rule-dark/60 shadow-2xs" />
        <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClasses}>
              <Icon size={18} strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile bottom tab bar with 4 primary items: All, Tasks, Notes, Reminders */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 items-center border-t border-rule bg-paper-card/95 backdrop-blur-md px-3 py-2 dark:border-rule-dark dark:bg-paper-card-dark/95 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        aria-label="Primary"
      >
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 px-2 transition-all ${
                isActive
                  ? "text-tab-reminder font-bold bg-tab-reminder/12 dark:bg-tab-reminder/20 scale-102"
                  : "text-ink-soft hover:text-ink dark:text-ink-soft-dark dark:hover:text-ink-dark font-medium"
              }`
            }
          >
            <Icon size={20} strokeWidth={2} />
            <span className="text-[11px] leading-none tracking-tight">{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
