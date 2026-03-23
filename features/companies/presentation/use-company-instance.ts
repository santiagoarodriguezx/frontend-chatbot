import { useMemo, useState } from "react";
import { companiesApi } from "@/lib/api";

export function useCompanyInstance(companyId: string) {
  const [instanceStatus, setInstanceStatus] = useState<string | null>(null);
  const [instanceName, setInstanceName] = useState<string | null>(null);
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resolveQrSrc(value: string | null): string | null {
    if (!value) return null;
    if (value.startsWith("data:image")) return value;
    if (value.startsWith("http://") || value.startsWith("https://"))
      return value;
    if (/^[A-Za-z0-9+/=\n\r]+$/.test(value)) {
      return `data:image/png;base64,${value.replace(/\s+/g, "")}`;
    }
    return null;
  }

  async function createInstance() {
    setLoading(true);
    setError(null);
    try {
      const data = await companiesApi.createInstance(companyId);
      setInstanceName(data.instance_name);
      await refreshStatus();
      await refreshQr();
    } catch (value) {
      setError(
        value instanceof Error ? value.message : "No se pudo crear instancia",
      );
    } finally {
      setLoading(false);
    }
  }

  async function refreshStatus() {
    setLoading(true);
    setError(null);
    try {
      const data = await companiesApi.getStatus(companyId);
      setInstanceName(data.instance_name);
      setInstanceStatus(
        typeof data.state === "string" ? data.state : String(data.state),
      );
    } catch (value) {
      setError(
        value instanceof Error ? value.message : "No se pudo consultar estado",
      );
    } finally {
      setLoading(false);
    }
  }

  async function refreshQr() {
    setLoading(true);
    setError(null);
    try {
      const data = await companiesApi.getQRCode(companyId);
      setInstanceName(data.instance_name);
      setQrValue(data.qrcode);
    } catch (value) {
      setError(
        value instanceof Error ? value.message : "No se pudo obtener QR",
      );
    } finally {
      setLoading(false);
    }
  }

  const qrSrc = useMemo(() => resolveQrSrc(qrValue), [qrValue]);

  return {
    createInstance,
    error,
    instanceName,
    instanceStatus,
    loading,
    qrSrc,
    qrValue,
    refreshQr,
    refreshStatus,
  };
}
