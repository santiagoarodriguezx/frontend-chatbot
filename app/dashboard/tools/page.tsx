"use client";
import useSWR, { mutate } from "swr";
import { useState } from "react";
import { toolsApi } from "@/lib/api";
import { useCompany } from "@/lib/company-context";
import type { AvailableTool, CompanyTool } from "@/lib/types";
import { Wrench, Save } from "lucide-react";

function DynamicConfigForm({
  tool,
  existingConfig,
  onSave,
}: {
  tool: AvailableTool;
  existingConfig: Record<string, unknown>;
  onSave: (config: Record<string, unknown>) => void;
}) {
  const schema = tool.tool_parameters_schema as {
    properties?: Record<
      string,
      { type?: string; description?: string; default?: unknown }
    >;
  };
  const props = schema.properties ?? {};
  const [values, setValues] = useState<Record<string, unknown>>(existingConfig);

  if (Object.keys(props).length === 0) return null;

  return (
    <div className="mt-4 pl-4 border-l-2 border-neutral-200 space-y-3 animate-fade-in">
      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
        Configuration
      </p>
      {Object.entries(props).map(([key, prop]) => (
        <div key={key}>
          <label className="block text-xs text-neutral-500 mb-1 capitalize">
            {key.replace(/_/g, " ")}
            {prop.description ? ` — ${prop.description}` : ""}
          </label>
          <input
            className="border border-neutral-200 rounded-lg px-3 py-1.5 text-xs w-full focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-shadow"
            value={String(values[key] ?? prop.default ?? "")}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, [key]: e.target.value }))
            }
          />
        </div>
      ))}
      <button
        className="flex items-center gap-1.5 text-xs bg-neutral-950 text-white px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
        onClick={() => onSave(values)}
      >
        <Save className="w-3 h-3" />
        Save config
      </button>
    </div>
  );
}

export default function ToolsPage() {
  const companyId = useCompany();
  const availableKey = "tools-available";
  const companyKey = `tools-company-${companyId}`;

  const { data: available } = useSWR<AvailableTool[]>(availableKey, () =>
    toolsApi.listAvailable(),
  );
  const { data: companyTools } = useSWR<CompanyTool[]>(companyKey, () =>
    toolsApi.listCompany(companyId),
  );

  const enabledMap = new Map(
    (companyTools ?? []).map((ct) => [ct.tool_id, ct]),
  );

  const categories: Record<string, AvailableTool[]> = {};
  for (const t of available ?? []) {
    categories[t.category] = categories[t.category] ?? [];
    categories[t.category].push(t);
  }

  async function toggleTool(tool: AvailableTool, enabled: boolean) {
    const existing = enabledMap.get(tool.id);
    await toolsApi.upsert(companyId, tool.id, {
      is_enabled: enabled,
      custom_config: (existing?.custom_config as Record<string, unknown>) ?? {},
    });
    await mutate(companyKey);
  }

  async function saveConfig(
    tool: AvailableTool,
    config: Record<string, unknown>,
  ) {
    await toolsApi.upsert(companyId, tool.id, {
      is_enabled: true,
      custom_config: config,
    });
    await mutate(companyKey);
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-950 tracking-tight">
          Tools
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Habilita y configura las herramientas que tu agente puede usar para
          asistir a los clientes.
        </p>
      </div>

      {Object.entries(categories).map(([category, tools], catIdx) => (
        <div
          key={category}
          className="mb-8 animate-fade-in-up"
          style={{ animationDelay: `${catIdx * 100}ms` }}
        >
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
            {category}
          </h2>
          <div className="bg-white rounded-2xl border border-neutral-200/60 divide-y divide-neutral-100">
            {tools.map((tool) => {
              const ct = enabledMap.get(tool.id);
              const isEnabled = ct?.is_enabled ?? false;

              return (
                <div key={tool.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1">
                      <div
                        className={`p-2 rounded-xl transition-colors duration-200 ${isEnabled ? "bg-neutral-950" : "bg-neutral-100"}`}
                      >
                        <Wrench
                          className={`w-4 h-4 transition-colors duration-200 ${isEnabled ? "text-white" : "text-neutral-400"}`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-950 text-sm">
                          {tool.tool_name}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {tool.tool_description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleTool(tool, !isEnabled)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ${
                        isEnabled ? "bg-neutral-950" : "bg-neutral-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${
                          isEnabled ? "translate-x-[22px]" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  {isEnabled && (
                    <DynamicConfigForm
                      tool={tool}
                      existingConfig={
                        (ct?.custom_config as Record<string, unknown>) ?? {}
                      }
                      onSave={(cfg) => saveConfig(tool, cfg)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {Object.keys(categories).length === 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-7 h-7 text-neutral-300" />
          </div>
          <p className="text-neutral-500 text-sm">No tools available</p>
        </div>
      )}
    </div>
  );
}
