"use client";
import useSWR, { mutate } from "swr";
import { dashboardApi } from "@/lib/api";
import { useCompany } from "@/lib/company-context";
import type { Appointment } from "@/lib/types";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { API_URL } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-neutral-950 text-white border-neutral-950",
  cancelled: "bg-red-50 text-red-600 border-red-200",
  completed: "bg-neutral-100 text-neutral-500 border-neutral-200",
};

export default function AppointmentsPage() {
  const companyId = useCompany();
  const key = `appointments-${companyId}`;
  const { data: appointments, isLoading } = useSWR<Appointment[]>(key, () =>
    dashboardApi.appointments(companyId),
  );

  async function updateStatus(id: string, status: string) {
    await fetch(
      `${API_URL}/dashboard/${companyId}/appointments/${id}/status?status=${status}`,
      { method: "PATCH" },
    );
    await mutate(key);
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-950 tracking-tight">
          Appointments
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage scheduled customer appointments
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 py-4">
              <div className="w-20 h-4 skeleton" />
              <div className="w-28 h-4 skeleton" />
              <div className="w-16 h-4 skeleton" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden animate-fade-in-up">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                {[
                  "Customer",
                  "Service",
                  "Date & Time",
                  "Duration",
                  "Status",
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
              {(appointments ?? []).map((a) => (
                <tr
                  key={a.id}
                  className="hover:bg-neutral-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-neutral-950">
                      {a.customer_name ?? "—"}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {a.customer_phone}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-neutral-700">
                    {a.service_name}
                  </td>
                  <td className="px-5 py-3.5 text-neutral-600">
                    {format(new Date(a.datetime), "MMM dd, yyyy HH:mm")}
                  </td>
                  <td className="px-5 py-3.5 text-neutral-500">
                    {a.duration_minutes} min
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        STATUS_STYLES[a.status] ??
                        "bg-neutral-100 text-neutral-500 border-neutral-200"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <select
                      className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-neutral-950 transition-shadow bg-white"
                      value={a.status}
                      onChange={(e) => updateStatus(a.id, e.target.value)}
                    >
                      {["pending", "confirmed", "cancelled", "completed"].map(
                        (s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ),
                      )}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(appointments ?? []).length === 0 && (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-neutral-300" />
              </div>
              <p className="text-neutral-500 text-sm">No appointments yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
