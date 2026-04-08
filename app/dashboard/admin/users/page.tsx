"use client";

import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  CircleAlert,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
  Users,
} from "lucide-react";
import type {
  AdminUser,
  AdminUserCreateInput,
  AdminUserUpdateInput,
} from "@/lib/types";
import { useAdminUsers } from "@/features/admin-global/presentation/use-admin-users";
import { UserFormModal } from "@/features/admin-global/presentation/user-form-modal";

function isBackendPendingError(value: unknown): boolean {
  if (!(value instanceof Error)) {
    return false;
  }

  const message = value.message.toLowerCase();
  return message.includes("404") || message.includes("not found");
}

export default function AdminUsersPage() {
  const {
    users,
    isLoading,
    error,
    actionError,
    submitting,
    createUser,
    updateUser,
    deleteUser,
    refresh,
  } = useAdminUsers();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const pendingBackend = isBackendPendingError(error);

  const activeUsers = useMemo(
    () => users.filter((user) => user.is_active).length,
    [users],
  );

  function openCreateModal() {
    setEditingUser(null);
    setModalOpen(true);
  }

  function openEditModal(user: AdminUser) {
    setEditingUser(user);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingUser(null);
  }

  async function handleSubmit(payload: AdminUserCreateInput | AdminUserUpdateInput) {
    if (editingUser) {
      await updateUser(editingUser.id, payload as AdminUserUpdateInput);
    } else {
      await createUser(payload as AdminUserCreateInput);
    }

    closeModal();
  }

  async function handleDelete(user: AdminUser) {
    const accepted = confirm(
      `Se eliminará el usuario ${user.email}. Esta acción no se puede deshacer.`,
    );

    if (!accepted) {
      return;
    }

    await deleteUser(user.id);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">
            Administración de Usuarios
          </h1>
          <p className="text-sm font-medium text-neutral-500">
            Gestiona usuarios, roles y estado de acceso del sistema.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-900 bg-neutral-900 px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
          >
            <Plus className="h-3.5 w-3.5" />
            Nuevo usuario
          </button>
          <button
            type="button"
            onClick={() => {
              void refresh();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Refrescar
          </button>
        </div>
      </div>

      {(error || actionError) && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <CircleAlert className="h-4 w-4" />
          {actionError ?? "No se pudieron cargar los usuarios."}
        </div>
      )}

      {pendingBackend && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          El frontend ya está listo, pero faltan los endpoints de backend para /admin/users.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Usuarios Totales
          </p>
          <p className="text-2xl font-black text-neutral-900">{users.length}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Usuarios Activos
          </p>
          <p className="text-2xl font-black text-neutral-900">{activeUsers}</p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-sm">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            Usuarios Inactivos
          </p>
          <p className="text-2xl font-black text-white">{users.length - activeUsers}</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl border border-neutral-200/60 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/30 px-8 py-6">
          <h2 className="flex items-center gap-2 font-bold text-neutral-800">
            <Users className="h-4 w-4 text-neutral-400" />
            Directorio de Usuarios
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-100 bg-neutral-50 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              <tr>
                <th className="px-8 py-4">Email</th>
                <th className="px-8 py-4">Rol</th>
                <th className="px-8 py-4">Estado</th>
                <th className="px-8 py-4">Último acceso</th>
                <th className="px-8 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-neutral-400 italic">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-neutral-400 italic">
                    No hay usuarios para mostrar.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="group transition-colors hover:bg-neutral-50/50">
                    <td className="px-8 py-5">
                      <p className="font-semibold text-neutral-900">{user.email}</p>
                      <p className="text-[11px] text-neutral-400">{user.id}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="rounded-md border border-neutral-200 bg-neutral-100 px-2 py-1 text-[9px] font-black uppercase text-neutral-600">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`inline-flex items-center gap-2 text-xs font-medium ${
                          user.is_active ? "text-emerald-600" : "text-neutral-500"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            user.is_active ? "bg-emerald-500" : "bg-neutral-300"
                          }`}
                        />
                        {user.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-xs text-neutral-500">
                      {user.last_sign_in_at
                        ? formatDistanceToNow(new Date(user.last_sign_in_at), {
                            addSuffix: true,
                          })
                        : "Nunca"}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                          aria-label={`Editar ${user.email}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void handleDelete(user);
                          }}
                          disabled={submitting}
                          className="rounded-lg p-2 text-neutral-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          aria-label={`Borrar ${user.email}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <UserFormModal
        open={modalOpen}
        user={editingUser}
        saving={submitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
