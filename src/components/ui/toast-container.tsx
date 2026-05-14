"use client";

import { useUi } from "@/store/ui-store";

export function ToastContainer() {
  const { toasts, removeToast } = useUi();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => {
        const colorClasses =
          toast.type === "success"
            ? "border-green-200 bg-green-50 text-green-800"
            : toast.type === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-stone-200 bg-white text-stone-800";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-4 shadow-lg ${colorClasses}`}
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-medium leading-6">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-xs opacity-70 transition hover:opacity-100"
              >
                Kapat
              </button>
            </div>
          </div>
        );
      })}
    </div> 
  );
}