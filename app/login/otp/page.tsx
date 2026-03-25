"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ClipboardEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { authService } from "@/features/auth/application/auth.service";

const OTP_LENGTH = 6;
const emptyOtp = Array.from({ length: OTP_LENGTH }, () => "");

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function LoginOtpPage() {
  const searchParams = useSearchParams();
  const prefilledEmail = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(prefilledEmail);
  const [otp, setOtp] = useState<string[]>(emptyOtp);
  const [isCodeSent, setIsCodeSent] = useState(Boolean(prefilledEmail));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(
    prefilledEmail ? 45 : 0,
  );
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!prefilledEmail) return;
    setEmail(prefilledEmail);
    setIsCodeSent(true);
    setResendCooldown(45);
    setOtp(emptyOtp);
    inputRefs.current[0]?.focus();
  }, [prefilledEmail]);

  useEffect(() => {
    if (prefilledEmail) return;

    let mounted = true;
    async function hydrateEmailFromSession() {
      const {
        data: { session },
      } = await authService.getSession();

      const sessionEmail = session?.user?.email;
      if (!mounted || !sessionEmail) return;

      setEmail(sessionEmail);
      setIsCodeSent(true);
      setResendCooldown(45);
      setOtp(emptyOtp);
      inputRefs.current[0]?.focus();
    }

    void hydrateEmailFromSession();

    return () => {
      mounted = false;
    };
  }, [prefilledEmail]);

  useEffect(() => {
    if (!isCodeSent || resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [isCodeSent, resendCooldown]);

  const otpValue = useMemo(() => otp.join(""), [otp]);

  const canVerify = otpValue.length === 6;

  function triggerCodeSend() {
    setIsCodeSent(true);
    setOtp(emptyOtp);
    setResendCooldown(45);
    inputRefs.current[0]?.focus();
  }

  function onResendCode() {
    if (!isCodeSent || resendCooldown > 0) return;
    if (!isValidEmail(email.trim())) return;

    triggerCodeSend();
    setResendMessage("Código reenviado correctamente.");
  }

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

  function onSendCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValidEmail(email.trim())) return;
    triggerCodeSend();
  }

  useEffect(() => {
    if (isCodeSent) return;
    if (!isValidEmail(email.trim())) return;
    triggerCodeSend();
  }, [email, isCodeSent]);

  useEffect(() => {
    if (!resendMessage) return;
    const timer = setTimeout(() => {
      setResendMessage(null);
    }, 2500);

    return () => {
      clearTimeout(timer);
    };
  }, [resendMessage]);

  async function onVerifyCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canVerify) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-sm p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
          Login por código
        </p>

        <h1 className="text-2xl font-bold text-neutral-950">Verificación OTP</h1>
        <p className="text-sm text-neutral-500 mt-1 mb-6">
          Ingresa tu email para recibir un código de 6 dígitos.
        </p>

        <form onSubmit={onSendCode} className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setIsCodeSent(false);
                setResendMessage(null);
                setEmail(e.target.value);
              }}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950"
              placeholder="you@company.com"
            />
          </div>

          <p className="text-xs text-neutral-500">
            El código se envía automáticamente al detectar un email válido.
          </p>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-neutral-400">código</span>
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
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="h-12 w-full text-center rounded-xl border border-neutral-300 text-lg font-semibold text-neutral-950 outline-none focus:border-neutral-950"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={!isCodeSent || !canVerify || isSubmitting}
            className="w-full rounded-xl bg-neutral-950 text-white py-2.5 text-sm font-medium hover:bg-neutral-800 transition disabled:opacity-60"
          >
            {isSubmitting ? "Validando..." : "Validar código"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onResendCode}
            disabled={!isCodeSent || resendCooldown > 0}
            className="text-sm text-neutral-700 hover:text-neutral-950 disabled:text-neutral-400"
          >
            Reenviar código
          </button>
          {isCodeSent && resendCooldown > 0 && (
            <p className="text-xs text-neutral-500 mt-1">
              Podrás reenviar en {resendCooldown}s
            </p>
          )}
          {!isCodeSent && (
            <p className="text-xs text-neutral-500 mt-1">
              Primero envía el código a tu email.
            </p>
          )}
          {resendMessage && (
            <p className="text-xs text-green-700 mt-1">{resendMessage}</p>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-200">
          <Link
            href="/login"
            className="block w-full text-center rounded-xl border border-neutral-300 text-neutral-700 py-2.5 text-sm font-medium hover:bg-neutral-50 transition"
          >
            Volver a login con contraseña
          </Link>
        </div>
      </div>
    </main>
  );
}
