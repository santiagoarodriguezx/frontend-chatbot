"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/features/auth/application/auth.service";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  function otpValue() {
    return otp.join("");
  }

  async function handleRequestCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const normalizedEmail = normalizeEmail(email);
    const redirectTo = `${window.location.origin}/update-password`;
    const { error: resetError } = await authService.requestPasswordReset(
      normalizedEmail,
      redirectTo,
    );

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setEmail(normalizedEmail);
    setStep("verify");
    setMessage(`Te enviamos un codigo de 6 digitos a ${normalizedEmail}.`);
    inputRefs.current[0]?.focus();
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerifyCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (otpValue().length !== 6) {
      setError("Ingresa el codigo completo de 6 digitos.");
      return;
    }

    setLoading(true);

    const { error: verifyError } = await authService.verifyRecoveryCode(
      email,
      otpValue(),
    );

    setLoading(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    router.push(`/update-password?email=${encodeURIComponent(email)}`);
  }

  async function handleResendCode() {
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Ingresa un email valido para reenviar el codigo.");
      return;
    }

    setLoading(true);
    const redirectTo = `${window.location.origin}/update-password`;
    const { error: resendError } = await authService.requestPasswordReset(
      email,
      redirectTo,
    );
    setLoading(false);

    if (resendError) {
      setError(resendError.message);
      return;
    }

    setMessage(`Te reenviamos un nuevo codigo a ${email}.`);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-neutral-950">
          Recuperar contraseña
        </h1>
        <p className="text-sm text-neutral-500 mt-1 mb-6">
          {step === "request"
            ? "Ingresa tu correo y te enviaremos un codigo OTP."
            : "Escribe el codigo OTP para continuar con el cambio de contraseña."}
        </p>

        {step === "request" ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-neutral-950 text-white py-2.5 text-sm font-medium hover:bg-neutral-800 transition disabled:opacity-60"
            >
              {loading ? "Enviando codigo..." : "Enviar OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="h-12 w-12 rounded-xl border border-neutral-300 text-center text-lg font-semibold outline-none focus:border-neutral-950"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-neutral-950 text-white py-2.5 text-sm font-medium hover:bg-neutral-800 transition disabled:opacity-60"
            >
              {loading ? "Validando..." : "Validar OTP"}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              className="w-full rounded-xl border border-neutral-300 text-neutral-700 py-2.5 text-sm font-medium hover:bg-neutral-50 transition disabled:opacity-60"
            >
              Reenviar codigo
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("request");
                setOtp(["", "", "", "", "", ""]);
                setError(null);
                setMessage(null);
              }}
              className="w-full rounded-xl border border-neutral-300 text-neutral-700 py-2.5 text-sm font-medium hover:bg-neutral-50 transition"
            >
              Cambiar correo
            </button>
          </form>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {message && (
          <p className="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {message}
          </p>
        )}

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
