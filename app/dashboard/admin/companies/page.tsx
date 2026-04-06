"use client";

import useSWR from "swr";
import {
  AlertCircle,
  Activity,
  Building2,
  RefreshCcw,
  Shield,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { companiesApi } from "@/lib/api";
import type { Company, Order } from "@/lib/types";

const orders: Order[] = [];
// TODO: endpoint /api/admin/orders

export default function AdminGlobalPage() {
  const {
    data: companies,
    isLoading,
    error,
    mutate,
  } = useSWR<Company[]>("admin-companies", () => companiesApi.list());

  const companyList = companies ?? [];

  function refreshCompanies() {
    void mutate();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between font-sans">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">
            Administración de Infraestructura
          </h1>
          <p className="text-sm font-medium text-neutral-500">
            Control global de instancias y monitoreo de transacciones AURA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshCompanies}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Refrescar empresas
          </button>
          <div className="rounded-lg border border-neutral-200 bg-neutral-100 p-2">
            <Shield className="h-5 w-5 text-neutral-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 font-sans md:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Empresas Totales
          </p>
          <p className="text-2xl font-black text-neutral-900">
            {companyList.length}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Órdenes del Sistema
          </p>
          <p className="text-2xl font-black text-neutral-900">
            {orders.length}
          </p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
            Pendiente de endpoint global
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-sm">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            Estado API
          </p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-lg font-bold uppercase tracking-tighter text-white">
              Ready
            </p>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl border border-neutral-200/60 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/30 px-8 py-6">
          <h2 className="flex items-center gap-2 font-bold text-neutral-800">
            <Building2 className="h-4 w-4 text-neutral-400" />
            Directorio de Clientes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-100 bg-neutral-50 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              <tr>
                <th className="px-8 py-4">Empresa / ID</th>
                <th className="px-8 py-4">Plan Actual</th>
                <th className="px-8 py-4">WhatsApp</th>
                <th className="px-8 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-10 text-center text-neutral-400 italic"
                  >
                    Cargando empresas...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-10 text-center text-red-500 italic"
                  >
                    No se pudieron cargar las empresas.
                  </td>
                </tr>
              ) : companyList.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-10 text-center text-neutral-400 italic"
                  >
                    No hay datos de empresas vinculados.
                  </td>
                </tr>
              ) : (
                companyList.map((company) => (
                  <tr
                    key={company.id}
                    className="group transition-colors hover:bg-neutral-50/50"
                  >
                    <td className="px-8 py-5">
                      <p className="font-bold text-neutral-900 transition-colors group-hover:text-indigo-600">
                        {company.name}
                      </p>
                      <p className="font-mono text-[10px] tracking-tighter text-neutral-400">
                        ID: {company.id.slice(0, 8)}
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
                            company.is_active
                              ? "bg-emerald-500"
                              : "bg-neutral-300",
                          )}
                        />
                        <span className="text-xs font-medium text-neutral-600">
                          {company.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200/60 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2 text-neutral-800">
          <Activity className="h-5 w-5" />
          <h2 className="font-bold">Monitor de Pedidos Recientes</h2>
        </div>
        <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-xs text-neutral-500">
          <AlertCircle className="h-4 w-4" />
          Se requiere endpoint global de órdenes para habilitar esta sección sin
          disparar múltiples consultas por empresa.
        </div>
        {orders.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {orders.slice(0, 4).map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[9px] text-neutral-400">
                    #{order.id.slice(0, 6)}
                  </span>
                  <span className="text-xs font-black text-emerald-600">
                    ${order.total}
                  </span>
                </div>
                <p className="truncate text-sm font-bold text-neutral-800">
                  {order.customer_name || "Cliente"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="inline-flex items-center gap-2 text-xs text-neutral-400">
        <ShoppingCart className="h-3.5 w-3.5" />
        Esta vista ya consulta empresas reales. El agregado de órdenes queda
        pendiente del endpoint global.
      </div>
    </div>
  );
}
