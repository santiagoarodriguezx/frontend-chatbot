"use client";

import Image from "next/image";
import {
  CheckCircle2,
  Link2,
  QrCode,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useCompany } from "@/lib/company-context";
import { useCompanyInstance } from "@/features/companies/presentation/use-company-instance";

export default function InstancePage() {
  const companyId = useCompany();
  const {
    bootstrapping,
    clearNumber,
    company,
    createInstance,
    deleteInstance,
    error,
    isInstanceCreated,
    instanceName,
    instanceNameDraft,
    instanceStatus,
    loading,
    qrSrc,
    qrValue,
    refreshQr,
    refreshStatus,
    saveInstanceName,
    saveNumber,
    setInstanceNameDraft,
    setWhatsappNumberDraft,
    success,
    whatsappNumberDraft,
  } = useCompanyInstance(companyId);

  const hasNumber = Boolean((company?.whatsapp_number || "").trim());
  const hasInstanceName = Boolean(
    (company?.whatsapp_instance_name || "").trim(),
  );
  const step2Enabled = hasNumber;
  const step3Enabled = hasNumber && hasInstanceName;

  if (bootstrapping) {
    return (
      <div className="max-w-4xl animate-fade-in">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 text-sm text-neutral-600">
          Cargando configuracion de WhatsApp...
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-5xl animate-fade-in">
      <div className="pointer-events-none absolute -top-12 -right-12 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-200/40 to-cyan-200/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-gradient-to-br from-sky-200/40 to-teal-100/20 blur-3xl" />

      <div className="mb-8 relative z-10">
        <h1 className="text-3xl font-bold text-neutral-950 tracking-tight">
          WhatsApp Control Center
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Configura Evolution API en 3 pasos: numero, instancia y QR.
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="rounded-2xl border border-neutral-200/80 bg-white/90 backdrop-blur-sm p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Empresa
          </p>
          <p className="text-sm text-neutral-800 mt-1">{company?.name}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200/80 bg-white/90 backdrop-blur-sm p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Instancia activa
          </p>
          <p className="text-sm text-neutral-800 mt-1">
            {instanceName ?? "Sin instancia"}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200/80 bg-white/90 backdrop-blur-sm p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Estado
          </p>
          <p className="text-sm text-neutral-800 mt-1">
            {instanceStatus ?? "Sin conexion"}
          </p>
        </div>
      </div>

      <div className="relative z-10 mb-5 rounded-2xl border border-neutral-200/80 bg-white/85 backdrop-blur-sm p-4 shadow-sm animate-fade-in-up">
        <div className="flex items-center gap-3 text-sm">
          <Sparkles className="w-4 h-4 text-cyan-600" />
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs border ${hasNumber ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-neutral-50 text-neutral-600 border-neutral-200"}`}
            >
              1. Numero
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs border ${hasInstanceName ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-neutral-50 text-neutral-600 border-neutral-200"}`}
            >
              2. Instancia
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs border ${isInstanceCreated ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-neutral-50 text-neutral-600 border-neutral-200"}`}
            >
              3. QR / Conexion
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 bg-white/85 backdrop-blur-sm rounded-3xl border border-neutral-200/70 p-6 space-y-6 animate-fade-in-up shadow-sm">
        <section className="rounded-2xl border border-neutral-200 p-4 transition-all duration-300 hover:shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <CheckCircle2
                className={`w-4 h-4 ${hasNumber ? "text-emerald-600" : "text-neutral-400"}`}
              />
              Paso 1: Numero de WhatsApp
            </div>
            {hasNumber && (
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Guardado
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="tel"
              value={whatsappNumberDraft}
              onChange={(event) => setWhatsappNumberDraft(event.target.value)}
              placeholder="Ej: 573001112233"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10"
            />
            <button
              type="button"
              onClick={saveNumber}
              disabled={loading}
              className="px-3 py-2 text-xs rounded-lg bg-neutral-950 text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              Guardar numero
            </button>
            <button
              type="button"
              onClick={clearNumber}
              disabled={loading || !hasNumber}
              className="px-3 py-2 text-xs rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
            >
              Borrar numero
            </button>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Solo se permite 1 numero por empresa. Puedes cambiarlo o borrarlo
            cuando quieras.
          </p>
        </section>

        <section
          className={`rounded-2xl border p-4 transition-all duration-300 hover:shadow-sm ${step2Enabled ? "border-neutral-200" : "border-neutral-100 bg-neutral-50"}`}
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <CheckCircle2
                className={`w-4 h-4 ${hasInstanceName ? "text-emerald-600" : "text-neutral-400"}`}
              />
              Paso 2: Nombre de instancia
            </div>
            {hasInstanceName && (
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Guardado
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={instanceNameDraft}
              onChange={(event) => setInstanceNameDraft(event.target.value)}
              placeholder="Ej: tienda-centro-wpp"
              disabled={!step2Enabled}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 disabled:bg-neutral-100"
            />
            <button
              type="button"
              onClick={saveInstanceName}
              disabled={loading || !step2Enabled}
              className="px-3 py-2 text-xs rounded-lg bg-neutral-950 text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              Guardar nombre
            </button>
          </div>
          {!step2Enabled && (
            <p className="text-xs text-neutral-500 mt-2">
              Primero guarda el numero en el paso 1.
            </p>
          )}
        </section>

        <section
          className={`rounded-2xl border p-4 transition-all duration-300 hover:shadow-sm ${step3Enabled ? "border-neutral-200" : "border-neutral-100 bg-neutral-50"}`}
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <QrCode className="w-4 h-4 text-neutral-600" />
              Paso 3: Crear instancia y escanear QR
            </div>
            {isInstanceCreated && (
              <span className="text-xs px-2 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                Instancia registrada
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={createInstance}
              disabled={loading || !step3Enabled || isInstanceCreated}
              className="px-3 py-2 text-xs rounded-lg bg-neutral-950 text-white hover:bg-neutral-800 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Link2 className="w-3.5 h-3.5" />
              Crear instancia
            </button>
            <button
              type="button"
              onClick={() => {
                void refreshStatus();
              }}
              disabled={loading || !isInstanceCreated}
              className="px-3 py-2 text-xs rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Actualizar estado
            </button>
            <button
              type="button"
              onClick={refreshQr}
              disabled={loading || !isInstanceCreated}
              className="px-3 py-2 text-xs rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5" />
              Obtener QR
            </button>
            <button
              type="button"
              onClick={deleteInstance}
              disabled={loading || !isInstanceCreated}
              className="px-3 py-2 text-xs rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Borrar instancia
            </button>
          </div>

          <div className="border border-neutral-200 rounded-2xl p-4 flex items-center justify-center min-h-[220px] bg-gradient-to-b from-neutral-50 to-white">
            {!step3Enabled ? (
              <div className="text-xs text-neutral-500 text-center">
                Completa pasos 1 y 2 para habilitar el QR.
              </div>
            ) : qrSrc ? (
              <Image
                src={qrSrc}
                alt="QR Evolution"
                width={220}
                height={220}
                className="max-h-52 w-auto"
                unoptimized
              />
            ) : qrValue ? (
              <div className="text-xs text-neutral-600 break-all text-center">
                {qrValue}
              </div>
            ) : (
              <div className="text-xs text-neutral-500 text-center">
                Sin QR cargado. Si la instancia ya existe, usa &quot;Obtener QR&quot;.
              </div>
            )}
          </div>
        </section>

        {success && (
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 animate-fade-in">
            {success}
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
