"use client";
import { createContext, useContext, ReactNode } from "react";

// In production this would come from Supabase Auth / a company selector.
// Using a simple context so every page can access companyId.
const CompanyContext = createContext<string>("");

export function CompanyProvider({
  companyId,
  children,
}: {
  companyId: string;
  children: ReactNode;
}) {
  return (
    <CompanyContext.Provider value={companyId}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany(): string {
  const id = useContext(CompanyContext);
  if (!id) throw new Error("useCompany must be used inside CompanyProvider");
  return id;
}
