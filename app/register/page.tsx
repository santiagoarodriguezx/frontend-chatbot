"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { agentApi, companiesApi } from "@/lib/api";
import { authService } from "@/features/auth/application/auth.service";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [instanceName, setInstanceName] = useState("");
  const [plan, setPlan] = useState<"free" | "pro" | "business">("free");
  const [agentName, setAgentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (slugTouched) return;
    setSlug(slugify(name));
  }, [name, slugTouched]);

  async function onGoogleSignUp() {
    setOauthLoading(true);
    setError(null);
    setSuccess(null);

    localStorage.setItem(
      "onboardingDraft",
      JSON.stringify({
        name,
        slug,
        whatsapp_number: whatsappNumber || null,
        whatsapp_instance_name: instanceName || null,
        plan,
        agent_name: agentName || null,
      }),
    );

    const { error: oauthError } = await authService.signInWithGoogle(
      `${window.location.origin}/onboarding`,
    );

    if (oauthError) {
      setError(oauthError.message);
      setOauthLoading(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setLoading(false);
      setError("Las contraseñas no coinciden");
      return;
    }

    const companyPayload = {
      name,
      slug,
      whatsapp_number: whatsappNumber || null,
      whatsapp_instance_name: instanceName || null,
      plan,
    };

    localStorage.setItem(
      "onboardingDraft",
      JSON.stringify({ ...companyPayload, agent_name: agentName || null }),
    );

    const { data, error: signUpError } = await authService.signUp(
      email,
      password,
    );

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    if (!data.session) {
      setLoading(false);
      setSuccess(
        "Cuenta creada. Confirma tu correo y luego inicia sesión para terminar la configuración de tu empresa.",
      );
      return;
    }

    try {
      const company = await companiesApi.create(companyPayload);
      if (agentName.trim()) {
        await agentApi.update(company.id, { agent_name: agentName.trim() });
      }
      localStorage.removeItem("onboardingDraft");
      router.replace("/dashboard");
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "No se pudo crear la empresa",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white border border-neutral-200 rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-neutral-950">Registro</h1>
        <p className="text-sm text-neutral-500 mt-1 mb-6">
          Crea tu cuenta y deja configurada tu empresa.
        </p>

        <button
          type="button"
          onClick={onGoogleSignUp}
          disabled={loading || oauthLoading}
          className="w-full mb-4 rounded-xl border border-neutral-300 text-neutral-700 py-2.5 text-sm font-medium hover:bg-neutral-50 transition disabled:opacity-60"
        >
          {oauthLoading ? "Redirigiendo a Google..." : "Registrarme con Google"}
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-neutral-400">o</span>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950"
              />
            </div>

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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Confirmar contraseña
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="mi-empresa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Plan
              </label>
              <select
                value={plan}
                onChange={(e) =>
                  setPlan(e.target.value as "free" | "pro" | "business")
                }
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950 bg-white"
              >
                <option value="free">free</option>
                <option value="pro">pro</option>
                <option value="business">business</option>
              </select>
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
                placeholder="+5215512345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                WhatsApp instancia
              </label>
              <input
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950"
                placeholder="mi-instancia"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Nombre del agente (opcional)
            </label>
            <input
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950"
              placeholder="Asistente de Ventas"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || oauthLoading}
            className="w-full rounded-xl bg-neutral-950 text-white py-2.5 text-sm font-medium hover:bg-neutral-800 transition disabled:opacity-60"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta y empresa"}
          </button>
        </form>

        <p className="text-xs text-neutral-500 mt-4 text-center">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
