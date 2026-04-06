import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "./supabase-browser";

const AUTH_CACHE_SAFETY_WINDOW_MS = 10_000;

let cachedAccessToken: string | null = null;
let cachedExpiresAt = 0;
let authCacheListenerInstalled = false;

function installAuthCacheListener() {
  if (authCacheListenerInstalled || typeof window === "undefined") {
    return;
  }

  authCacheListenerInstalled = true;

  // Keep the in-memory token cache in sync with Supabase auth state.
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT" || !session) {
      cachedAccessToken = null;
      cachedExpiresAt = 0;
      return;
    }

    cachedAccessToken = session.access_token ?? null;
    cachedExpiresAt = (session.expires_at ?? 0) * 1000;
  });
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  installAuthCacheListener();

  const now = Date.now();
  const tokenMissing = !cachedAccessToken;
  const tokenNearExpiry =
    cachedExpiresAt > 0 && cachedExpiresAt - AUTH_CACHE_SAFETY_WINDOW_MS <= now;

  if (tokenMissing || tokenNearExpiry) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    cachedAccessToken = session?.access_token ?? null;
    cachedExpiresAt = session?.expires_at ? session.expires_at * 1000 : 0;
  }

  if (!cachedAccessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${cachedAccessToken}`,
  };
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const headers = new Headers(options?.headers ?? {});
  const isFormData = options?.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const authHeaders = await getAuthHeaders();
  for (const [name, value] of Object.entries(authHeaders)) {
    headers.set(name, value);
  }

  if (API_URL.includes("ngrok")) {
    headers.set("ngrok-skip-browser-warning", "true");
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers,
      ...options,
    });
  } catch {
    throw new Error(
      `No se pudo conectar con el backend (${API_URL}). Verifica que la API esté levantada y NEXT_PUBLIC_API_URL sea correcto.`,
    );
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const body = await res.text();
    const preview = body.slice(0, 200).replace(/\s+/g, " ").trim();
    throw new Error(
      `Respuesta inesperada del backend: se esperaba JSON y llegó '${contentType || "sin content-type"}'. ${
        API_URL.includes("ngrok")
          ? "Si usas ngrok, verifica que la URL sea la túnel activo y no una página de advertencia."
          : ""
      }${preview ? ` Body: ${preview}` : ""}`,
    );
  }

  return res.json() as Promise<T>;
}
