"use client";
import useSWR, { mutate } from "swr";
import { dashboardApi } from "@/lib/api";
import { useCompany } from "@/lib/company-context";
import type { Order } from "@/lib/types";
import { format } from "date-fns";
import { ShoppingCart } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  preparing: "bg-violet-50 text-violet-700 border-violet-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-neutral-950 text-white border-neutral-950",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

export default function OrdersPage() {
  const companyId = useCompany();
  const key = `orders-${companyId}`;
  const { data: orders, isLoading } = useSWR<Order[]>(key, () =>
    dashboardApi.orders(companyId),
  );

  async function updateStatus(orderId: string, status: string) {
    await dashboardApi.updateOrderStatus(companyId, orderId, status);
    await mutate(key);
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-950 tracking-tight">
          Ordenes
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Sigue y gestiona los pedidos realizados por tus clientes a través de
          tu agente.
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 py-4">
              <div className="w-16 h-4 skeleton" />
              <div className="w-24 h-4 skeleton" />
              <div className="w-12 h-4 skeleton" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden animate-fade-in-up">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                {[
                  "Orden",
                  "Cliente",
                  "Productos",
                  "Total",
                  "Estado",
                  "Fecha",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {(orders ?? []).map((o) => (
                <tr
                  key={o.id}
                  className="hover:bg-neutral-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5 font-mono text-xs text-neutral-400">
                    {o.id.slice(0, 8)}…
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-neutral-950">
                      {o.customer_name ?? "—"}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {o.customer_phone}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-neutral-500">
                    {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-neutral-950">
                    ${o.total.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        STATUS_STYLES[o.status] ??
                        "bg-neutral-100 text-neutral-500 border-neutral-200"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-neutral-400 text-xs">
                    {format(new Date(o.created_at), "MMM dd, HH:mm")}
                  </td>
                  <td className="px-5 py-3.5">
                    <select
                      className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-neutral-950 transition-shadow bg-white"
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                    >
                      {[
                        "pending",
                        "confirmed",
                        "preparing",
                        "shipped",
                        "delivered",
                        "cancelled",
                      ].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(orders ?? []).length === 0 && (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-7 h-7 text-neutral-300" />
              </div>
              <p className="text-neutral-500 text-sm">
                Todavia no hay ordenes.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
