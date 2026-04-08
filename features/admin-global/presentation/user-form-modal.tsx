"use client";

import { useEffect, useMemo, useState } from "react";
import { AppModal } from "@/components/app-modal";
import type {
  AdminUser,
  AdminUserCreateInput,
  AdminUserRole,
  AdminUserUpdateInput,
} from "@/lib/types";

type UserFormModalProps = {
  open: boolean;
  user?: AdminUser | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: AdminUserCreateInput | AdminUserUpdateInput) => Promise<void>;
};

type UserDraft = {
  email: string;
  password: string;
  role: AdminUserRole;
  is_active: boolean;
};

const INITIAL_DRAFT: UserDraft = {
  email: "",
  password: "",
  role: "member",
  is_active: true,
};

function toDraft(user?: AdminUser | null): UserDraft {
  if (!user) {
    return INITIAL_DRAFT;
  }

  return {
    email: user.email,
    password: "",
    role: user.role,
    is_active: user.is_active,
  };
}

export function UserFormModal({
  open,
  user,
  saving,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const [draft, setDraft] = useState<UserDraft>(INITIAL_DRAFT);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(user);

  useEffect(() => {
    if (!open) return;
    setDraft(toDraft(user));
    setError(null);
  }, [open, user]);

  const title = useMemo(
    () => (isEditing ? "Editar usuario" : "Crear usuario"),
    [isEditing],
  );

  function setField<K extends keyof UserDraft>(field: K, value: UserDraft[K]) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!isEditing) {
      const email = draft.email.trim().toLowerCase();
      if (!email) {
        setError("El email es obligatorio.");
        return;
      }

      if (draft.password && draft.password.trim().length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres.");
        return;
      }

      const payload: AdminUserCreateInput = {
        email,
        password: draft.password,
        role: draft.role,
        is_active: draft.is_active,
      };

      await onSubmit(payload);
      return;
    }

    const payload: AdminUserUpdateInput = {
      role: draft.role,
      is_active: draft.is_active,
    };

    await onSubmit(payload);
  }

  return (
    <AppModal open={open} onClose={onClose} title={title} maxWidthClassName="max-w-lg">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Email</label>
          <input
            type="email"
            value={draft.email}
            onChange={(event) => setField("email", event.target.value)}
            disabled={isEditing}
            className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:bg-neutral-100"
            placeholder="admin@empresa.com"
          />
          {isEditing && (
            <p className="mt-1 text-[11px] text-neutral-400">El email no se puede editar desde aquí.</p>
          )}
        </div>

        {!isEditing && (
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Contraseña temporal (opcional)
            </label>
            <input
              type="password"
              value={draft.password}
              onChange={(event) => setField("password", event.target.value)}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="Min. 8 caracteres"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Rol</label>
            <select
              value={draft.role}
              onChange={(event) =>
                setField("role", event.target.value as AdminUserRole)
              }
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
            >
              <option value="admin">admin</option>
              <option value="owner">owner</option>
              <option value="member">member</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-700 mt-6">
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(event) => setField("is_active", event.target.checked)}
              className="accent-neutral-950"
            />
            Activo
          </label>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-neutral-950 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear usuario"}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
        >
          Cancelar
        </button>
      </div>
    </AppModal>
  );
}
