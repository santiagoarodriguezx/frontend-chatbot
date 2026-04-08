"use client";
import { useCompany } from "@/lib/company-context";
import { useAgentConfig } from "@/features/agent-config/presentation/use-agent-config";
import { useCannedResponses } from "@/features/canned-responses/presentation/use-canned-responses";
import { AppModal } from "@/components/app-modal";
import Link from "next/link";
import {
  Bot,
  Clock,
  Save,
  CheckCircle2,
  Settings2,
  AlertCircle,
  MessageSquareText,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_LABELS: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export default function AgentPage() {
  const companyId = useCompany();

  const {
    current,
    setField,
    setHours,
    save,
    saveError,
    saved,
    saving,
    isLoading,
    error,
  } = useAgentConfig(companyId);
  const {
    responses,
    form,
    setField: setCannedField,
    submit: submitCanned,
    remove: deleteCanned,
    startEdit,
    openCreate,
    closeModal,
    editingId,
    submitting,
    formError,
    isLoading: loadingCanned,
    isModalOpen,
  } = useCannedResponses(companyId);

  if (isLoading) {
    return (
      <div className="max-w-2xl animate-fade-in">
        <div className="w-48 h-8 skeleton mb-8" />
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <div className="w-24 h-4 skeleton mb-2" />
              <div className="w-full h-10 skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !current) {
    return (
      <div className="max-w-2xl animate-fade-in">
        <h1 className="text-3xl font-bold text-neutral-950 tracking-tight mb-8">
          Agent Configuration
        </h1>
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-neutral-400" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-950 mb-2">
            No agent configured
          </h2>
          <p className="text-sm text-neutral-500 mb-6 max-w-sm mx-auto">
            There is no agent configuration for this company yet. Make sure the
            database has been seeded with an initial config.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-950 tracking-tight">
            Agent Configuration
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Customize how your AI agent behaves
          </p>
        </div>
        <Link
          href="/dashboard/agent/model"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
        >
          <Settings2 className="w-4 h-4" />
          LLM Model
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 space-y-6 animate-fade-in-up">
        {/* Agent Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
            <Bot className="w-4 h-4" />
            Agent Name
          </label>
          <input
            className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-shadow"
            value={current.agent_name ?? ""}
            onChange={(e) => setField("agent_name", e.target.value)}
          />
        </div>

        {/* Fallback Message */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Fallback Message
          </label>
          <textarea
            className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-shadow resize-none"
            rows={2}
            value={current.fallback_message ?? ""}
            onChange={(e) => setField("fallback_message", e.target.value)}
          />
        </div>

        {/* System Prompt */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            System Prompt
          </label>
          <textarea
            className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-shadow resize-none"
            rows={6}
            value={current.system_prompt ?? ""}
            onChange={(e) => setField("system_prompt", e.target.value)}
          />
        </div>

        {/* Human Handoff */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Human Handoff Keyword
          </label>
          <input
            className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-shadow"
            value={current.human_handoff_keyword ?? ""}
            onChange={(e) => setField("human_handoff_keyword", e.target.value)}
            placeholder="e.g. human, agent, support"
          />
        </div>

        {/* Working Hours */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-3">
            <Clock className="w-4 h-4" />
            Working Hours
          </label>
          <div className="space-y-2">
            {DAYS.map((day) => (
              <div key={day} className="flex items-center gap-3">
                <span className="w-20 text-xs font-medium text-neutral-500">
                  {DAY_LABELS[day]}
                </span>
                <input
                  className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-shadow"
                  placeholder="08:00-18:00"
                  value={(current.working_hours?.[day] as string) ?? ""}
                  onChange={(e) => setHours(day, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving}
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
              Save Changes
            </>
          )}
        </button>

        {saveError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {saveError}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 space-y-5 mt-6 animate-fade-in-up">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-neutral-950 flex items-center gap-2">
              <MessageSquareText className="w-5 h-5" />
              Canned Responses
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Configura respuestas predefinidas por intención.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="px-3 py-2 text-xs rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar
          </button>
        </div>

        <div className="space-y-3 pt-1">
          {loadingCanned ? (
            <div className="text-sm text-neutral-500">
              Cargando canned responses...
            </div>
          ) : responses.length === 0 ? (
            <div className="text-sm text-neutral-500 border border-dashed border-neutral-200 rounded-xl p-4">
              Aún no hay canned responses configuradas.
            </div>
          ) : (
            responses.map((item) => (
              <div
                key={item.id}
                className="border border-neutral-200 rounded-xl p-4 flex items-start justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-950">
                    {item.intent_key}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {item.intent_description}
                  </p>
                  <p className="text-sm text-neutral-700 mt-2">
                    {item.response_template}
                  </p>
                  <div className="text-xs text-neutral-500 mt-2">
                    Priority: {item.priority} •{" "}
                    {item.is_enabled ? "Enabled" : "Disabled"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="px-2.5 py-2 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    aria-label="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCanned(item.id)}
                    className="px-2.5 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AppModal
        open={isModalOpen}
        onClose={closeModal}
        title={editingId ? "Editar canned response" : "Agregar canned response"}
        maxWidthClassName="max-w-2xl"
      >
        <div className="space-y-5">
          <p className="text-sm text-neutral-500">
            Define intención, template y palabras clave.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Intent Key
              </label>
              <input
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-shadow"
                value={form.intent_key}
                onChange={(e) => setCannedField("intent_key", e.target.value)}
                placeholder="faq_shipping"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Priority
              </label>
              <input
                type="number"
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-shadow"
                value={form.priority}
                onChange={(e) =>
                  setCannedField("priority", Number(e.target.value))
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Intent Description
            </label>
            <input
              className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-shadow"
              value={form.intent_description}
              onChange={(e) =>
                setCannedField("intent_description", e.target.value)
              }
              placeholder="Preguntas sobre envío"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Response Template
            </label>
            <textarea
              rows={3}
              className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-shadow resize-none"
              value={form.response_template}
              onChange={(e) =>
                setCannedField("response_template", e.target.value)
              }
              placeholder="¡Claro! El tiempo de entrega estimado es..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Keywords (separadas por coma)
              </label>
              <input
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-shadow"
                value={form.keywords_text}
                onChange={(e) =>
                  setCannedField("keywords_text", e.target.value)
                }
                placeholder="envío, entrega, shipping"
              />
            </div>

            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={form.is_enabled}
                  onChange={(e) =>
                    setCannedField("is_enabled", e.target.checked)
                  }
                  className="rounded border-neutral-300"
                />
                Enabled
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={submitCanned}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-neutral-950 text-white py-3 rounded-xl font-medium hover:bg-neutral-800 disabled:opacity-50 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            {submitting
              ? "Guardando..."
              : editingId
                ? "Actualizar canned response"
                : "Agregar canned response"}
          </button>

          {formError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {formError}
            </div>
          )}
        </div>
      </AppModal>
    </div>
  );
}
