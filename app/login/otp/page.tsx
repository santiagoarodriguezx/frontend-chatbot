"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ClipboardEvent,
  KeyboardEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { authService } from "@/features/auth/application/auth.service";
import {
  isTrustedDevice,
  markTrustedDevice,
} from "@/features/auth/application/trusted-device";
import { companiesApi } from "@/lib/api";

const OTP_LENGTH = 6;
const OTP_COOLDOWN_SECONDS = 45;
const emptyOtp = Array.from({ length: OTP_LENGTH }, () => "");

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getAppBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export default function LoginOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledEmail = searchParams.get("email") ?? "";
  const forceOtp = searchParams.get("force") === "1";
  const wasOtpSentByPassword = searchParams.get("sent") === "1";

  const [email, setEmail] = useState(prefilledEmail.trim().toLowerCase());
  const [otp, setOtp] = useState<string[]>(emptyOtp);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const hasAutoSentRef = useRef(false);

  const otpValue = useMemo(() => otp.join(""), [otp]);
  const canVerify = /^\d{6}$/.test(otpValue);
  const hasValidLockedEmail = isValidEmail(email);

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

  const sendOtpCode = useCallback(
    async (rawEmail: string, source: "initial" | "manual" | "resend") => {
      const normalizedEmail = rawEmail.trim().toLowerCase();
      if (!isValidEmail(normalizedEmail)) return;

      if (!forceOtp && isTrustedDevice(normalizedEmail)) {
        const safeEmail = encodeURIComponent(normalizedEmail);
        router.replace(`/login?email=${safeEmail}&method=password&trusted=1`);
        return;
      }

      setIsSendingCode(true);
      setError(null);
      setMessage(null);

      const { error: sendError } = await authService.signInWithOtp(
        normalizedEmail,
        `${getAppBaseUrl()}/login`,
      );

      setIsSendingCode(false);

      if (sendError) {
        setError(sendError.message);
        return;
      }

      setEmail(normalizedEmail);
      setIsCodeSent(true);
      setOtp(emptyOtp);
      setResendCooldown(OTP_COOLDOWN_SECONDS);
      setMessage(
        source === "resend"
          ? "Codigo reenviado correctamente."
          : "Codigo enviado a tu email.",
      );

      inputRefs.current[0]?.focus();
    },
    [forceOtp, router],
  );

  useEffect(() => {
    let mounted = true;

    async function checkExistingSession() {
      const {
        data: { session },
      } = await authService.getSession();

      if (!mounted || !session) return;

      if (forceOtp) {
        await authService.signOut();
        return;
      }

      if (session.user.email) {
        markTrustedDevice(session.user.email);
      }

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

    void checkExistingSession();

    return () => {
      mounted = false;
    };
  }, [forceOtp, redirectAfterAuth]);

  useEffect(() => {
    const normalized = prefilledEmail.trim().toLowerCase();
    if (!normalized || !isValidEmail(normalized)) return;
    if (hasAutoSentRef.current) return;

    if (!forceOtp && isTrustedDevice(normalized)) {
      const safeEmail = encodeURIComponent(normalized);
      router.replace(`/login?email=${safeEmail}&method=password&trusted=1`);
      return;
    }

    if (wasOtpSentByPassword) {
      hasAutoSentRef.current = true;
      setEmail(normalized);
      setIsCodeSent(true);
      setResendCooldown(OTP_COOLDOWN_SECONDS);
      setOtp(emptyOtp);
      inputRefs.current[0]?.focus();
      return;
    }

    hasAutoSentRef.current = true;
    setEmail(normalized);
    void sendOtpCode(normalized, "initial");
  }, [forceOtp, prefilledEmail, router, sendOtpCode, wasOtpSentByPassword]);

  useEffect(() => {
    if (!isCodeSent || resendCooldown <= 0) return;

    const timer = setTimeout(() => {
      setResendCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [isCodeSent, resendCooldown]);

  function handleDigitChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);

    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH)
      .split("");

    if (!digits.length) return;

    e.preventDefault();

    const next = [...emptyOtp];
    digits.forEach((digit, index) => {
      next[index] = digit;
    });

    setOtp(next);

    const targetIndex = Math.min(digits.length, OTP_LENGTH - 1);
    inputRefs.current[targetIndex]?.focus();
  }

  async function onResendCode() {
    if (!isCodeSent || resendCooldown > 0 || isSendingCode) return;
    await sendOtpCode(email, "resend");
  }

  async function onVerifyCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isCodeSent || !canVerify) return;

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const { error: verifyError } = await authService.verifyEmailOtp(
      email.trim().toLowerCase(),
      otpValue,
    );

    if (verifyError) {
      setError(verifyError.message);
      setIsSubmitting(false);
      return;
    }

    try {
      markTrustedDevice(email.trim().toLowerCase());
      await redirectAfterAuth();
    } catch (bootstrapError) {
      setError(
        bootstrapError instanceof Error
          ? bootstrapError.message
          : "Codigo valido, pero fallo la inicializacion del perfil.",
      );
    }

    setIsSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-sm p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
          Login por codigo
        </p>

        <h1 className="text-2xl font-bold text-neutral-950">
          Verificacion OTP
        </h1>
        <p className="text-sm text-neutral-500 mt-1 mb-6">
          Te enviamos un codigo de 6 digitos al correo de esta sesion.
        </p>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            readOnly
            disabled
            className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm text-neutral-600"
          />
          <p className="text-xs text-neutral-500">
            Este correo no se puede cambiar durante la verificacion.
          </p>
        </div>

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

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-neutral-400">codigo</span>
          </div>
        </div>

        <form onSubmit={onVerifyCode} className="space-y-4">
          <div className="grid grid-cols-6 gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(node) => {
                  inputRefs.current[index] = node;
                }}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                disabled={!isCodeSent || isSubmitting}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="h-12 w-full text-center rounded-xl border border-neutral-300 text-lg font-semibold text-neutral-950 outline-none focus:border-neutral-950 disabled:bg-neutral-100"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={!isCodeSent || !canVerify || isSubmitting}
            className="w-full rounded-xl bg-neutral-950 text-white py-2.5 text-sm font-medium hover:bg-neutral-800 transition disabled:opacity-60"
          >
            {isSubmitting ? "Validando..." : "Validar codigo"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onResendCode}
            disabled={
              !isCodeSent ||
              resendCooldown > 0 ||
              isSendingCode ||
              !hasValidLockedEmail
            }
            className="text-sm text-neutral-700 hover:text-neutral-950 disabled:text-neutral-400"
          >
            {isSendingCode ? "Reenviando..." : "Reenviar codigo"}
          </button>

          {isCodeSent && resendCooldown > 0 && (
            <p className="text-xs text-neutral-500 mt-1">
              Podras reenviar en {resendCooldown}s
            </p>
          )}

          {!hasValidLockedEmail && (
            <p className="text-xs text-red-600 mt-1">
              No se detecto un correo valido para esta verificacion. Vuelve a
              login.
            </p>
          )}

          {!isCodeSent && hasValidLockedEmail && (
            <p className="text-xs text-neutral-500 mt-1">
              Primero envia el codigo a tu email.
            </p>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-200">
          <Link
            href="/login"
            className="block w-full text-center rounded-xl border border-neutral-300 text-neutral-700 py-2.5 text-sm font-medium hover:bg-neutral-50 transition"
          >
            Volver a login
          </Link>
        </div>
      </div>
    </main>
  );
}
