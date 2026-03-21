"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { agentApi, companiesApi } from "@/lib/api";
import { authService } from "@/features/auth/application/auth.service";

type PlanType = "free" | "pro" | "business";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [instanceName, setInstanceName] = useState("");
  const [plan, setPlan] = useState<PlanType>("free");
  const [agentName, setAgentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slugTouched) return;
    setSlug(slugify(name));
  }, [name, slugTouched]);

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

        if (data.company) {
          router.replace("/dashboard");
          return;
        }

        if (data.is_admin) {
          router.replace("/dashboard/admin/companies");
          return;
        }

        const draftRaw = localStorage.getItem("onboardingDraft");
        if (draftRaw) {
          const draft = JSON.parse(draftRaw) as {
            name?: string;
            slug?: string;
            whatsapp_number?: string | null;
            whatsapp_instance_name?: string | null;
            plan?: PlanType;
            agent_name?: string | null;
          };
          setName(draft.name ?? "");
          setSlug(draft.slug ?? "");
          setWhatsappNumber(draft.whatsapp_number ?? "");
          setInstanceName(draft.whatsapp_instance_name ?? "");
          setPlan(draft.plan ?? "free");
          setAgentName(draft.agent_name ?? "");
          setSlugTouched(Boolean(draft.slug));
        }

        setInitialLoading(false);
      } catch {
        router.replace("/login");
      }
    }

    void bootstrap();
    return () => {
      mounted = false;
    };
  }, [router]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const company = await companiesApi.create({
        name,
        slug,
        whatsapp_number: whatsappNumber || null,
        whatsapp_instance_name: instanceName || null,
        plan,
      });

      if (agentName.trim()) {
        await agentApi.update(company.id, { agent_name: agentName.trim() });
      }

      localStorage.removeItem("onboardingDraft");
      router.replace("/dashboard");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo crear la empresa",
      );
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-500 text-sm">
        Cargando configuración inicial...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white border border-neutral-200 rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-neutral-950">
          Configura tu empresa
        </h1>
        <p className="text-sm text-neutral-500 mt-1 mb-6">
          Este paso es necesario para activar tu dashboard.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Nombre empresa
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Slug
              </label>
              <input
                required
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                WhatsApp número
              </label>
              <input
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                WhatsApp instancia
              </label>
              <input
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                minLength={3}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Mínimo 3 caracteres (o déjalo vacío)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Plan
              </label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value as PlanType)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950 bg-white"
              >
                <option value="free">free</option>
                <option value="pro">pro</option>
                <option value="business">business</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Nombre del agente (opcional)
              </label>
              <input
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-neutral-950 text-white py-2.5 text-sm font-medium hover:bg-neutral-800 transition disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Crear empresa y entrar al dashboard"}
          </button>
        </form>
      </div>
    </main>
  );
}
