import { apiFetch } from "@/lib/utils";
import type {
  AdminOverview,
  AdminCompanyCreateInput,
  AdminCompanyUpdateInput,
  AdminUser,
  AdminUserCreateInput,
  AdminUserUpdateInput,
  Company,
} from "@/lib/types";

export const adminGlobalRepository = {
  getOverview() {
    return apiFetch<AdminOverview>("/admin/overview");
  },

  listCompanies() {
    return apiFetch<Company[]>("/companies/");
  },

  createCompany(payload: AdminCompanyCreateInput) {
    return apiFetch<Company>("/companies/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateCompany(companyId: string, payload: AdminCompanyUpdateInput) {
    return apiFetch<Company>(`/companies/${companyId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteCompany(companyId: string) {
    return apiFetch<void>(`/companies/${companyId}`, {
      method: "DELETE",
    });
  },

  listUsers() {
    return apiFetch<AdminUser[]>("/admin/users");
  },

  createUser(payload: AdminUserCreateInput) {
    return apiFetch<AdminUser>("/admin/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateUser(userId: string, payload: AdminUserUpdateInput) {
    return apiFetch<AdminUser>(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteUser(userId: string) {
    return apiFetch<void>(`/admin/users/${userId}`, {
      method: "DELETE",
    });
  },
};
