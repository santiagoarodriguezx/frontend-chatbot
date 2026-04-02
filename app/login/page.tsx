"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { companiesApi } from "@/lib/api";
import { authService } from "@/features/auth/application/auth.service";

type LoginMode = "login" | "signup";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<LoginMode>("login");
  const redirectingRef = useRef(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const redirectAfterAuth = useCallback(async () => {
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
  }, [router]);

  useEffect(() => {
    const emailFromQuery = searchParams.get("email") ?? "";
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;

    async function safeRedirectAfterAuth() {
      if (redirectingRef.current) return;
      redirectingRef.current = true;
      try {
        await redirectAfterAuth();
      } catch (bootstrapError) {
        if (!mounted) return;
        setError(
          bootstrapError instanceof Error
            ? bootstrapError.message
            : "No se pudo validar la sesión con el backend.",
        );
      } finally {
        redirectingRef.current = false;
      }
    }

    async function checkSession() {
      const {
        data: { session },
      } = await authService.getSession();

      if (!mounted || !session) return;

      try {
        await redirectAfterAuth();
      } catch (bootstrapError) {
        if (!mounted) return;

        setError(
          bootstrapError instanceof Error
            ? bootstrapError.message
            : "No se pudo validar la sesion con el backend.",
        );
      }
    }

      if (mounted && session) {
        await safeRedirectAfterAuth();
      }
    }

    const {
      data: { subscription },
    } = authService.onAuthStateChange((event, session) => {
      if (!mounted || !session) return;
      if (
        event === "SIGNED_IN" ||
        event === "INITIAL_SESSION" ||
        event === "TOKEN_REFRESHED"
      ) {
        void safeRedirectAfterAuth();
      }
    });

    void checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [redirectAfterAuth]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const normalizedEmail = normalizeEmail(email);

    if (mode === "login") {
      const { error: signInError } = await authService.signInWithPassword(
        normalizedEmail,
        password,
      );

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      const { error: signOutError } = await authService.signOut();
      if (signOutError) {
        setError(signOutError.message);
        setLoading(false);
        return;
      }

      const appBaseUrl = window.location.origin;
      const { error: otpError } = await authService.signInWithOtp(
        normalizedEmail,
        `${appBaseUrl}/login`,
      );

      setLoading(false);

      if (otpError) {
        setError(otpError.message);
        return;
      }

      const safeEmail = encodeURIComponent(normalizedEmail);
      router.push(`/login/otp?email=${safeEmail}&force=1&sent=1`);
      return;
    }

    const { data, error: signUpError } = await authService.signUp(
      normalizedEmail,
      password,
    );

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      try {
        await redirectAfterAuth();
      } catch (bootstrapError) {
        setError(
          bootstrapError instanceof Error
            ? bootstrapError.message
            : "Cuenta creada, pero no se pudo cargar tu contexto.",
        );
      }
      return;
    }

    setSuccess(
      "Cuenta creada. Revisa tu correo para confirmar y luego inicia sesion.",
    );
    setMode("login");
  }

  async function onGoogleAuth() {
    setOauthLoading(true);
    setError(null);
    setSuccess(null);

    const redirectTo = `${window.location.origin}/login`;
    const { error: oauthError } =
      await authService.signInWithGoogle(redirectTo);

    if (oauthError) {
      setError(oauthError.message);
      setOauthLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-neutral-950">
          {mode === "login" ? "Iniciar sesion" : "Crear cuenta"}
        </h1>

        <p className="text-sm text-neutral-500 mt-1 mb-6">
          {mode === "login"
            ? "Ingresa con email y contrasena. Luego validaras un codigo OTP."
            : "Registrate con email y contrasena en Supabase Auth."}
        </p>

        <button
          type="button"
          onClick={onGoogleAuth}
          disabled={loading || oauthLoading}
          className="w-full mb-4 rounded-xl border border-neutral-300 text-neutral-700 py-2.5 text-sm font-medium hover:bg-neutral-50 transition disabled:opacity-60"
        >
          {oauthLoading
            ? "Redirigiendo a Google..."
            : mode === "login"
              ? "Continuar con Google"
              : "Registrarme con Google"}
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
              Contrasena
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
            {loading
              ? mode === "login"
                ? "Validando..."
                : "Creando cuenta..."
              : mode === "login"
                ? "Continuar"
                : "Crear cuenta"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setSuccess(null);
            }}
            className="w-full rounded-xl border border-neutral-300 text-neutral-700 py-2.5 text-sm font-medium hover:bg-neutral-50 transition"
          >
            {mode === "login"
              ? "No tengo cuenta, crear cuenta"
              : "Ya tengo cuenta, iniciar sesion"}
          </button>
        </form>
      </div>
    </main>
  );
}
