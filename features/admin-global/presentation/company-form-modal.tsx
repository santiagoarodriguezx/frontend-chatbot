"use client";

import { useEffect, useMemo, useState } from "react";
import { AppModal } from "@/components/app-modal";
import type {
  AdminCompanyCreateInput,
  AdminCompanyUpdateInput,
  Company,
} from "@/lib/types";

type CompanyFormModalProps = {
  open: boolean;
  company?: Company | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (
    payload: AdminCompanyCreateInput | AdminCompanyUpdateInput,
  ) => Promise<void>;
};

type CompanyDraft = {
  name: string;
  slug: string;
  whatsapp_number: string;
  whatsapp_instance_name: string;
  plan: Company["plan"];
  is_active: boolean;
};

const INITIAL_DRAFT: CompanyDraft = {
  name: "",
  slug: "",
  whatsapp_number: "",
  whatsapp_instance_name: "",
  plan: "free",
  is_active: true,
};

function toDraft(company?: Company | null): CompanyDraft {
  if (!company) {
    return INITIAL_DRAFT;
  }

  return {
    name: company.name,
    slug: company.slug,
    whatsapp_number: company.whatsapp_number ?? "",
    whatsapp_instance_name: company.whatsapp_instance_name ?? "",
    plan: company.plan,
    is_active: company.is_active,
  };
}

export function CompanyFormModal({
  open,
  company,
  saving,
  onClose,
  onSubmit,
}: CompanyFormModalProps) {
  const [draft, setDraft] = useState<CompanyDraft>(INITIAL_DRAFT);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(company);

  useEffect(() => {
    if (!open) return;
    setDraft(toDraft(company));
    setError(null);
  }, [company, open]);

  const title = useMemo(
    () => (isEditing ? "Editar empresa" : "Crear nueva empresa"),
    [isEditing],
  );

  function setField<K extends keyof CompanyDraft>(field: K, value: CompanyDraft[K]) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    const name = draft.name.trim();

    if (!name) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (!isEditing) {
      const slug = draft.slug.trim().toLowerCase();
      if (!slug) {
        setError("El slug es obligatorio.");
        return;
      }

      const payload: AdminCompanyCreateInput = {
        name,
        slug,
        plan: draft.plan,
        whatsapp_number: draft.whatsapp_number,
        whatsapp_instance_name: draft.whatsapp_instance_name,
      };

      await onSubmit(payload);
      return;
    }

    const payload: AdminCompanyUpdateInput = {
      name,
      plan: draft.plan,
      is_active: draft.is_active,
      whatsapp_number: draft.whatsapp_number,
      whatsapp_instance_name: draft.whatsapp_instance_name,
    };

    await onSubmit(payload);
  }

  return (
    <AppModal open={open} onClose={onClose} title={title} maxWidthClassName="max-w-lg">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Nombre</label>
          <input
            type="text"
            value={draft.name}
            onChange={(event) => setField("name", event.target.value)}
            className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            placeholder="Acme Corp"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Slug</label>
          <input
            type="text"
            value={draft.slug}
            onChange={(event) => setField("slug", event.target.value)}
            disabled={isEditing}
            className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:bg-neutral-100"
            placeholder="acme-corp"
          />
          {isEditing && (
            <p className="mt-1 text-[11px] text-neutral-400">El slug no se puede editar.</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Plan</label>
            <select
              value={draft.plan}
              onChange={(event) =>
                setField("plan", event.target.value as Company["plan"])
              }
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
            >
              <option value="free">free</option>
              <option value="pro">pro</option>
              <option value="business">business</option>
            </select>
          </div>

          {isEditing && (
            <label className="flex items-center gap-2 text-sm text-neutral-700 mt-6">
              <input
                type="checkbox"
                checked={draft.is_active}
                onChange={(event) => setField("is_active", event.target.checked)}
                className="accent-neutral-950"
              />
              Activa
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">WhatsApp número</label>
            <input
              type="text"
              value={draft.whatsapp_number}
              onChange={(event) => setField("whatsapp_number", event.target.value)}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="573001112233"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Instancia WhatsApp</label>
            <input
              type="text"
              value={draft.whatsapp_instance_name}
              onChange={(event) =>
                setField("whatsapp_instance_name", event.target.value)
              }
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="acme-main-instance"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-neutral-950 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear empresa"}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
        >
          Cancelar
        </button>
      </div>
    </AppModal>
  );
}
