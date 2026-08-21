import { useEffect, useMemo, useState } from "react";
import { Search, ChevronDown, SlidersHorizontal } from "lucide-react";
import { api } from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import TodoForm, { DEFAULT_CATEGORIES } from "../../components/Todo/TodoForm";
import TodoItem from "../../components/Todo/TodoItem";
import DashboardHeader from "../../components/DashboardHeader";
import { playTaskDoneSound } from "../../utils/sound";

const FILTERS = ["All", "Pending", "Completed", "Highlighted"];
const SORTS = [
  { value: "created", label: "Newest first" },
  { value: "due", label: "Due date" },
  { value: "priority", label: "Priority" },
];
const PRIORITY_RANK = { High: 0, Medium: 1, Low: 2 };

export default function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("created");
  const { showToast } = useToast();

  useEffect(() => {
    api
      .get("/todos")
      .then(setTodos)
      .catch((error) => showToast(error.message, "error"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const categories = useMemo(() => {
    const fromTasks = todos.map((task) => task.category).filter(Boolean);
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...fromTasks]));
  }, [todos]);

  async function handleAdd(draft) {
    try {
      const task = await api.post("/todos", draft);
      setTodos((current) => [task, ...current]);
      showToast("Task added");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  async function handleUpdate(id, updated) {
    try {
      const task = await api.put(`/todos/${id}`, updated);
      setTodos((current) => current.map((t) => (t.id === id ? task : t)));
      showToast("Task updated");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  function handleToggle(id) {
    const task = todos.find((t) => t.id === id);
    if (task) {
      if (!task.completed) {
        playTaskDoneSound();
      }
      handleUpdate(id, { completed: !task.completed });
    }
  }

  function handleToggleHighlight(id) {
    const task = todos.find((t) => t.id === id);
    if (task) handleUpdate(id, { highlighted: !task.highlighted });
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/todos/${id}`);
      setTodos((current) => current.filter((task) => task.id !== id));
      showToast("Task moved to recycle bin", "info");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  async function handleArchive(id) {
    try {
      await api.patch(`/todos/${id}/archive`);
      setTodos((current) => current.filter((task) => task.id !== id));
      showToast("Task archived");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  const visibleTodos = useMemo(() => {
    let list = [...todos];

    if (filter === "Pending") list = list.filter((task) => !task.completed);
    if (filter === "Completed") list = list.filter((task) => task.completed);
    if (filter === "Highlighted")
      list = list.filter((task) => task.highlighted);
    if (categoryFilter !== "All")
      list = list.filter((task) => task.category === categoryFilter);

    if (query.trim()) {
      const needle = query.trim().toLowerCase();
      list = list.filter(
        (task) =>
          task.title.toLowerCase().includes(needle) ||
          task.category.toLowerCase().includes(needle),
      );
    }

    if (sortBy === "due") {
      list.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    } else if (sortBy === "priority") {
      list.sort(
        (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
      );
    } else {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }, [todos, filter, query, sortBy]);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <DashboardHeader />

      <TodoForm categories={categories} onSubmit={handleAdd} />

      <div className="flex flex-col gap-3">
        {/* Filter pills, Category selector, Search, and Sort row */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border border-rule bg-paper-card p-1 shadow-xs dark:border-rule-dark dark:bg-paper-card-dark max-w-full overflow-x-auto scrollbar-thin">
              {FILTERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                    filter === option
                      ? "bg-tab-todo text-white shadow-xs"
                      : "text-ink-soft hover:text-ink dark:text-ink-soft-dark dark:hover:text-ink-dark"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Custom Category Dropdown */}
            <div className="relative inline-flex items-center">
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="appearance-none rounded-xl border border-rule bg-paper-card pl-3 pr-8 py-2 text-xs font-semibold text-ink outline-none shadow-xs hover:border-tab-todo focus:border-tab-todo dark:border-rule-dark dark:bg-paper-card-dark dark:text-ink-dark cursor-pointer transition-colors"
              >
                {["All", ...categories].map((category) => (
                  <option key={category} value={category} className="bg-paper-card dark:bg-paper-card-dark text-ink dark:text-ink-dark">
                    {category === "All" ? "🏷️ All Categories" : `🏷️ ${category}`}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft dark:text-ink-soft-dark" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px] sm:w-56 sm:flex-initial">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft dark:text-ink-soft-dark"
              />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tasks..."
                className="w-full rounded-xl border border-rule bg-paper-card py-2 pl-8 pr-3 text-xs text-ink outline-none shadow-xs placeholder:text-ink-soft/60 focus:border-tab-todo dark:border-rule-dark dark:bg-paper-card-dark dark:text-ink-dark transition-colors"
              />
            </div>

            {/* Custom Sort Dropdown */}
            <div className="relative inline-flex items-center">
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="appearance-none rounded-xl border border-rule bg-paper-card pl-3 pr-8 py-2 text-xs font-semibold text-ink outline-none shadow-xs hover:border-tab-todo focus:border-tab-todo dark:border-rule-dark dark:bg-paper-card-dark dark:text-ink-dark cursor-pointer transition-colors"
              >
                {SORTS.map((sort) => (
                  <option key={sort.value} value={sort.value} className="bg-paper-card dark:bg-paper-card-dark text-ink dark:text-ink-dark">
                    ⚡ {sort.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft dark:text-ink-soft-dark" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="rounded-card border border-dashed border-rule p-8 text-center text-sm text-ink-soft dark:border-rule-dark dark:text-ink-soft-dark">
          Loading tasks...
        </p>
      ) : visibleTodos.length === 0 ? (
        <p className="rounded-card border border-dashed border-rule p-8 text-center text-sm text-ink-soft dark:border-rule-dark dark:text-ink-soft-dark">
          {todos.length === 0
            ? "Add your first task above to get started."
            : "No tasks match this view."}
        </p>
      ) : (
        <div className="flex flex-col gap-3 pt-1">
          {visibleTodos.map((task) => (
            <TodoItem
              key={task.id}
              task={task}
              categories={categories}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              onToggleHighlight={handleToggleHighlight}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
