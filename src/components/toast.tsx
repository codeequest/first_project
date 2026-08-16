"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastTone = "success" | "neutral";

type Toast = {
  id: number;
  tone: ToastTone;
  message: string;
};

type ToastContextValue = {
  show: (toast: { tone?: ToastTone; message: string }) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DISMISS_AFTER_MS = 4000;

/**
 * A high-stakes admin action (approve/reject an enrollment) used to give no
 * feedback beyond the row silently vanishing from the list on the next
 * server re-render — the admin had to infer success and scroll up to watch
 * the stat counters change. This renders the acknowledgment as its own
 * layer so it survives the triggering row unmounting.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const show = useCallback<ToastContextValue["show"]>(({ tone = "neutral", message }) => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, tone, message }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, DISMISS_AFTER_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast }: { toast: Toast }) {
  return (
    <div
      role="status"
      className="animate-toast-in pointer-events-auto flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white shadow-lg shadow-ink/20"
    >
      {toast.tone === "success" ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="h-4 w-4 shrink-0 text-emerald-400"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
            clipRule="evenodd"
          />
        </svg>
      ) : null}
      {toast.message}
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }
  return context;
}
