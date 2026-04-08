import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white border border-neutral-200 rounded-3xl shadow-sm p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
          AgentSaaS
        </p>
        <h1 className="text-4xl font-bold text-neutral-950 tracking-tight">
          Crea y administra tu agente de ventas por WhatsApp
        </h1>
        <p className="text-neutral-600 mt-4 text-sm max-w-xl mx-auto">
          Regístrate para configurar tu empresa y empezar a operar con tu
          dashboard en minutos.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login?mode=signup"
            className="rounded-xl bg-neutral-950 text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 transition"
          >
            Registrarme
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-neutral-300 text-neutral-700 px-5 py-2.5 text-sm font-medium hover:bg-neutral-50 transition"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </div>
    </main>
  );
}
