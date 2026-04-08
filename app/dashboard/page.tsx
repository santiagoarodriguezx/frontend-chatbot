"use client";
import useSWR from "swr";
import { dashboardApi } from "@/lib/api";
import { useCompany } from "@/lib/company-context";
import type { DashboardMetrics } from "@/lib/types";
import {
  MessageSquare,
  ShoppingCart,
  Calendar,
  DollarSign,
  MessageCircle,
  TrendingUp,
  ArrowRight,
  Zap,
  Package,
} from "lucide-react";
import Link from "next/link";

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
      className="group relative bg-white rounded-2xl border border-neutral-200/60 p-6 hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-200/50 transition-all duration-300 animate-fade-in-up cursor-default"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-neutral-100 group-hover:bg-neutral-950 group-hover:text-white transition-colors duration-300">
          <Icon className="w-5 h-5" />
        </div>
        <TrendingUp className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
      </div>
      <p className="text-sm font-medium text-neutral-500 mb-1">{title}</p>
      <p className="text-3xl font-bold text-neutral-950 tracking-tight">
        {value}
      </p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
      <div className="w-10 h-10 skeleton mb-4" />
      <div className="w-20 h-4 skeleton mb-2" />
      <div className="w-28 h-8 skeleton" />
    </div>
  );
}

export default function DashboardPage() {
  const companyId = useCompany();
  const { data: metrics, isLoading } = useSWR<DashboardMetrics>(
    `metrics-${companyId}`,
    () => dashboardApi.metrics(companyId),
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-neutral-950 tracking-tight">
          Resumen
        </h1>
        <p className="text-neutral-500 mt-1 text-sm">
          Métricas en tiempo real de tu agente de IA
        </p>
      </div>

      {/* Metrics Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-10">
          {[...Array(5)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-10">
          <MetricCard
            title="Conversaciones"
            value={metrics?.total_conversations ?? 0}
            icon={MessageSquare}
            index={0}
          />
          <MetricCard
            title="Mensajes"
            value={metrics?.total_messages ?? 0}
            icon={MessageCircle}
            index={1}
          />
          <MetricCard
            title="Pedidos"
            value={metrics?.total_orders ?? 0}
            icon={ShoppingCart}
            index={2}
          />
          <MetricCard
            title="Citas"
            value={metrics?.total_appointments ?? 0}
            icon={Calendar}
            index={3}
          />
          <MetricCard
            title="Ingresos"
            value={`$${(metrics?.total_revenue ?? 0).toFixed(2)}`}
            icon={DollarSign}
            index={4}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="animate-fade-in-up delay-500">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400 mb-4">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Configurar agente",
              desc: "Ajusta el nombre, prompt y comportamiento del asistente",
              href: "/dashboard/agent",
              icon: Zap,
            },
            {
              title: "Gestionar catálogo",
              desc: "Agrega productos que tu agente pueda recomendar y vender",
              href: "/dashboard/catalog",
              icon: Package,
            },
            {
              title: "Ver conversaciones",
              desc: "Monitorea los chats en tiempo real entre clientes y agente",
              href: "/dashboard/conversations",
              icon: MessageSquare,
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-start gap-4 p-5 bg-white rounded-2xl border border-neutral-200/60 hover:border-neutral-950 hover:shadow-lg transition-all duration-300"
            >
              <div className="p-2 rounded-xl bg-neutral-100 group-hover:bg-neutral-950 transition-colors duration-300">
                <item.icon className="w-5 h-5 text-neutral-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-950 text-sm mb-0.5 flex items-center gap-2">
                  {item.title}
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </p>
                <p className="text-xs text-neutral-500">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
