"use client";

import { useState } from "react";
import {
  Building2,
  CircleAlert,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AdminCompanyCreateInput,
  AdminCompanyUpdateInput,
  Company,
} from "@/lib/types";
import { useAdminCompanies } from "@/features/admin-global/presentation/use-admin-companies";
import { CompanyFormModal } from "@/features/admin-global/presentation/company-form-modal";

export function AdminCompaniesPanel() {
  const {
    companies,
    isLoading,
    error,
    actionError,
    submitting,
    createCompany,
    updateCompany,
    deleteCompany,
    refresh,
  } = useAdminCompanies();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const activeCompanies = companies.filter((company) => company.is_active).length;
  const inactiveCompanies = companies.length - activeCompanies;

  function openCreateModal() {
    setEditingCompany(null);
    setModalOpen(true);
  }

  function openEditModal(company: Company) {
    setEditingCompany(company);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingCompany(null);
  }

  async function handleSubmit(
    payload: AdminCompanyCreateInput | AdminCompanyUpdateInput,
  ) {
    if (editingCompany) {
      await updateCompany(editingCompany.id, payload as AdminCompanyUpdateInput);
    } else {
      await createCompany(payload as AdminCompanyCreateInput);
    }

    closeModal();
  }

  async function handleDelete(company: Company) {
    const accepted = confirm(
      `Se eliminará la empresa ${company.name}. Esta acción no se puede deshacer.`,
    );

    if (!accepted) {
      return;
    }

    await deleteCompany(company.id);
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-neutral-900">
            Gestión de Empresas
          </h2>
          <p className="text-sm font-medium text-neutral-500">
            Crea, actualiza y elimina empresas desde el panel global.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-900 bg-neutral-900 px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
          >
            <Plus className="h-3.5 w-3.5" />
            Nueva empresa
          </button>
          <button
            type="button"
            onClick={() => {
              void refresh();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Refrescar
          </button>
        </div>
      </div>

      {(error || actionError) && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <CircleAlert className="h-4 w-4" />
          {actionError ?? "No se pudieron cargar las empresas."}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Empresas Totales
          </p>
          <p className="text-2xl font-black text-neutral-900">{companies.length}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Empresas Activas
          </p>
          <p className="text-2xl font-black text-neutral-900">{activeCompanies}</p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-sm">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            Empresas Inactivas
          </p>
          <p className="text-2xl font-black text-white">{inactiveCompanies}</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl border border-neutral-200/60 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/30 px-8 py-6">
          <h3 className="flex items-center gap-2 font-bold text-neutral-800">
            <Building2 className="h-4 w-4 text-neutral-400" />
            Directorio de Empresas
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-100 bg-neutral-50 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              <tr>
                <th className="px-8 py-4">Empresa / ID</th>
                <th className="px-8 py-4">Plan</th>
                <th className="px-8 py-4">WhatsApp</th>
                <th className="px-8 py-4">Estado</th>
                <th className="px-8 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-neutral-400 italic">
                    Cargando empresas...
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-neutral-400 italic">
                    No hay empresas registradas.
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.id} className="group transition-colors hover:bg-neutral-50/50">
                    <td className="px-8 py-5">
                      <p className="font-bold text-neutral-900 transition-colors group-hover:text-indigo-600">
                        {company.name}
                      </p>
                      <p className="font-mono text-[10px] tracking-tighter text-neutral-400">
                        {company.id}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="rounded-md border border-neutral-200 bg-neutral-100 px-2 py-1 text-[9px] font-black uppercase text-neutral-600">
                        {company.plan}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-mono text-xs text-neutral-500">
                      {company.whatsapp_number || "---"}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            company.is_active ? "bg-emerald-500" : "bg-neutral-300",
                          )}
                        />
                        <span className="text-xs font-medium text-neutral-600">
                          {company.is_active ? "Activa" : "Inactiva"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(company)}
                          className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                          aria-label={`Editar ${company.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void handleDelete(company);
                          }}
                          disabled={submitting}
                          className="rounded-lg p-2 text-neutral-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          aria-label={`Borrar ${company.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <CompanyFormModal
        open={modalOpen}
        company={editingCompany}
        saving={submitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
