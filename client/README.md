# TeamFlow — To-Do, Notes & Reminder App

A simple, responsive productivity app built with React. Organize tasks, notes and
reminders in one place, styled like a color-coded desk-organizer / index-card
system. All data is saved to `localStorage`, so it survives page refreshes with
no backend required.

## Features

- **Dashboard** — live totals for tasks, notes and reminders, plus a preview of
  pending tasks and reminders coming up this week.
- **Tasks** — add, edit, delete, mark complete; filter by All / Pending /
  Completed; search by title or category; sort by newest, due date, or priority;
  each task has a category and a High / Medium / Low priority.
- **Notes** — create, edit, delete, search by title or content; export any
  single note to PDF via the browser's print dialog.
- **Reminders** — title, date and time; edit and delete; anything due within
  the next 24 hours is highlighted automatically.
- **Light and dark theme**, toggled from the sidebar (desktop) or bottom bar
  (mobile), persisted across sessions.
- **Toast notifications** for every create / update / delete action.
- Fully responsive: a left sidebar on desktop/tablet, a bottom tab bar on
  mobile.

## Tech stack

- React 18 (functional components + hooks: `useState`, `useEffect`, `useMemo`)
- React Router v6
- Tailwind CSS (custom color/type tokens — see `tailwind.config.js`)
- `lucide-react` for icons, `uuid` for IDs
- Vite as the build tool
- No backend — persistence is `window.localStorage` via a small
  `useLocalStorage` hook

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (typically `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview   # preview the production build locally
```

## Project structure

```
src/
 ├── components/
 │   ├── Navbar/        # Sidebar (desktop) + bottom tab bar (mobile)
 │   ├── Card/           # Shared "index card with folder tab" surface
 │   ├── Button/         # Shared button with a few variants
 │   ├── Toast/          # (rendered via context, see context/ToastContext)
 │   ├── Todo/            # TodoForm, TodoItem
 │   ├── Notes/           # NoteForm, NoteItem
 │   └── Reminder/        # ReminderForm, ReminderItem
 ├── context/
 │   └── ToastContext.jsx # Toast notification provider/hook
 ├── pages/
 │   ├── Home/            # Dashboard
 │   ├── TodoPage/
 │   ├── NotesPage/
 │   └── ReminderPage/
 ├── utils/
 │   ├── useLocalStorage.js
 │   └── dateUtils.js
 ├── App.jsx
 ├── main.jsx
 └── index.css
```

## Data model

Each dataset is stored under its own `localStorage` key so pages stay
independent:

| Key                 | Shape                                                                 |
| -------------------- | ---------------------------------------------------------------------- |
| `ledger:todos`      | `{ id, title, category, priority, dueDate, completed, createdAt }`    |
| `ledger:notes`      | `{ id, title, content, createdAt, updatedAt }`                        |
| `ledger:reminders`  | `{ id, title, date, time, createdAt }`                                |
| `ledger:dark-mode`  | `boolean`                                                              |

## Design notes

The visual identity is a "desk ledger" — cards read like paper index cards
with a small colored folder-tab flap (coral for tasks, amber for notes, teal
for reminders), echoing a physical filing system where color tells you which
drawer something belongs to before you read a word. Headings use Fraunces (a
display serif), UI text uses Inter, and dates/times/counts use IBM Plex Mono
to give the numbers a ledger-like, tabular feel.

## Notes on this build

This project's source was generated in an environment without access to the
npm registry, so `npm install` has not been run or verified here — please run
it locally. All source files were hand-written and checked for syntax
consistency; if you hit anything unexpected after installing, it's most
likely a version mismatch in `package.json` rather than a logic error, and
pinning to the versions listed there should resolve it.

## License

MIT — do whatever you'd like with it.
