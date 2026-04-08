"use client";

import type { DashboardMode } from "@/lib/types";

type DashboardModeSwitcherProps = {
  mode: DashboardMode;
  canSwitchToUser: boolean;
  onChange: (mode: DashboardMode) => void;
};

export function DashboardModeSwitcher({
  mode,
  canSwitchToUser,
  onChange,
}: DashboardModeSwitcherProps) {
  return (
    <div className="inline-flex items-center rounded-xl border border-neutral-200 bg-white p-1">
      <button
        type="button"
        onClick={() => onChange("usuario")}
        disabled={!canSwitchToUser}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
          mode === "usuario"
            ? "bg-neutral-950 text-white"
            : "text-neutral-600 hover:bg-neutral-100"
        } disabled:cursor-not-allowed disabled:opacity-40`}
      >
        Usuario
      </button>
      <button
        type="button"
        onClick={() => onChange("administrador")}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
          mode === "administrador"
            ? "bg-neutral-950 text-white"
            : "text-neutral-600 hover:bg-neutral-100"
        }`}
      >
        Administrador
      </button>
    </div>
  );
}
