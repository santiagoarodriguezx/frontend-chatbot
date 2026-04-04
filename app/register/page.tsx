"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { companiesApi } from "@/lib/api";
import { authService } from "@/features/auth/application/auth.service";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] =
    useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function normalizeEmail(value: string) {
    return value.trim().toLowerCase();
  }

  function isAlreadyRegisteredError(value: string) {
    const message = value.toLowerCase();
    return (
      message.includes("already registered") ||
      message.includes("already exists") ||
      message.includes("email already")
    );
  }

  function isObfuscatedExistingUserResponse(user: {
    identities?: Array<unknown> | null;
  } | null) {
    return Boolean(
      user && Array.isArray(user.identities) && user.identities.length === 0,
    );
  }

  async function onResendConfirmation() {
    const normalizedEmail = normalizeEmail(pendingConfirmationEmail || email);
    if (!normalizedEmail) return;

    const emailRedirectTo = `${window.location.origin}/login`;

    setResending(true);
    setError(null);
    try {
      const { error: resendError } = await authService.resendSignupConfirmation(
        normalizedEmail,
        emailRedirectTo,
      );

      if (resendError) {
        setError(resendError.message);
        return;
      }

      setSuccess(
        "Reenviamos el correo de confirmación. Revisa bandeja principal/spam.",
      );
    } finally {
      setResending(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setPendingConfirmationEmail(null);

    const normalizedEmail = normalizeEmail(email);
    const emailRedirectTo = `${window.location.origin}/login`;
    const { data, error: signUpError } = await authService.signUp(
      normalizedEmail,
      password,
      emailRedirectTo,
    );

    if (signUpError) {
      if (isAlreadyRegisteredError(signUpError.message)) {
        const safeEmail = encodeURIComponent(normalizedEmail);
        setLoading(false);
        router.replace(`/login?email=${safeEmail}`);
        return;
      }

      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (isObfuscatedExistingUserResponse(data.user)) {
      const safeEmail = encodeURIComponent(normalizedEmail);
      setLoading(false);
      router.replace(`/login?email=${safeEmail}`);
      return;
    }

    if (data.session) {
      try {
        const bootstrap = await companiesApi.bootstrap();
        if (bootstrap.company) {
          router.replace("/dashboard");
          return;
        }

        if (bootstrap.is_admin) {
          router.replace("/dashboard/admin/companies");
          return;
        }

        router.replace("/onboarding");
        return;
      } catch (bootstrapError) {
        setError(
          bootstrapError instanceof Error
            ? bootstrapError.message
            : "Cuenta creada, pero no se pudo cargar el contexto.",
        );
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setPendingConfirmationEmail(normalizedEmail);
    setSuccess(
      "Cuenta creada. Te enviamos un correo de confirmación. Revisa bandeja principal/spam y confirma para iniciar sesión.",
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white border border-neutral-200 rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-neutral-950">Registro</h1>
        <p className="text-sm text-neutral-500 mt-1 mb-6">
          Crea tu cuenta y continúa al flujo de onboarding.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
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
              placeholder="you@company.com"
            />
          </div>

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
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-neutral-950 text-white py-2.5 text-sm font-medium hover:bg-neutral-800 transition disabled:opacity-60"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {success && (
          <div className="space-y-2">
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {success}
            </p>
            {pendingConfirmationEmail && (
              <button
                type="button"
                onClick={onResendConfirmation}
                disabled={resending}
                className="w-full rounded-xl border border-neutral-300 text-neutral-700 py-2 text-sm font-medium hover:bg-neutral-50 transition disabled:opacity-60"
              >
                {resending
                  ? "Reenviando confirmación..."
                  : "Reenviar correo de confirmación"}
              </button>
            )}
          </div>
        )}

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
