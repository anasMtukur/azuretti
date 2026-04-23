"use client";

import { createContext, useContext, useState } from "react";

type ConfirmOptions = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
};

type ConfirmContextType = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolver, setResolver] = useState<(v: boolean) => void>();

  const confirm: ConfirmContextType = (opts) => {
    setOptions(opts);
    setOpen(true);

    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  };

  function handleClose(result: boolean) {
    setOpen(false);
    resolver?.(result);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-5 w-full max-w-sm shadow-lg space-y-4">
            <h2 className="text-sm font-semibold text-neutral-800">
              {options.title ?? "Confirm"}
            </h2>

            <p className="text-sm text-neutral-600">
              {options.message ?? "Are you sure?"}
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleClose(false)}
                className="px-3 py-1.5 text-sm rounded bg-neutral-100"
              >
                {options.cancelText ?? "Cancel"}
              </button>

              <button
                onClick={() => handleClose(true)}
                className="px-3 py-1.5 text-sm rounded bg-red-600 text-white"
              >
                {options.confirmText ?? "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}