"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      render?: (
        container: HTMLElement,
        parameters: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => number;
      reset?: (widgetId?: number) => void;
      enterprise?: {
        render?: (
          container: HTMLElement,
          parameters: {
            sitekey: string;
            callback?: (token: string) => void;
            "expired-callback"?: () => void;
            "error-callback"?: () => void;
          },
        ) => number;
        reset?: (widgetId?: number) => void;
      };
    };
  }
}

type RecaptchaWidgetProps = {
  siteKey: string;
  resetKey?: number;
  onTokenChange: (token: string | null) => void;
};

const RECAPTCHA_SCRIPT_SRC = "https://www.google.com/recaptcha/api.js?render=explicit";

function getRecaptchaApi() {
  const render =
    window.grecaptcha?.render ?? window.grecaptcha?.enterprise?.render;
  const reset = window.grecaptcha?.reset ?? window.grecaptcha?.enterprise?.reset;
  return { render, reset };
}

export function RecaptchaWidget({
  siteKey,
  resetKey = 0,
  onTokenChange,
}: RecaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);
  const scriptListenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onTokenChange(null);

    const container = containerRef.current;
    if (!container || !siteKey) return;

    const renderWidget = (): boolean => {
      const { render } = getRecaptchaApi();
      if (typeof render !== "function" || widgetIdRef.current !== null) {
        return false;
      }

      widgetIdRef.current = render(container, {
        sitekey: siteKey,
        callback: (token: string) => onTokenChange(token),
        "expired-callback": () => onTokenChange(null),
        "error-callback": () => onTokenChange(null),
      });
      return true;
    };

    if (renderWidget()) {
      return;
    }

    const existingScript = document.querySelector(
      'script[src*="google.com/recaptcha/api.js"]',
    ) as HTMLScriptElement | null;

    const onLoad = () => {
      // Google script can load before API is fully initialized; retry briefly.
      const maxAttempts = 10;
      let attempts = 0;

      const tryRender = () => {
        attempts += 1;
        if (renderWidget() || attempts >= maxAttempts) {
          return;
        }
        window.setTimeout(tryRender, 100);
      };

      tryRender();
    };

    if (existingScript) {
      existingScript.addEventListener("load", onLoad);
      scriptListenerRef.current = () =>
        existingScript.removeEventListener("load", onLoad);

      // If the script is already loaded, try immediately.
      onLoad();
      return;
    }

    const script = document.createElement("script");
    script.src = RECAPTCHA_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", onLoad);
    document.head.appendChild(script);

    scriptListenerRef.current = () => script.removeEventListener("load", onLoad);

    return () => {
      scriptListenerRef.current?.();
      scriptListenerRef.current = null;
    };
  }, [onTokenChange, siteKey]);

  useEffect(() => {
    if (widgetIdRef.current === null) {
      return;
    }

    const { reset } = getRecaptchaApi();
    if (typeof reset !== "function") {
      return;
    }

    reset(widgetIdRef.current);
    onTokenChange(null);
  }, [onTokenChange, resetKey]);

  if (!siteKey) {
    return null;
  }

  return (
    <div className="space-y-1">
      <div ref={containerRef} />
      <p className="text-xs text-neutral-500">
        Completa el reCAPTCHA para continuar.
      </p>
    </div>
  );
}
