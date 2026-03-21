import { apiFetch } from "@/lib/utils";
import type { AgentConfig } from "@/lib/types";

export const agentConfigRepository = {
  getByCompanyId(companyId: string) {
    return apiFetch<AgentConfig>(`/agent-config/${companyId}`);
  },
  updateByCompanyId(companyId: string, payload: Partial<AgentConfig>) {
    return apiFetch<AgentConfig>(`/agent-config/${companyId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
