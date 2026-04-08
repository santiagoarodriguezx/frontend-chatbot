"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, QrCode, RefreshCw } from "lucide-react";
import { authService } from "@/features/auth/application/auth.service";
import { companiesApi } from "@/lib/api";
import type { Company } from "@/lib/types";

const CONNECTED_STATES = new Set(["connected", "open", "online"]);

export const dynamic = "force-dynamic";

function toSafeInstanceName(base: string): string {
  const normalized = base
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (normalized.length >= 3) {
    return normalized;
  }

  return "empresa-chatbot";
}

function toQrSrc(value: string | null): string | null {
  if (!value) return null;
  if (value.startsWith("data:image")) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (/^[A-Za-z0-9+/=\n\r]+$/.test(value)) {
    return `data:image/png;base64,${value.replace(/\s+/g, "")}`;
  }
  return null;
}

function isConnectedState(value: string | null): boolean {
  return CONNECTED_STATES.has((value || "").trim().toLowerCase());
}

export default function SetupWhatsappPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 text-sm text-neutral-600">
          Cargando configuracion de WhatsApp...
        </main>
      }
    >
      <SetupWhatsappPageContent />
    </Suspense>
  );
}

function SetupWhatsappPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [company, setCompany] = useState<Company | null>(null);
  const [instanceName, setInstanceName] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPageVisible, setIsPageVisible] = useState(true);

  const isConnected = isConnectedState(status);
  const qrSrc = useMemo(() => toQrSrc(qrValue), [qrValue]);

  const refreshStatus = useCallback(
    async (companyId: string, silent = false): Promise<string | null> => {
      if (!silent) {
        setError(null);
        setSuccess(null);
      }

      try {
        const data = await companiesApi.getStatus(companyId);
        setInstanceName(data.instance_name);
        setStatus(data.state);
        if (!silent) {
          setSuccess("Estado actualizado.");
        }
        return typeof data.state === "string" ? data.state : String(data.state);
      } catch {
        setStatus(null);
        if (!silent) {
          setError(
            "Aún no hay una instancia activa. Crea una y escanea el QR.",
          );
        }
        return null;
      }
    },
    [],
  );

  const loadQr = useCallback(
    async (
      companyId: string,
      options?: { silent?: boolean; background?: boolean },
    ) => {
      const silent = Boolean(options?.silent);
      const background = Boolean(options?.background);

      if (!background) {
        setBusy(true);
      }
      if (!silent) {
        setError(null);
        setSuccess(null);
      }
      try {
        const data = await companiesApi.getQRCode(companyId);
        setInstanceName(data.instance_name);
        setQrValue(data.qrcode);
        if (!silent) {
          setSuccess("QR cargado correctamente.");
        }
      } catch (value) {
        if (!silent) {
          setError(
            value instanceof Error
              ? value.message
              : "No se pudo obtener el QR.",
          );
        }
      } finally {
        if (!background) {
          setBusy(false);
        }
      }
    },
    [],
  );

  const refreshStatusAndQr = useCallback(
    async (companyId: string) => {
      const currentState = await refreshStatus(companyId, true);
      if (!isConnectedState(currentState)) {
        await loadQr(companyId, { silent: true, background: true });
      }
    },
    [loadQr, refreshStatus],
  );

  const createInstance = useCallback(async () => {
    if (!company) return;

    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      const preferredName = toSafeInstanceName(
        company.whatsapp_instance_name || company.slug || company.name,
      );

      if ((company.whatsapp_instance_name || "").trim() !== preferredName) {
        const updated = await companiesApi.update(company.id, {
          whatsapp_instance_name: preferredName,
        });
        setCompany(updated);
      }

      const created = await companiesApi.createInstance(company.id);
      setInstanceName(created.instance_name);

      await refreshStatusAndQr(company.id);
      setSuccess("Instancia creada. Escanea el QR para conectar WhatsApp.");
    } catch (value) {
      setError(
        value instanceof Error
          ? value.message
          : "No se pudo crear la instancia.",
      );
    } finally {
      setBusy(false);
    }
  }, [company, refreshStatusAndQr]);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const {
        data: { session },
      } = await authService.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      try {
        const data = await companiesApi.bootstrap();
        if (!mounted) return;

        if (data.is_admin) {
          router.replace("/dashboard/admin");
          return;
        }

        if (!data.company) {
          router.replace("/onboarding");
          return;
        }

        const companyIdFromQuery = searchParams.get("companyId");
        if (companyIdFromQuery && data.company.id !== companyIdFromQuery) {
          setError("No tienes acceso a la empresa solicitada.");
          setLoading(false);
          return;
        }

        setCompany(data.company);
        setInstanceName(data.company.whatsapp_instance_name);
        await refreshStatusAndQr(data.company.id);
      } catch {
        router.replace("/login");
        return;
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, [refreshStatusAndQr, router, searchParams]);

  useEffect(() => {
    function handleVisibilityChange() {
      setIsPageVisible(document.visibilityState === "visible");
    }

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!company || isConnected || !isPageVisible) return;

    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      await refreshStatusAndQr(company.id);
    };

    void tick();

    const timer = window.setInterval(() => {
      void tick();
    }, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [company, isConnected, isPageVisible, refreshStatusAndQr]);

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <div className="text-sm text-neutral-600">
          Cargando configuración...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white border border-neutral-200 rounded-3xl shadow-sm p-8 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Paso obligatorio
          </p>
          <h1 className="text-2xl font-bold text-neutral-950 mt-2">
            Conecta tu instancia de WhatsApp
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Debes tener la instancia conectada para habilitar el dashboard.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 p-4 bg-neutral-50">
          <p className="text-xs text-neutral-500 uppercase tracking-wide">
            Empresa
          </p>
          <p className="text-sm text-neutral-900 mt-1">{company?.name}</p>
          <p className="text-xs text-neutral-500 mt-2">
            Instancia: {instanceName || "Sin nombre asignado"}
          </p>
          <p className="text-xs mt-1 inline-flex items-center gap-1.5">
            <CheckCircle2
              className={`w-3.5 h-3.5 ${isConnected ? "text-emerald-600" : "text-neutral-400"}`}
            />
            <span
              className={isConnected ? "text-emerald-700" : "text-neutral-600"}
            >
              Estado: {status || "pendiente"}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={createInstance}
            disabled={busy || isConnected || !company}
            className="rounded-xl bg-neutral-950 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800 transition disabled:opacity-60"
          >
            {busy ? "Procesando..." : "Crear instancia"}
          </button>
          <button
            type="button"
            onClick={() => company && void refreshStatus(company.id)}
            disabled={busy || !company}
            className="rounded-xl border border-neutral-300 text-neutral-700 px-4 py-2 text-sm font-medium hover:bg-neutral-50 transition disabled:opacity-60 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Revisar estado
          </button>
          <button
            type="button"
            onClick={() => company && void loadQr(company.id)}
            disabled={busy || !company}
            className="rounded-xl border border-neutral-300 text-neutral-700 px-4 py-2 text-sm font-medium hover:bg-neutral-50 transition disabled:opacity-60 inline-flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            Obtener QR
          </button>
        </div>

        <div className="border border-neutral-200 rounded-2xl p-4 min-h-[260px] bg-white flex items-center justify-center">
          {busy ? (
            <div className="text-sm text-neutral-500 inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando...
            </div>
          ) : qrSrc ? (
            <Image
              src={qrSrc}
              alt="QR de conexión"
              width={240}
              height={240}
              className="w-auto max-h-60"
              unoptimized
            />
          ) : qrValue ? (
            <p className="text-xs text-neutral-600 break-all text-center">
              {qrValue}
            </p>
          ) : (
            <p className="text-sm text-neutral-500 text-center">
              Aún no hay QR disponible. Crea la instancia y solicita el QR.
            </p>
          )}
        </div>

        {success && (
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
            {success}
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={!isConnected}
          onClick={() => router.replace("/dashboard")}
          className="w-full rounded-xl bg-emerald-600 text-white py-2.5 text-sm font-medium hover:bg-emerald-500 transition disabled:opacity-50"
        >
          Continuar al dashboard
        </button>
      </div>
    </main>
  );
}
