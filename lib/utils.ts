import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "./supabase-browser";

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

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
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
