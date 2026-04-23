"use client";

import * as Toast from "@radix-ui/react-toast";
import { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "warning" | "info";

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<ToastMessage, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

// ── Context ────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ── Icon map ───────────────────────────────────────────────────────────────
const icons: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error:   AlertCircle,
  warning: AlertTriangle,
  info:    Info,
};

const styles: Record<ToastType, string> = {
  success: "border-l-4 border-success bg-green-50 text-green-900",
  error:   "border-l-4 border-error bg-red-50 text-red-900",
  warning: "border-l-4 border-warning bg-amber-50 text-amber-900",
  info:    "border-l-4 border-info bg-blue-50 text-blue-900",
};

const iconStyles: Record<ToastType, string> = {
  success: "text-success",
  error:   "text-error",
  warning: "text-warning",
  info:    "text-info",
};

// ── Provider ───────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...opts, id }]);
  }, []);

  const success = useCallback(
    (title: string, description?: string) =>
      toast({ type: "success", title, description }),
    [toast]
  );
  const error = useCallback(
    (title: string, description?: string) =>
      toast({ type: "error", title, description }),
    [toast]
  );
  const warning = useCallback(
    (title: string, description?: string) =>
      toast({ type: "warning", title, description }),
    [toast]
  );
  const info = useCallback(
    (title: string, description?: string) =>
      toast({ type: "info", title, description }),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      <Toast.Provider swipeDirection="right">
        {children}

        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <Toast.Root
              key={t.id}
              duration={t.duration ?? 5000}
              onOpenChange={(open) => {
                if (!open) dismiss(t.id);
              }}
              className={cn(
                "group relative flex items-start gap-3 rounded-lg p-4 shadow-lg",
                "data-[state=open]:animate-scale-in",
                "data-[state=closed]:animate-fade-in",
                "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
                "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
                "data-[swipe=move]:transition-none",
                "transition-all duration-200",
                styles[t.type]
              )}
            >
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconStyles[t.type])} />

              <div className="flex-1 min-w-0">
                <Toast.Title className="text-sm font-semibold leading-tight">
                  {t.title}
                </Toast.Title>
                {t.description && (
                  <Toast.Description className="mt-1 text-sm opacity-80 leading-snug">
                    {t.description}
                  </Toast.Description>
                )}
              </div>

              <Toast.Close
                onClick={() => dismiss(t.id)}
                className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </Toast.Close>
            </Toast.Root>
          );
        })}

        <Toast.Viewport className="fixed bottom-4 right-4 z-toast flex flex-col gap-2 w-[380px] max-w-[calc(100vw-2rem)] outline-none" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}
