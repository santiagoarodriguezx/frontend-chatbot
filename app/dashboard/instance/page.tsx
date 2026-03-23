"use client";

import Image from "next/image";
import { Link2, QrCode, RefreshCw } from "lucide-react";
import { useCompany } from "@/lib/company-context";
import { useCompanyInstance } from "@/features/companies/presentation/use-company-instance";

export default function InstancePage() {
  const companyId = useCompany();
  const {
    createInstance,
    error,
    instanceName,
    instanceStatus,
    loading,
    qrSrc,
    qrValue,
    refreshQr,
    refreshStatus,
  } = useCompanyInstance(companyId);

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-950 tracking-tight">
          WhatsApp Instance
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Crea la instancia en Evolution API y conecta escaneando el QR.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 space-y-5 animate-fade-in-up">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={createInstance}
            disabled={loading}
            className="px-3 py-2 text-xs rounded-lg bg-neutral-950 text-white hover:bg-neutral-800 disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <Link2 className="w-3.5 h-3.5" />
            Crear instancia
          </button>
          <button
            type="button"
            onClick={refreshStatus}
            disabled={loading}
            className="px-3 py-2 text-xs rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualizar estado
          </button>
          <button
            type="button"
            onClick={refreshQr}
            disabled={loading}
            className="px-3 py-2 text-xs rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5" />
            Obtener QR
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-neutral-200 rounded-xl p-4">
            <p className="text-xs text-neutral-500">Instance</p>
            <p className="text-sm text-neutral-800 mt-1">
              {instanceName ?? "—"}
            </p>
            <p className="text-xs text-neutral-500 mt-3">Estado</p>
            <p className="text-sm text-neutral-800 mt-1">
              {instanceStatus ?? "—"}
            </p>
          </div>

          <div className="border border-neutral-200 rounded-xl p-4 flex items-center justify-center min-h-[180px] bg-neutral-50">
            {qrSrc ? (
              <Image
                src={qrSrc}
                alt="QR Evolution"
                width={180}
                height={180}
                className="max-h-40 w-auto"
                unoptimized
              />
            ) : qrValue ? (
              <div className="text-xs text-neutral-600 break-all text-center">
                {qrValue}
              </div>
            ) : (
              <div className="text-xs text-neutral-500 text-center">
                Sin QR cargado
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
