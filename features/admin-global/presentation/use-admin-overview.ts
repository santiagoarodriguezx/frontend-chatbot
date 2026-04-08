import useSWR from "swr";
import type { AdminOverview } from "@/lib/types";
import { adminGlobalService } from "../application/admin-global.service";

export function useAdminOverview() {
  const key = "admin-overview";

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<AdminOverview>(key, () => adminGlobalService.getOverview());

  async function refresh() {
    await mutate();
  }

  return {
    overview: data,
    error,
    isLoading,
    isValidating,
    refresh,
  };
}
