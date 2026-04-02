"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirm) {
      setMessage("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setMessage("Contraseña actualizada correctamente. Redirigiendo...");
      setTimeout(() => {
        router.push("/login");
      }, 900);
    }, 1200);
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow w-full max-w-md">
        <h1 className="text-xl font-bold mb-4">Nueva contraseña</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-2 rounded"
          >
            {loading ? "Guardando..." : "Cambiar contraseña"}
          </button>

          {message && <p className="text-sm text-center">{message}</p>}
        </form>
      </div>
    </main>
  );
}
