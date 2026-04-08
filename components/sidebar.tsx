"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Wrench,
  Package,
  QrCode,
  MessageSquare,
  Calendar,
  ShoppingCart,
  LogOut,
  ShieldCheck,
  Ghost,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase-browser";
import type { Company, DashboardMode } from "@/lib/types";

const userNavItems = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/dashboard/agent", label: "Agente", icon: Ghost },
  { href: "/dashboard/instance", label: "Instancia de WhatsApp", icon: QrCode },
  { href: "/dashboard/tools", label: "Herramientas", icon: Wrench },
  { href: "/dashboard/catalog", label: "Catalogo", icon: Package },
  {
    href: "/dashboard/knowledge",
    label: "Base de Conocimiento",
    icon: Brain,
  },
  {
    href: "/dashboard/conversations",
    label: "Conversaciones",
    icon: MessageSquare,
  },
  { href: "/dashboard/appointments", label: "Citas", icon: Calendar },
  { href: "/dashboard/orders", label: "Pedidos", icon: ShoppingCart },
];

const adminNavItems = [
  {
    href: "/dashboard/admin",
    label: "Administracion global",
    icon: ShieldCheck,
  },
];

export function Sidebar({
  isAdmin = false,
  company = null,
  mode = "usuario",
}: {
  isAdmin?: boolean;
  company?: Company | null;
  mode?: DashboardMode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function onLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const isAdminMode = isAdmin && mode === "administrador";
  const items = isAdminMode ? adminNavItems : userNavItems;

  return (
    <aside className="w-[260px] min-h-screen bg-neutral-950 text-white flex flex-col animate-slide-in-left">
      <div className="px-6 py-6 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <Ghost className="w-5 h-5 text-neutral-950" />
          </div>
          <span className="text-lg font-semibold tracking-tight">AURA</span>
          <span className="text-xs text-neutral-500 tracking-widest uppercase">
            Asistente Universal de Respuesta Automatica
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
          Menu
        </p>
        {items.map(({ href, label, icon: Icon }, i) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-white text-neutral-950 shadow-lg shadow-white/10"
                  : "text-neutral-400 hover:bg-neutral-800/80 hover:text-white",
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Icon
                className={cn(
                  "w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110",
                  active
                    ? "text-neutral-950"
                    : "text-neutral-500 group-hover:text-white",
                )}
              />
              {label}
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-neutral-950 animate-pulse-dot" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-400">
            {company?.name?.slice(0, 2).toUpperCase() ?? ".."}
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-300">
              {isAdminMode ? "Modo administrador" : company?.name ?? "..."}
            </p>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-neutral-800 text-neutral-400">
              {isAdminMode ? "global" : company?.plan ?? "..."}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-neutral-700 px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-800 transition"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}
