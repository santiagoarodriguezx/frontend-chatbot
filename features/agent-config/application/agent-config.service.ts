import type { AgentConfig } from "@/lib/types";
import { agentConfigRepository } from "../data/agent-config.repository";

export type AgentConfigEditablePayload = Partial<
  Pick<
    AgentConfig,
    | "agent_name"
    | "welcome_message"
    | "fallback_message"
    | "working_hours"
    | "human_handoff_keyword"
    | "system_prompt"
    | "llm_provider"
    | "llm_model"
    | "llm_temperature"
    | "llm_max_tokens"
    | "ollama_base_url"
  >
>;

function removeUndefinedFields<T extends Record<string, unknown>>(
  payload: T,
): T {
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );
  return cleanPayload as T;
}

export const agentConfigService = {
  async getConfig(companyId: string): Promise<AgentConfig> {
    return agentConfigRepository.getByCompanyId(companyId);
  },

  async updateConfig(
    companyId: string,
    draft: AgentConfigEditablePayload,
  ): Promise<AgentConfig> {
    const payload = removeUndefinedFields({
      agent_name: draft.agent_name,
      welcome_message: draft.welcome_message,
      fallback_message: draft.fallback_message,
      working_hours: draft.working_hours,
      human_handoff_keyword: draft.human_handoff_keyword,
      system_prompt: draft.system_prompt,
      llm_provider: draft.llm_provider,
      llm_model: draft.llm_model,
      llm_temperature: draft.llm_temperature,
      llm_max_tokens: draft.llm_max_tokens,
      ollama_base_url: draft.ollama_base_url,
    });

    return agentConfigRepository.updateByCompanyId(companyId, payload);
  },
};
