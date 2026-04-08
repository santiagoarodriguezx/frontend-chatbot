import { useState } from "react";
import useSWR from "swr";
import type {
  AdminCompanyCreateInput,
  AdminCompanyUpdateInput,
  Company,
} from "@/lib/types";
import { adminGlobalService } from "../application/admin-global.service";

export function useAdminCompanies() {
  const key = "admin-companies";

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<Company[]>(key, () => adminGlobalService.listCompanies());

  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function createCompany(payload: AdminCompanyCreateInput) {
    setSubmitting(true);
    setActionError(null);

    try {
      await adminGlobalService.createCompany(payload);
      await mutate();
    } catch (value) {
      setActionError(
        value instanceof Error ? value.message : "No se pudo crear la empresa",
      );
      throw value;
    } finally {
      setSubmitting(false);
    }
  }

  async function updateCompany(companyId: string, payload: AdminCompanyUpdateInput) {
    setSubmitting(true);
    setActionError(null);

    try {
      await adminGlobalService.updateCompany(companyId, payload);
      await mutate();
    } catch (value) {
      setActionError(
        value instanceof Error
          ? value.message
          : "No se pudo actualizar la empresa",
      );
      throw value;
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteCompany(companyId: string) {
    setSubmitting(true);
    setActionError(null);

    try {
      await adminGlobalService.deleteCompany(companyId);
      await mutate();
    } catch (value) {
      setActionError(
        value instanceof Error ? value.message : "No se pudo borrar la empresa",
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
    companies: data ?? [],
    error,
    isLoading,
    isValidating,
    actionError,
    submitting,
    createCompany,
    updateCompany,
    deleteCompany,
    refresh,
  };
}
