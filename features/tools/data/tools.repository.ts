import { apiFetch } from "@/lib/utils";
import type { AvailableTool, CompanyTool } from "@/lib/types";

export type CompanyToolUpsertInput = {
  is_enabled: boolean;
  custom_config: Record<string, unknown>;
};

export const toolsRepository = {
  listAvailable(category?: string) {
    return apiFetch<AvailableTool[]>(
      `/tools/available${category ? `?category=${category}` : ""}`,
    );
  },
  listCompany(companyId: string) {
    return apiFetch<CompanyTool[]>(`/tools/${companyId}`);
  },
  upsert(companyId: string, toolId: string, data: CompanyToolUpsertInput) {
    return apiFetch<CompanyTool>(`/tools/${companyId}/${toolId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};
