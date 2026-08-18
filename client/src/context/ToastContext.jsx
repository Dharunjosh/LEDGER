import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  info: Info,
  error: TriangleAlert,
};

const TAB_COLORS = {
  success: 'bg-success',
  info: 'bg-tab-reminder',
  error: 'bg-danger',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success') => {
      const id = ++counter.current;
      setToasts((current) => [...current, { id, message, type }]);
      window.setTimeout(() => dismiss(id), 3200);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type] ?? Info;
          return (
            <div
              key={toast.id}
              role="status"
              className="animate-[toast-in_0.2s_ease-out] flex items-start gap-3 overflow-hidden rounded-card border border-rule bg-paper-card p-3 pr-2 shadow-card dark:border-rule-dark dark:bg-paper-card-dark"
            >
              <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${TAB_COLORS[toast.type]}`} />
              <Icon size={18} className="mt-0.5 shrink-0 text-ink-soft dark:text-ink-soft-dark" />
              <p className="flex-1 text-sm text-ink dark:text-ink-dark">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="shrink-0 rounded p-1 text-ink-soft hover:bg-paper hover:text-ink dark:text-ink-soft-dark dark:hover:bg-paper-dark"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
