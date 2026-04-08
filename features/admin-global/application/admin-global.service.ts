import type {
  AdminCompanyCreateInput,
  AdminCompanyUpdateInput,
  AdminOverview,
  AdminUser,
  AdminUserCreateInput,
  AdminUserUpdateInput,
  Company,
} from "@/lib/types";
import { adminGlobalRepository } from "../data/admin-global.repository";

const CONNECTED_STATES = new Set(["connected", "open", "online"]);

function normalizeNullableText(value?: string | null): string | null {
  if (value == null) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeCompanyCreateInput(
  draft: AdminCompanyCreateInput,
): AdminCompanyCreateInput {
  return {
    name: draft.name.trim(),
    slug: draft.slug.trim().toLowerCase(),
    plan: draft.plan ?? "free",
    whatsapp_number: normalizeNullableText(draft.whatsapp_number),
    whatsapp_instance_name: normalizeNullableText(draft.whatsapp_instance_name),
  };
}

function normalizeCompanyUpdateInput(
  draft: AdminCompanyUpdateInput,
): AdminCompanyUpdateInput {
  return {
    name: draft.name?.trim(),
    plan: draft.plan,
    is_active: draft.is_active,
    whatsapp_number: normalizeNullableText(draft.whatsapp_number),
    whatsapp_instance_name: normalizeNullableText(draft.whatsapp_instance_name),
  };
}

function normalizeUserCreateInput(draft: AdminUserCreateInput): AdminUserCreateInput {
  const payload: AdminUserCreateInput = {
    email: draft.email.trim().toLowerCase(),
    role: draft.role,
    is_active: draft.is_active ?? true,
  };

  if (draft.password && draft.password.trim()) {
    payload.password = draft.password.trim();
  }

  if (draft.company_ids && draft.company_ids.length > 0) {
    payload.company_ids = draft.company_ids;
  }

  return payload;
}

function normalizeUserUpdateInput(draft: AdminUserUpdateInput): AdminUserUpdateInput {
  const payload: AdminUserUpdateInput = {};

  if (draft.role) payload.role = draft.role;
  if (typeof draft.is_active === "boolean") payload.is_active = draft.is_active;
  if (draft.company_ids) payload.company_ids = draft.company_ids;

  return payload;
}

async function countConnectedInstances(companies: Company[]): Promise<number> {
  const companiesWithInstance = companies.filter((company) =>
    Boolean(company.whatsapp_instance_name?.trim()),
  );

  if (companiesWithInstance.length === 0) {
    return 0;
  }

  const statusResults = await Promise.allSettled(
    companiesWithInstance.map((company) =>
      adminGlobalRepository.getCompanyInstanceStatus(company.id),
    ),
  );

  let connected = 0;

  for (const result of statusResults) {
    if (result.status !== "fulfilled") {
      continue;
    }

    const state = String(result.value.state || "")
      .trim()
      .toLowerCase();

    if (CONNECTED_STATES.has(state)) {
      connected += 1;
    }
  }

  return connected;
}

function countByPlan(companies: Company[]): Record<string, number> {
  const summary: Record<string, number> = {};

  for (const company of companies) {
    summary[company.plan] = (summary[company.plan] ?? 0) + 1;
  }

  return summary;
}

export const adminGlobalService = {
  listCompanies(): Promise<Company[]> {
    return adminGlobalRepository.listCompanies();
  },

  createCompany(draft: AdminCompanyCreateInput): Promise<Company> {
    const payload = normalizeCompanyCreateInput(draft);
    return adminGlobalRepository.createCompany(payload);
  },

  updateCompany(companyId: string, draft: AdminCompanyUpdateInput): Promise<Company> {
    const payload = normalizeCompanyUpdateInput(draft);
    return adminGlobalRepository.updateCompany(companyId, payload);
  },

  deleteCompany(companyId: string): Promise<void> {
    return adminGlobalRepository.deleteCompany(companyId);
  },

  async getOverview(): Promise<AdminOverview> {
    const companies = await adminGlobalRepository.listCompanies();
    const connectedInstances = await countConnectedInstances(companies);
    const companiesWithInstance = companies.filter((company) =>
      Boolean(company.whatsapp_instance_name?.trim()),
    ).length;

    return {
      generated_at: new Date().toISOString(),
      total_companies: companies.length,
      active_companies: companies.filter((item) => item.is_active).length,
      inactive_companies: companies.filter((item) => !item.is_active).length,
      connected_instances: connectedInstances,
      disconnected_instances: Math.max(companiesWithInstance - connectedInstances, 0),
      companies_by_plan: countByPlan(companies),
      recent_companies: companies.slice(0, 8),
    };
  },

  listUsers(): Promise<AdminUser[]> {
    return adminGlobalRepository.listUsers();
  },

  createUser(draft: AdminUserCreateInput): Promise<AdminUser> {
    const payload = normalizeUserCreateInput(draft);
    return adminGlobalRepository.createUser(payload);
  },

  updateUser(userId: string, draft: AdminUserUpdateInput): Promise<AdminUser> {
    const payload = normalizeUserUpdateInput(draft);
    return adminGlobalRepository.updateUser(userId, payload);
  },

  deleteUser(userId: string): Promise<void> {
    return adminGlobalRepository.deleteUser(userId);
  },
};
