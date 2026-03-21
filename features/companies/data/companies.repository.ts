import { apiFetch } from "@/lib/utils";
import type { Company, CompanyBootstrap } from "@/lib/types";

export const companiesRepository = {
  list() {
    return apiFetch<Company[]>("/companies/");
  },
  bootstrap() {
    return apiFetch<CompanyBootstrap>("/companies/bootstrap");
  },
  getMine() {
    return apiFetch<Company>("/companies/me");
  },
  getById(id: string) {
    return apiFetch<Company>(`/companies/${id}`);
  },
  create(data: Partial<Company>) {
    return apiFetch<Company>("/companies/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update(id: string, data: Partial<Company>) {
    return apiFetch<Company>(`/companies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  getQRCode(id: string) {
    return apiFetch<{ qrcode: string }>(`/companies/${id}/instance/qrcode`);
  },
  getStatus(id: string) {
    return apiFetch<{ state: string }>(`/companies/${id}/instance/status`);
  },
};
