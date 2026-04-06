"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { CompanyProvider } from "@/lib/company-context";
import { companiesApi } from "@/lib/api";
import { authService } from "@/features/auth/application/auth.service";

const CONNECTED_STATES = new Set(["connected", "open", "online"]);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isWhatsappConnected, setIsWhatsappConnected] = useState<boolean | null>(null);

  const isAdminRoute = pathname.startsWith("/dashboard/admin");

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const {
        data: { session },
      } = await authService.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      try {
        const data = await companiesApi.bootstrap();
        if (!isMounted) return;

        let connected: boolean | null = null;
        if (!data.is_admin && data.company?.id) {
          try {
            const status = await companiesApi.getStatus(data.company.id);
            connected =
              CONNECTED_STATES.has(String(status.state || "").trim().toLowerCase());
          } catch {
            connected = false;
          }
        }

        setIsAdmin(data.is_admin);
        setCompanyId(data.company?.id ?? null);
        setIsWhatsappConnected(connected);
        setIsReady(true);
      } catch {
        router.replace("/login");
      }
    }

    void bootstrap();

    const {
      data: { subscription },
    } = authService.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (!isReady) return;

    if (isAdminRoute && !isAdmin) {
      router.replace(companyId ? "/dashboard" : "/onboarding");
      return;
    }

    if (!isAdminRoute && !companyId) {
      if (isAdmin) {
        router.replace("/dashboard/admin/companies");
      } else {
        router.replace("/onboarding");
      }
      return;
    }

    if (!isAdminRoute && !isAdmin && companyId && isWhatsappConnected === false) {
      router.replace("/setup-whatsapp");
    }
  }, [companyId, isAdmin, isAdminRoute, isReady, isWhatsappConnected, router]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-500 text-sm">
        Cargando dashboard...
      </div>
    );
  }

  if (isAdminRoute) {
    return (
      <div className="flex min-h-screen bg-neutral-50/50">
        <Sidebar isAdmin={isAdmin} />
        <main className="flex-1 p-8 lg:p-10 overflow-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-500 text-sm">
        Redirigiendo...
      </div>
    );
  }

  return (
    <CompanyProvider companyId={companyId}>
      <div className="flex min-h-screen bg-neutral-50/50">
        <Sidebar isAdmin={isAdmin} />
        <main className="flex-1 p-8 lg:p-10 overflow-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </CompanyProvider>
  );
}
