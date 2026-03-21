import { apiFetch } from "@/lib/utils";
import type { LLMModel } from "@/lib/types";

export const modelsRepository = {
  list(provider?: string) {
    return apiFetch<LLMModel[]>(
      `/models/${provider ? `?provider=${provider}` : ""}`,
    );
  },
};
