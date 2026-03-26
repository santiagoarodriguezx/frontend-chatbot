"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Wrench,
  Package,
  QrCode,
  BookOpen,
  MessageSquare,
  Calendar,
  ShoppingCart,
  LogOut,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase-browser";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/agent", label: "Agent", icon: Bot },
  { href: "/dashboard/instance", label: "WhatsApp Instance", icon: QrCode },
  { href: "/dashboard/tools", label: "Tools", icon: Wrench },
  { href: "/dashboard/catalog", label: "Catalog", icon: Package },
  { href: "/dashboard/knowledge", label: "Knowledge Base", icon: BookOpen },
  {
    href: "/dashboard/conversations",
    label: "Conversations",
    icon: MessageSquare,
  },
  { href: "/dashboard/appointments", label: "Appointments", icon: Calendar },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
];

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  async function onLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const items = [...navItems];
  if (isAdmin) {
    items.push({
      href: "/dashboard/admin",
      label: "Global Admin",
      icon: ShieldCheck,
    });
    items.push({
      href: "/dashboard/admin/companies",
      label: "Admin Companies",
      icon: Building2,
    });
  }

  return (
    <aside className="w-[260px] min-h-screen bg-neutral-950 text-white flex flex-col animate-slide-in-left">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <Bot className="w-5 h-5 text-neutral-950" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            AgentSaaS
          </span>
        </div>
      </div>

      {/* Nav */}
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

      {/* Footer */}
      <div className="px-5 py-4 border-t border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-400">
            AS
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-300">AgentSaaS</p>
            <p className="text-[10px] text-neutral-600">v1.0.0</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-neutral-700 px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-800 transition"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
