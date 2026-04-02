"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function onContinueStepOne(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setStep(2);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    await new Promise((resolve) => setTimeout(resolve, 400));
    setLoading(false);
    setSuccess(
      `Registro completado para ${companyName}. Tu configuración de WhatsApp quedó lista en esta demo UI.`,
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white border border-neutral-200 rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-neutral-950">Registro</h1>
        <p className="text-sm text-neutral-500 mt-1 mb-6">
          Completa tu registro en 2 pasos.
        </p>

        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-5">
          <span
            className={`h-6 px-2 rounded-full border flex items-center ${
              step === 1
                ? "border-neutral-900 text-neutral-900"
                : "border-neutral-200"
            }`}
          >
            Paso 1 de 2
          </span>
          <span
            className={`h-6 px-2 rounded-full border flex items-center ${
              step === 2
                ? "border-neutral-900 text-neutral-900"
                : "border-neutral-200"
            }`}
          >
            Paso 2 de 2
          </span>
        </div>

        {step === 1 ? (
          <form onSubmit={onContinueStepOne} className="space-y-4">
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
              className="w-full rounded-xl bg-neutral-950 text-white py-2.5 text-sm font-medium hover:bg-neutral-800 transition"
            >
              Continuar
            </button>
          </form>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Nombre de empresa
              </label>
              <input
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950"
                placeholder="Mi Empresa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Número de WhatsApp
              </label>
              <input
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950"
                placeholder="+5215512345678"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError(null);
                  setSuccess(null);
                }}
                className="w-full rounded-xl border border-neutral-300 text-neutral-700 py-2.5 text-sm font-medium hover:bg-neutral-50 transition"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-neutral-950 text-white py-2.5 text-sm font-medium hover:bg-neutral-800 transition disabled:opacity-60"
              >
                {loading ? "Finalizando..." : "Finalizar registro"}
              </button>
            </div>
          </form>
        )}

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
