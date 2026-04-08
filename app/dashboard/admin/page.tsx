"use client";

import Link from "next/link";
import {
  BarChart3,
  Building2,
  CircleAlert,
  RefreshCcw,
  ShieldCheck,
  Users,
  Wifi,
} from "lucide-react";
import { useAdminOverview } from "@/features/admin-global/presentation/use-admin-overview";

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: number;
  hint: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          {title}
        </p>
        <div className="rounded-lg bg-neutral-100 p-2">
          <Icon className="h-4 w-4 text-neutral-500" />
        </div>
      </div>
      <p className="text-2xl font-black tracking-tight text-neutral-900">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{hint}</p>
    </div>
  );
}

export default function AdminOverviewPage() {
  const { overview, error, isLoading, isValidating, refresh } = useAdminOverview();

  const recentCompanies = overview?.recent_companies ?? [];
  const plans = overview?.companies_by_plan ?? {};

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">
            Global Admin Dashboard
          </h1>
          <p className="text-sm font-medium text-neutral-500">
            Supervisa operación, empresas e instancias de todo el sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            void refresh();
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${isValidating ? "animate-spin" : ""}`} />
          {isValidating ? "Actualizando..." : "Refrescar"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <CircleAlert className="h-4 w-4" />
          No se pudo cargar el overview global.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Empresas totales"
          value={overview?.total_companies ?? 0}
          hint="Total registradas"
          icon={Building2}
        />
        <StatCard
          title="Empresas activas"
          value={overview?.active_companies ?? 0}
          hint="Con operación habilitada"
          icon={ShieldCheck}
        />
        <StatCard
          title="Instancias conectadas"
          value={overview?.connected_instances ?? 0}
          hint="WhatsApp online"
          icon={Wifi}
        />
        <StatCard
          title="Instancias desconectadas"
          value={overview?.disconnected_instances ?? 0}
          hint="Requieren atención"
          icon={BarChart3}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="overflow-hidden rounded-3xl border border-neutral-200/60 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/40 px-6 py-5">
            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500">
              Empresas Recientes
            </h2>
            <Link
              href="/dashboard/admin/companies"
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-900"
            >
              Ver todas
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-100 bg-neutral-50 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                <tr>
                  <th className="px-6 py-3">Empresa</th>
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-neutral-400">
                      Cargando...
                    </td>
                  </tr>
                ) : recentCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-neutral-400">
                      No hay empresas para mostrar.
                    </td>
                  </tr>
                ) : (
                  recentCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-neutral-50/60">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-neutral-900">{company.name}</p>
                        <p className="text-[11px] text-neutral-400">{company.slug}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-md border border-neutral-200 bg-neutral-100 px-2 py-1 text-[10px] font-bold uppercase text-neutral-600">
                          {company.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 text-xs font-medium ${
                            company.is_active ? "text-emerald-600" : "text-neutral-500"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              company.is_active ? "bg-emerald-500" : "bg-neutral-300"
                            }`}
                          />
                          {company.is_active ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200/60 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-neutral-500">
            Distribución por plan
          </h2>
          <div className="space-y-3">
            {Object.keys(plans).length === 0 ? (
              <p className="text-sm text-neutral-400">Sin datos de planes.</p>
            ) : (
              Object.entries(plans).map(([plan, count]) => (
                <div
                  key={plan}
                  className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2"
                >
                  <span className="text-xs font-semibold uppercase text-neutral-600">{plan}</span>
                  <span className="text-sm font-black text-neutral-900">{count}</span>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <Link
              href="/dashboard/admin/companies"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              <Building2 className="h-3.5 w-3.5" />
              Gestionar Empresas
            </Link>
            <Link
              href="/dashboard/admin/users"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              <Users className="h-3.5 w-3.5" />
              Gestionar Usuarios
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
