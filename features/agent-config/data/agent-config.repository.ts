import { agentApi } from "@/lib/api";
import type { AgentConfig } from "@/lib/types";

export const agentConfigRepository = {
  getByCompanyId(companyId: string) {
    return agentApi.get(companyId);
  },
  updateByCompanyId(companyId: string, payload: Partial<AgentConfig>) {
    return agentApi.update(companyId, payload);
  },
};
