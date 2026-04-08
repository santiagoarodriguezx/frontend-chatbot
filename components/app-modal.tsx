"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type AppModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidthClassName?: string;
  closeOnBackdrop?: boolean;
};

export function AppModal({
  open,
  onClose,
  title,
  children,
  maxWidthClassName = "max-w-2xl",
  closeOnBackdrop = true,
}: AppModalProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof window === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={closeOnBackdrop ? onClose : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full ${maxWidthClassName} max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-neutral-200/60 shadow-2xl animate-scale-in`}
        onClick={(event) => event.stopPropagation()}
      >
        {(title || closeOnBackdrop) && (
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <h2 className="text-lg font-bold text-neutral-950">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4 text-neutral-500" />
            </button>
          </div>
        )}

        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
