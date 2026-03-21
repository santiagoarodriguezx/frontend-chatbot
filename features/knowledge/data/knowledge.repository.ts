import { apiFetch } from "@/lib/utils";
import type { KnowledgeDoc } from "@/lib/types";

export const knowledgeRepository = {
  list(companyId: string) {
    return apiFetch<KnowledgeDoc[]>(`/knowledge/${companyId}`);
  },
  upload(companyId: string, file: File) {
    const form = new FormData();
    form.append("file", file);
    return apiFetch<{ message: string }>(`/knowledge/${companyId}/upload`, {
      method: "POST",
      body: form,
    });
  },
  delete(companyId: string, fileName: string) {
    return apiFetch<void>(`/knowledge/${companyId}/${encodeURIComponent(fileName)}`, {
      method: "DELETE",
    });
  },
};
