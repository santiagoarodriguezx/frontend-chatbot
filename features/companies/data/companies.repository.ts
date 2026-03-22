import { apiFetch } from "@/lib/utils";
import type {
  Company,
  CompanyBootstrap,
  EvolutionInstanceCreateOut,
  EvolutionInstanceQrOut,
  EvolutionInstanceStatusOut,
} from "@/lib/types";

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
    return apiFetch<EvolutionInstanceQrOut>(`/companies/${id}/instance/qrcode`);
  },
  getStatus(id: string) {
    return apiFetch<EvolutionInstanceStatusOut>(`/companies/${id}/instance/status`);
  },
  createInstance(id: string) {
    return apiFetch<EvolutionInstanceCreateOut>(`/companies/${id}/instance/create`, {
      method: "POST",
    });
  },
};
