import { useCallback, useEffect, useMemo, useState } from "react";
import { companiesApi } from "@/lib/api";
import type { Company } from "@/lib/types";

export function useCompanyInstance(companyId: string) {
  const [company, setCompany] = useState<Company | null>(null);
  const [whatsappNumberDraft, setWhatsappNumberDraft] = useState("");
  const [instanceNameDraft, setInstanceNameDraft] = useState("");
  const [instanceStatus, setInstanceStatus] = useState<string | null>(null);
  const [instanceName, setInstanceName] = useState<string | null>(null);
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [isInstanceCreated, setIsInstanceCreated] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function isInstanceMissingError(value: unknown): boolean {
    if (!(value instanceof Error)) return false;
    const message = value.message.toLowerCase();
    return (
      message.includes("instance does not exist") ||
      message.includes("instance endpoint not found") ||
      (message.includes('the \\"') && message.includes("instance"))
    );
  }

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

  const loadCompany = useCallback(async () => {
    const data = await companiesApi.get(companyId);
    setCompany(data);
    setWhatsappNumberDraft(data.whatsapp_number ?? "");
    setInstanceNameDraft(data.whatsapp_instance_name ?? "");
    setInstanceName(data.whatsapp_instance_name ?? null);
  }, [companyId]);

  async function init() {
    setBootstrapping(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await companiesApi.get(companyId);
      setCompany(data);
      setWhatsappNumberDraft(data.whatsapp_number ?? "");
      setInstanceNameDraft(data.whatsapp_instance_name ?? "");
      setInstanceName(data.whatsapp_instance_name ?? null);
      const hasSavedInstanceName = Boolean(
        (data.whatsapp_instance_name || "").trim(),
      );
      if (hasSavedInstanceName) {
        await refreshStatus({ silent: true });
      }
    } catch (value) {
      setError(
        value instanceof Error
          ? value.message
          : "No se pudo cargar la configuración",
      );
    } finally {
      setBootstrapping(false);
    }
  }

  async function saveCompanyConfig(data: {
    whatsapp_number?: string | null;
    whatsapp_instance_name?: string | null;
  }) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await companiesApi.update(companyId, data);
      setCompany(updated);
      setWhatsappNumberDraft(updated.whatsapp_number ?? "");
      setInstanceNameDraft(updated.whatsapp_instance_name ?? "");
      setInstanceName(updated.whatsapp_instance_name ?? null);
      return updated;
    } catch (value) {
      setError(
        value instanceof Error
          ? value.message
          : "No se pudo guardar la configuración",
      );
      throw value;
    } finally {
      setLoading(false);
    }
  }

  async function saveNumber() {
    const normalized = whatsappNumberDraft.trim();
    await saveCompanyConfig({
      whatsapp_number: normalized ? normalized : null,
    });
    setSuccess("Numero guardado correctamente.");
  }

  async function saveInstanceName() {
    const normalized = instanceNameDraft.trim();
    await saveCompanyConfig({
      whatsapp_instance_name: normalized ? normalized : null,
    });
    setSuccess("Nombre de instancia guardado correctamente.");
  }

  async function clearNumber() {
    setWhatsappNumberDraft("");
    await saveCompanyConfig({ whatsapp_number: null });
    setSuccess("Numero eliminado correctamente.");
  }

  async function createInstance() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const normalizedName = instanceNameDraft.trim();
      if (!normalizedName) {
        throw new Error(
          "Primero guarda el nombre de la instancia para poder crearla.",
        );
      }

      if (company?.whatsapp_instance_name !== normalizedName) {
        await companiesApi.update(companyId, {
          whatsapp_instance_name: normalizedName,
        });
      }

      const data = await companiesApi.createInstance(companyId);
      setInstanceName(data.instance_name);
      setIsInstanceCreated(true);
      await loadCompany();
      await refreshStatus({ silent: true });
      await refreshQr();
      setSuccess("Instancia creada correctamente. Ahora escanea el QR.");
    } catch (value) {
      setError(
        value instanceof Error ? value.message : "No se pudo crear instancia",
      );
    } finally {
      setLoading(false);
    }
  }

  async function refreshStatus(options?: { silent?: boolean }) {
    const silent = Boolean(options?.silent);
    setLoading(true);
    if (!silent) setError(null);
    if (!silent) setSuccess(null);
    try {
      const data = await companiesApi.getStatus(companyId);
      setInstanceName(data.instance_name);
      setInstanceStatus(
        typeof data.state === "string" ? data.state : String(data.state),
      );
      setIsInstanceCreated(true);
      if (!silent) {
        setSuccess("Estado de la instancia actualizado.");
      }
    } catch (value) {
      setIsInstanceCreated(false);
      setInstanceStatus("no creada");
      if (isInstanceMissingError(value)) {
        if (!silent) {
          setSuccess(
            "La instancia aun no existe en Evolution API. Puedes crearla en el Paso 3.",
          );
        }
        return;
      }
      if (!silent) {
        setError(
          value instanceof Error
            ? value.message
            : "No se pudo consultar estado",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function refreshQr() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await companiesApi.getQRCode(companyId);
      setInstanceName(data.instance_name);
      setQrValue(data.qrcode);
      setIsInstanceCreated(true);
      setSuccess("QR actualizado correctamente.");
    } catch (value) {
      if (isInstanceMissingError(value)) {
        setIsInstanceCreated(false);
        setInstanceStatus("no creada");
        setSuccess(
          "No hay instancia creada aun. Crea la instancia en el Paso 3 para generar QR.",
        );
        return;
      }
      setError(
        value instanceof Error ? value.message : "No se pudo obtener QR",
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteInstance() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await companiesApi.deleteInstance(companyId);
      await loadCompany();
      setInstanceStatus(null);
      setQrValue(null);
      setIsInstanceCreated(false);
      setSuccess("Instancia eliminada correctamente.");
    } catch (value) {
      setError(
        value instanceof Error ? value.message : "No se pudo borrar instancia",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void init();
  }, [companyId]);

  const qrSrc = useMemo(() => resolveQrSrc(qrValue), [qrValue]);

  return {
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
  };
}
