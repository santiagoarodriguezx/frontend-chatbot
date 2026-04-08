"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RefreshCcw } from "lucide-react";
import { SWRConfig, useSWRConfig } from "swr";
import { Sidebar } from "@/components/sidebar";
import { CompanyProvider } from "@/lib/company-context";
import { companiesApi } from "@/lib/api";
import type { Company } from "@/lib/types";
import { authService } from "@/features/auth/application/auth.service";

const CONNECTED_STATES = new Set(["connected", "open", "online"]);
const DASHBOARD_SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 60000,
  errorRetryCount: 3,
  shouldRetryOnError: true,
};

function DashboardRefreshButton() {
  const { mutate } = useSWRConfig();
  const [refreshing, setRefreshing] = useState(false);

  async function refreshAll() {
    setRefreshing(true);
    try {
      await mutate(
        (key) => typeof key === "string" && key.length > 0,
        undefined,
        { revalidate: true },
      );
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => {
        void refreshAll();
      }}
      disabled={refreshing}
      className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
    >
      <RefreshCcw
        className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
      />
      {refreshing ? "Actualizando..." : "Refrescar datos"}
    </button>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isWhatsappConnected, setIsWhatsappConnected] = useState<
    boolean | null
  >(null);

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
            connected = CONNECTED_STATES.has(
              String(status.state || "")
                .trim()
                .toLowerCase(),
            );
          } catch {
            connected = false;
          }
        }

        setIsAdmin(data.is_admin);
        setCompany(data.company ?? null);
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

    if (
      !isAdminRoute &&
      !isAdmin &&
      companyId &&
      isWhatsappConnected === false
    ) {
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
      <SWRConfig value={DASHBOARD_SWR_CONFIG}>
        <div className="flex min-h-screen bg-neutral-50/50">
          <Sidebar isAdmin={isAdmin} company={company} />
          <main className="flex-1 overflow-auto p-8 lg:p-10">
            <div className="mx-auto max-w-7xl space-y-4">{children}</div>
          </main>
        </div>
      </SWRConfig>
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
    <SWRConfig value={DASHBOARD_SWR_CONFIG}>
      <CompanyProvider companyId={companyId}>
        <div className="flex min-h-screen bg-neutral-50/50">
          <Sidebar isAdmin={isAdmin} company={company} />
          <main className="flex-1 overflow-auto p-8 lg:p-10">
            <div className="mx-auto max-w-7xl space-y-4">
              <div className="flex justify-end">
                <DashboardRefreshButton />
              </div>
              {children}
            </div>
          </main>
        </div>
      </CompanyProvider>
    </SWRConfig>
  );
}
