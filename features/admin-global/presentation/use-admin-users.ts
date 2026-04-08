import { useState } from "react";
import useSWR from "swr";
import type {
  AdminUser,
  AdminUserCreateInput,
  AdminUserUpdateInput,
} from "@/lib/types";
import { adminGlobalService } from "../application/admin-global.service";

export function useAdminUsers() {
  const key = "admin-users";

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<AdminUser[]>(key, () => adminGlobalService.listUsers());

  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function createUser(payload: AdminUserCreateInput) {
    setSubmitting(true);
    setActionError(null);

    try {
      await adminGlobalService.createUser(payload);
      await mutate();
    } catch (value) {
      setActionError(
        value instanceof Error ? value.message : "No se pudo crear el usuario",
      );
      throw value;
    } finally {
      setSubmitting(false);
    }
  }

  async function updateUser(userId: string, payload: AdminUserUpdateInput) {
    setSubmitting(true);
    setActionError(null);

    try {
      await adminGlobalService.updateUser(userId, payload);
      await mutate();
    } catch (value) {
      setActionError(
        value instanceof Error
          ? value.message
          : "No se pudo actualizar el usuario",
      );
      throw value;
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteUser(userId: string) {
    setSubmitting(true);
    setActionError(null);

    try {
      await adminGlobalService.deleteUser(userId);
      await mutate();
    } catch (value) {
      setActionError(
        value instanceof Error ? value.message : "No se pudo borrar el usuario",
      );
      throw value;
    } finally {
      setSubmitting(false);
    }
  }

  async function refresh() {
    setActionError(null);
    await mutate();
  }

  return {
    users: data ?? [],
    error,
    isLoading,
    isValidating,
    actionError,
    submitting,
    createUser,
    updateUser,
    deleteUser,
    refresh,
  };
}
