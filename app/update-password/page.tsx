"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/features/auth/application/auth.service";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      const {
        data: { session },
      } = await authService.getSession();

      if (!mounted) return;

      if (!session) {
        setHasRecoverySession(false);
        setError(
          "Primero valida tu codigo de recuperacion en la pantalla anterior.",
        );
        return;
      }

      setHasRecoverySession(true);
    }

    void checkRecoverySession();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (hasRecoverySession === false) {
      setError("Sesion de recuperacion no valida o expirada.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await authService.updatePassword(password);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    await authService.signOut();
    setSuccess("Contraseña actualizada correctamente. Redirigiendo...");
    setLoading(false);

    setTimeout(() => {
      router.replace("/login");
    }, 1000);
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-neutral-950">
          Nueva contraseña
        </h1>
        <p className="text-sm text-neutral-500 mt-1 mb-6">
          {email
            ? `Actualiza la contraseña de ${email}.`
            : "Actualiza tu contraseña para recuperar el acceso."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Nueva contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950"
            />
          </div>

          <button
            type="submit"
            disabled={loading || hasRecoverySession === false}
            className="w-full rounded-xl bg-neutral-950 text-white py-2.5 text-sm font-medium hover:bg-neutral-800 transition disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Cambiar contraseña"}
          </button>

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
        </form>

        <Link
          href="/login"
          className="block mt-5 text-center text-xs text-neutral-500 hover:text-neutral-900"
        >
          Volver a inicio de sesion
        </Link>
      </div>
    </main>
  );
}
