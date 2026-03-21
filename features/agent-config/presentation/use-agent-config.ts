import { useState } from "react";
import useSWR, { mutate } from "swr";
import type { AgentConfig } from "@/lib/types";
import {
  agentConfigService,
  type AgentConfigEditablePayload,
} from "../application/agent-config.service";

export function useAgentConfig(companyId: string) {
  const key = `agent-config-${companyId}`;
  const { data: config, isLoading, error } = useSWR<AgentConfig>(key, () =>
    agentConfigService.getConfig(companyId),
  );

  const [form, setForm] = useState<AgentConfigEditablePayload | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const current = form ?? config;

  function setField(field: keyof AgentConfig, value: unknown) {
    setForm((prev) => ({ ...(prev ?? config ?? {}), [field]: value }));
  }

  function setHours(day: string, value: string) {
    setForm((prev) => ({
      ...(prev ?? config ?? {}),
      working_hours: {
        ...((prev ?? config)?.working_hours ?? {}),
        [day]: value,
      },
    }));
  }

  async function save() {
    if (!form) return;

    setSaving(true);
    setSaveError(null);
    try {
      await agentConfigService.updateConfig(companyId, form);
      await mutate(key);
      setForm(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (errorValue) {
      setSaveError(
        errorValue instanceof Error ? errorValue.message : "Error al guardar",
      );
    } finally {
      setSaving(false);
    }
  }

  return {
    current,
    error,
    isLoading,
    save,
    saveError,
    saved,
    saving,
    setField,
    setHours,
  };
}
