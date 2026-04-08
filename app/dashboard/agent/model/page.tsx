"use client";
import useSWR, { mutate } from "swr";
import { useState } from "react";
import { agentApi, modelsApi } from "@/lib/api";
import { useCompany } from "@/lib/company-context";
import type { AgentConfig, LLMModel } from "@/lib/types";
import {
  Save,
  CheckCircle2,
  Cpu,
  Thermometer,
  AlertCircle,
} from "lucide-react";

export default function ModelPage() {
  const companyId = useCompany();
  const configKey = `agent-config-${companyId}`;

  const { data: config, error: configError } = useSWR<AgentConfig>(
    configKey,
    () => agentApi.get(companyId),
  );
  const { data: allModels, isLoading: loadingModels } = useSWR<LLMModel[]>(
    "llm-models",
    () => modelsApi.list(),
  );

  const [selectedProvider, setSelectedProvider] = useState<"openai" | "ollama">(
    config?.llm_provider ?? "openai",
  );
  const [selectedModel, setSelectedModel] = useState(config?.llm_model ?? "");
  const [temperature, setTemperature] = useState(
    config?.llm_temperature ?? 0.7,
  );
  const [maxTokens, setMaxTokens] = useState(config?.llm_max_tokens ?? 1024);
  const [ollamaUrl, setOllamaUrl] = useState(config?.ollama_base_url ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const modelsByProvider = (allModels ?? []).reduce<Record<string, LLMModel[]>>(
    (acc, m) => {
      acc[m.provider] = acc[m.provider] ?? [];
      acc[m.provider].push(m);
      return acc;
    },
    {},
  );

  const providers = Object.keys(modelsByProvider);
  const filteredModels = modelsByProvider[selectedProvider] ?? [];

  async function save() {
    setSaving(true);
    try {
      await agentApi.update(companyId, {
        llm_provider: selectedProvider,
        llm_model: selectedModel,
        llm_temperature: temperature,
        llm_max_tokens: maxTokens,
        ollama_base_url: selectedProvider === "ollama" ? ollamaUrl : undefined,
      });
      await mutate(configKey);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  if (loadingModels) {
    return (
      <div className="max-w-xl animate-fade-in">
        <div className="w-48 h-8 skeleton mb-8" />
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="w-24 h-4 skeleton mb-2" />
              <div className="w-full h-10 skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="max-w-xl animate-fade-in">
        <h1 className="text-3xl font-bold text-neutral-950 tracking-tight mb-8">
          LLM Model Settings
        </h1>
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-neutral-400" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-950 mb-2">
            No agent configured
          </h2>
          <p className="text-sm text-neutral-500">
            Create an agent configuration first before selecting a model.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-950 tracking-tight">
          LLM Model Settings
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Select the AI model that powers your agent
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 space-y-6 animate-fade-in-up">
        {/* Provider */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-3">
            <Cpu className="w-4 h-4" />
            Provider
          </label>
          <div className="flex gap-2">
            {providers.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setSelectedProvider(p as "openai" | "ollama");
                  setSelectedModel("");
                }}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedProvider === p
                    ? "bg-neutral-950 text-white shadow-lg"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Ollama URL */}
        {selectedProvider === "ollama" && (
          <div className="animate-fade-in">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Ollama Base URL
            </label>
            <input
              className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-shadow"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              placeholder="http://localhost:11434"
            />
          </div>
        )}

        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Model
          </label>
          <select
            className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-shadow bg-white"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <option value="">Select a model…</option>
            {filteredModels.map((m) => (
              <option key={m.id} value={m.model_id}>
                {m.model_name}
                {m.context_window
                  ? ` — ${(m.context_window / 1000).toFixed(0)}k ctx`
                  : ""}
                {m.supports_tools ? " ✓ tools" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Temperature */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
            <Thermometer className="w-4 h-4" />
            Temperature:{" "}
            <span className="font-bold text-neutral-950">{temperature}</span>
          </label>
          <input
            type="range"
            min={0}
            max={2}
            step={0.05}
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-neutral-950"
          />
          <div className="flex justify-between text-xs text-neutral-400 mt-1">
            <span>Precise (0)</span>
            <span>Creative (2)</span>
          </div>
        </div>

        {/* Max tokens */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Max Tokens
          </label>
          <input
            type="number"
            className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-shadow"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            min={64}
            max={8192}
          />
        </div>

        <button
          onClick={save}
          disabled={saving || !selectedModel}
          className="w-full flex items-center justify-center gap-2 bg-neutral-950 text-white py-3 rounded-xl font-medium hover:bg-neutral-800 disabled:opacity-50 transition-all duration-200"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving…
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Model Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
