"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { AdminCompaniesPanel } from "@/features/admin-global/presentation/admin-companies-panel";
import { AdminUsersPanel } from "@/features/admin-global/presentation/admin-users-panel";

type AdminSection = "empresas" | "usuarios";

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

function resolveSection(value: string | null): AdminSection {
  if (value === "usuarios") {
    return "usuarios";
  }
  return "empresas";
}

export default function AdminOverviewPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { overview, error, isValidating, refresh } = useAdminOverview();

  const section = useMemo(
    () => resolveSection(searchParams.get("seccion")),
    [searchParams],
  );

  function setSection(nextSection: AdminSection) {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("seccion", nextSection);
    router.replace(`${pathname}?${nextParams.toString()}`);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">
            Administrador Global
          </h1>
          <p className="text-sm font-medium text-neutral-500">
            Gestiona empresas, usuarios y operación global desde un único panel.
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
          No se pudo cargar el resumen global.
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
          hint="WhatsApp en línea"
          icon={Wifi}
        />
        <StatCard
          title="Instancias desconectadas"
          value={overview?.disconnected_instances ?? 0}
          hint="Requieren revisión"
          icon={BarChart3}
        />
      </div>

      <section className="rounded-3xl border border-neutral-200/60 bg-white p-2 shadow-sm">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setSection("empresas")}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              section === "empresas"
                ? "bg-neutral-950 text-white"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Gestión de Empresas
          </button>

          <button
            type="button"
            onClick={() => setSection("usuarios")}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              section === "usuarios"
                ? "bg-neutral-950 text-white"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            <Users className="h-4 w-4" />
            Administración de Usuarios
          </button>
        </div>
      </section>

      {section === "empresas" ? <AdminCompaniesPanel /> : <AdminUsersPanel />}
    </div>
  );
}
