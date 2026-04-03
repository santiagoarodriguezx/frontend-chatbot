"use client";

import useSWR from "swr";
import { dashboardApi } from "@/lib/api";
import { useCompany } from "@/lib/company-context";
import type { CompanyMetricsDaily, CompanyMetricsGeneral } from "@/lib/types";
import {
  Activity,
  AlertTriangle,
  Bot,
  Gauge,
  MessageSquareText,
  TrendingUp,
  Wrench,
} from "lucide-react";

function MetricCard({
  title,
  value,
  icon: Icon,
  index,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  index: number;
}) {
  return (
    <div
      className="group relative bg-white rounded-2xl border border-neutral-200/60 p-6 hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-200/50 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-neutral-100 group-hover:bg-neutral-950 group-hover:text-white transition-colors duration-300">
          <Icon className="w-5 h-5" />
        </div>
        <TrendingUp className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
      </div>
      <p className="text-sm font-medium text-neutral-500 mb-1">{title}</p>
      <p className="text-3xl font-bold text-neutral-950 tracking-tight">{value}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
      <div className="w-10 h-10 skeleton mb-4" />
      <div className="w-24 h-4 skeleton mb-2" />
      <div className="w-32 h-8 skeleton" />
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleString();
}

export default function MetricsPage() {
  const companyId = useCompany();
  const days = 7;

  const {
    data: general,
    isLoading: loadingGeneral,
    error: generalError,
  } = useSWR<CompanyMetricsGeneral>(
    companyId ? ["metrics-general", companyId] : null,
    () => dashboardApi.metricsGeneral(companyId),
  );

  const {
    data: daily,
    isLoading: loadingDaily,
    error: dailyError,
  } = useSWR<CompanyMetricsDaily[]>(
    companyId ? ["metrics-daily", companyId, days] : null,
    () => dashboardApi.metricsDaily(companyId, days),
  );

  const isLoading = loadingGeneral || loadingDaily;
  const hasError = Boolean(generalError || dailyError);

  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-neutral-950 tracking-tight">
          Metrics
        </h1>
        <p className="text-neutral-500 mt-1 text-sm">
          Performance and reliability insights for your AI agent
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : hasError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          No se pudieron cargar las metricas. Verifica que el backend este
          disponible y que la sesion este activa.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            <MetricCard
              title="Total Interactions"
              value={general?.total_interactions ?? 0}
              icon={MessageSquareText}
              index={0}
            />
            <MetricCard
              title="Avg Response (ms)"
              value={general?.avg_response_ms ?? 0}
              icon={Gauge}
              index={1}
            />
            <MetricCard
              title="P95 Response (ms)"
              value={general?.p95_response_ms ?? 0}
              icon={Activity}
              index={2}
            />
            <MetricCard
              title="With Tools"
              value={general?.with_tools ?? 0}
              icon={Wrench}
              index={3}
            />
            <MetricCard
              title="Fallbacks"
              value={general?.fallbacks ?? 0}
              icon={Bot}
              index={4}
            />
            <MetricCard
              title="Errors"
              value={general?.errors ?? 0}
              icon={AlertTriangle}
              index={5}
            />
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 mb-8 animate-fade-in-up">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400 mb-3">
              Activity Window
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-neutral-200/80 bg-neutral-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-neutral-500">
                  First Seen
                </p>
                <p className="text-sm font-medium text-neutral-900 mt-1">
                  {formatDate(general?.first_seen_at ?? null)}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-200/80 bg-neutral-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-neutral-500">
                  Last Seen
                </p>
                <p className="text-sm font-medium text-neutral-900 mt-1">
                  {formatDate(general?.last_seen_at ?? null)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-950">
                Daily Metrics
              </h2>
              <span className="text-xs font-medium text-neutral-500 rounded-full border border-neutral-200 px-2.5 py-1">
                Last {days} days
              </span>
            </div>

            {(daily ?? []).length === 0 ? (
              <p className="text-sm text-neutral-500">
                No hay metricas diarias para este rango.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-500 text-left">
                      <th className="py-2 pr-4 font-medium">Date</th>
                      <th className="py-2 pr-4 font-medium">Interactions</th>
                      <th className="py-2 pr-4 font-medium">Avg ms</th>
                      <th className="py-2 pr-4 font-medium">P95 ms</th>
                      <th className="py-2 pr-4 font-medium">With Tools</th>
                      <th className="py-2 pr-4 font-medium">Fallbacks</th>
                      <th className="py-2 pr-0 font-medium">Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(daily ?? []).map((row) => (
                      <tr
                        key={`${row.company_id}-${row.metric_date}`}
                        className="border-b border-neutral-100 text-neutral-800"
                      >
                        <td className="py-2.5 pr-4">{row.metric_date}</td>
                        <td className="py-2.5 pr-4">{row.total_interactions}</td>
                        <td className="py-2.5 pr-4">{row.avg_response_ms}</td>
                        <td className="py-2.5 pr-4">{row.p95_response_ms}</td>
                        <td className="py-2.5 pr-4">{row.with_tools}</td>
                        <td className="py-2.5 pr-4">{row.fallbacks}</td>
                        <td className="py-2.5 pr-0">{row.errors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
