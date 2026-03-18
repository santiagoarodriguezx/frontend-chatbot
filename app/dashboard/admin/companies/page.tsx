"use client";

import useSWR from "swr";
import { companiesApi } from "@/lib/api";
import type { Company } from "@/lib/types";

export default function AdminCompaniesPage() {
  const { data, isLoading, error } = useSWR<Company[]>("admin-companies", () =>
    companiesApi.list(),
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-950 tracking-tight">
          Admin · Empresas
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Vista global de todas las empresas registradas.
        </p>
      </div>

      {isLoading && (
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 text-sm text-neutral-500">
          Cargando empresas...
        </div>
      )}

      {error && (
        <div className="bg-red-50 rounded-2xl border border-red-200 p-4 text-sm text-red-700">
          No se pudieron cargar las empresas.
        </div>
      )}

      {!isLoading && !error && (
        <div className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left font-semibold text-neutral-700 px-4 py-3">
                  Nombre
                </th>
                <th className="text-left font-semibold text-neutral-700 px-4 py-3">
                  Slug
                </th>
                <th className="text-left font-semibold text-neutral-700 px-4 py-3">
                  Plan
                </th>
                <th className="text-left font-semibold text-neutral-700 px-4 py-3">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((company) => (
                <tr
                  key={company.id}
                  className="border-b border-neutral-100 last:border-b-0"
                >
                  <td className="px-4 py-3 text-neutral-900">{company.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{company.slug}</td>
                  <td className="px-4 py-3 text-neutral-600">{company.plan}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        company.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-neutral-200 text-neutral-700"
                      }`}
                    >
                      {company.is_active ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
