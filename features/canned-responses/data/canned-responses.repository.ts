import { apiFetch } from "@/lib/utils";
import type { CannedResponse } from "@/lib/types";

export type CannedResponseCreateInput = {
  intent_key: string;
  intent_description: string;
  response_template: string;
  keywords: string[];
  is_enabled: boolean;
  priority: number;
};

export type CannedResponseUpdateInput = Partial<CannedResponseCreateInput>;

export const cannedResponsesRepository = {
  list(companyId: string) {
    return apiFetch<CannedResponse[]>(`/canned-responses/${companyId}`);
  },
  create(companyId: string, data: CannedResponseCreateInput) {
    return apiFetch<CannedResponse>(`/canned-responses/${companyId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update(companyId: string, responseId: string, data: CannedResponseUpdateInput) {
    return apiFetch<CannedResponse>(`/canned-responses/${companyId}/${responseId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete(companyId: string, responseId: string) {
    return apiFetch<void>(`/canned-responses/${companyId}/${responseId}`, {
      method: "DELETE",
    });
  },
};
